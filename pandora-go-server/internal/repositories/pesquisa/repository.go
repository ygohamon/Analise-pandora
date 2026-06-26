// Package pesquisa implementa repositories exclusivos das telas novas de Pesquisa.
//
// UseCases chamam este pacote para consultas especificas ainda sem dominio
// proprio. Quando uma consulta passar a ser reaproveitada pelo integrado ou por
// outras telas, ela deve migrar para um repository de dominio/fonte.
// O repository nao decide permissao, nao registra rota e nao monta resposta HTTP.
package repositories

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/integrations/gpu"
	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/integrations/tjsp"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/types"
)

// Repository consulta fontes locais e externas usadas pelas telas de pesquisa.
type Repository struct {
	db     *sql.DB
	models modelconfig.Registry
	gpu    *gpu.Client
	tjsp   *tjsp.Client
}

// NewRepository cria o repository chamado pelos usecases de pesquisa.
func NewRepository(db *sql.DB, models modelconfig.Registry) Repository {
	gpuModel, _ := models.Get("WEBSERVICE_GPU")
	tjspModel, _ := models.Get("WEBSERVICE_CAEX")
	return Repository{
		db:     db,
		models: models,
		gpu:    gpu.NewClient(gpuModel),
		tjsp:   tjsp.NewClient(tjspModel),
	}
}

func (r Repository) GPUSimplificadoCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	adv, _ := r.gpu.Post(ctx, "/api/advogado/consulta-simplificada", map[string]any{
		"documentos":     []string{cpf},
		"force_refresh":  false,
		"page":           0,
		"size":           5,
		"sort_by":        "atendimento.dataEHoraAgenda",
		"sort_direction": "ASC",
	})
	preso, _ := r.gpu.Post(ctx, "/api/presos/consulta-simplificada", map[string]any{
		"rg":                cpf,
		"force_refresh":     false,
		"include_tatuagens": false,
	})
	return mergePesquisaRows(
		mappers.GPUSimplificadoAdvogado(adv, r.sigla("WEBSERVICE_GPU", "GPU")),
		mappers.GPUSimplificadoPreso(preso, r.sigla("WEBSERVICE_GPU", "GPU")),
	), nil
}

func (r Repository) GPUSimplificadoNome(ctx context.Context, nome string) ([]map[string]any, error) {
	adv, _ := r.gpu.Post(ctx, "/api/advogado/consulta-simplificada", map[string]any{
		"documentos":     []string{nome},
		"force_refresh":  false,
		"page":           0,
		"size":           5,
		"sort_by":        "atendimento.dataEHoraAgenda",
		"sort_direction": "ASC",
	})
	preso, _ := r.gpu.Post(ctx, "/api/consultar_preso_resumido_por_nome", map[string]any{
		"nome":              nome,
		"force_refresh":     false,
		"include_tatuagens": false,
	})
	return mergePesquisaRows(
		mappers.GPUSimplificadoAdvogado(adv, r.sigla("WEBSERVICE_GPU", "GPU")),
		mappers.GPUSimplificadoPreso(preso, r.sigla("WEBSERVICE_GPU", "GPU")),
	), nil
}

func (r Repository) GPUSimplificadoRG(ctx context.Context, rg string) ([]map[string]any, error) {
	preso, _ := r.gpu.Post(ctx, "/api/presos/consulta-simplificada", map[string]any{
		"rg":                rg,
		"force_refresh":     false,
		"include_tatuagens": false,
	})
	return mappers.GPUSimplificadoPreso(preso, r.sigla("WEBSERVICE_GPU", "GPU")), nil
}

func (r Repository) GPUSimplificadoOAB(ctx context.Context, oab string) ([]map[string]any, error) {
	adv, _ := r.gpu.Post(ctx, "/api/advogado/consulta-simplificada", map[string]any{
		"documentos":     []string{oab},
		"force_refresh":  false,
		"page":           0,
		"size":           5,
		"sort_by":        "atendimento.dataEHoraAgenda",
		"sort_direction": "ASC",
	})
	return mappers.GPUSimplificadoAdvogado(adv, r.sigla("WEBSERVICE_GPU", "GPU")), nil
}

func (r Repository) GPUDetalhadoCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	adv, _ := r.gpu.Post(ctx, "/api/advogado/consulta-completa", map[string]any{
		"documentos":    []string{cpf},
		"force_refresh": false,
	})
	preso, _ := r.gpu.Post(ctx, "/api/presos/consulta-completa", map[string]any{
		"rg":                cpf,
		"force_refresh":     false,
		"include_tatuagens": true,
	})
	return mergePesquisaRows(
		mappers.GPUDetalhadoAdvogado(adv, cpf, r.sigla("WEBSERVICE_GPU", "GPU")),
		mappers.GPUDetalhadoPreso(preso, cpf, r.sigla("WEBSERVICE_GPU", "GPU")),
	), nil
}

func (r Repository) GPUAtendimentosAdvogado(ctx context.Context, advogadoID string, page string, size string) (map[string]any, error) {
	return r.gpu.Post(ctx, "/api/advogado/consultar-atendimentos", map[string]any{
		"advogado_id":   advogadoID,
		"force_refresh": false,
		"page":          page,
		"size":          size,
	})
}

func (r Repository) Presos(ctx context.Context, tipo string, valor string, detalhado bool) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, source := range r.presoSources(tipo, valor, detalhado) {
		rows, err := r.query(ctx, source.query, source.args...)
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

func (r Repository) Arma(ctx context.Context, campo string, valor string, cpfUsuario string) ([]map[string]any, error) {
	model, ok := r.models.Get("INFOSEG")
	if !ok || !model.Ativado {
		return []map[string]any{}, nil
	}
	baseURL := strings.TrimRight(modelVar(model.Vars, "INFOSEG_URL_API_HOM"), "/")
	if baseURL == "" {
		baseURL = strings.TrimRight(modelVar(model.Vars, "INFOSEG_URL_API_PROD"), "/")
	}
	if baseURL == "" {
		return []map[string]any{}, nil
	}
	body := map[string]string{}
	if campo == "serie" {
		body["nrSerieArmaFogo"] = valor
	} else {
		body["nrSinarmArmaFogo"] = valor
	}
	payload, err := simplePostJSON(ctx, model, baseURL+"/integracao-procedimentos/v1/procedimentos/lista", body, map[string]string{
		"sinesp-cpf-usuario-requisitante": cpfUsuario,
	})
	if err != nil || payload == nil {
		return []map[string]any{}, nil
	}
	return []map[string]any{{"response": payload, "fonte": r.sigla("INFOSEG", "INFOSEG")}}, nil
}

func (r Repository) Folha(ctx context.Context, esfera string, cdOrgao string, mes string, ano string) ([]map[string]any, error) {
	key := "SM_FOLHAPAGAMENTO"
	if esfera == "estadual" {
		key = "SE_FOLHAPAGAMENTO"
	}
	table, ok := r.table("BD_SAGRES", key)
	if !ok {
		return []map[string]any{}, nil
	}
	query := `SELECT TOP 1000 nome_servidor as nome, cpf_servidor as cpf, matricula, cargo, poder, vinculo,
valor_remuneracao_total as vlBruto, data_admissao as dtAdmissao, ` + sqlLiteral(r.sigla("BD_SAGRES", "TCEPB")) + ` as fonte
FROM ` + table + `
WHERE cod_orgao=@CDORGAO AND ano=@ANO AND mes=@MES`
	return r.query(ctx, query, sql.Named("CDORGAO", cdOrgao), sql.Named("ANO", ano), sql.Named("MES", mes))
}

func (r Repository) Orgaos(ctx context.Context, orgao string) ([]map[string]any, error) {
	table, ok := r.table("BD_SAGRES", "CODIGO_ORGAO")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `;WITH LOTACAO(CDORGAO, ORGAO, ESFERA, MUNICIPIO, CDIBGE) AS (
	SELECT cd_Orgao, de_Orgao, cd_Origem, no_Municipio, cd_Ibge
	FROM ` + table + `
	WHERE id_Orgao IN (
		SELECT MAX(id_Orgao)
		FROM ` + table + `
		WHERE de_orgao LIKE @ORGAO
		GROUP BY de_Orgao, cd_Origem, no_Municipio, cd_Ibge
	)
)
SELECT cdOrgao, orgao, esfera FROM LOTACAO`
	return r.query(ctx, query, sql.Named("ORGAO", "%"+orgao+"%"))
}

func (r Repository) ImoveisCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.imoveis(ctx, cpf)
}

func (r Repository) ImoveisCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return r.imoveis(ctx, cnpj)
}

func (r Repository) Investigados(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, source := range r.investigadoSources(tipo, valor) {
		rows, err := r.query(ctx, source.query, source.args...)
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

func (r Repository) Prontuarios(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	table, ok := r.table("BD_LINCE", "PRONTUARIO")
	if !ok {
		table, ok = r.table("BD_PRONTUARIO", "LINCE")
	}
	if !ok {
		return []map[string]any{}, nil
	}
	column := map[string]string{"cpf": "CPF", "nome": "NOME", "rg": "RG", "alcunha": "ALCUNHA"}[tipo]
	if column == "" {
		return []map[string]any{}, nil
	}
	operator := "="
	arg := valor
	if tipo == "nome" || tipo == "alcunha" {
		operator = "LIKE"
		arg = "%" + valor + "%"
	}
	query := `SELECT TOP 1000 *, ` + sqlLiteral(r.sigla("BD_LINCE", "LINCE")) + ` as fonte FROM ` + table + ` WHERE ` + column + ` ` + operator + ` @VALOR`
	return r.query(ctx, query, sql.Named("VALOR", arg))
}

func (r Repository) FichaSuja(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	table, ok := r.table("BD_FICHA_SUJA", "ELEITORAL_FS")
	if !ok {
		return []map[string]any{}, nil
	}
	column := map[string]string{"cpf": "cpf", "rg": "rg", "nome": "nome_requerido", "nomemae": "nome_mae", "titulo": "titulo_eleitoral"}[tipo]
	if column == "" {
		return []map[string]any{}, nil
	}
	operator := "="
	arg := valor
	if tipo == "nome" || tipo == "nomemae" {
		operator = "LIKE"
		arg = "%" + valor + "%"
	}
	query := `SELECT DISTINCT TOP 1000 fs.cpf AS cpf, fs.nome_requerido AS nome, fs.nome_mae AS nomeMae, ` + sqlLiteral(r.sigla("BD_FICHA_SUJA", "FS")) + ` as fonte
FROM ` + table + ` fs
WHERE fs.` + column + ` ` + operator + ` @VALOR AND fs.numero_processo IS NOT NULL AND fs.numero_processo <> '-'`
	return r.query(ctx, query, sql.Named("VALOR", arg))
}

func (r Repository) ProcessoCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	rows, err := r.tjsp.Processos(ctx, "cpf", cpf)
	return addFonte(rows, r.sigla("TJSP", "TJSP")), err
}

func (r Repository) ProcessoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	rows, err := r.tjsp.Processos(ctx, "cnpj", cnpj)
	return addFonte(rows, r.sigla("TJSP", "TJSP")), err
}

func (r Repository) ProcessoNumero(ctx context.Context, processo string) ([]map[string]any, error) {
	rows, err := r.tjsp.Processos(ctx, "processos", processo)
	return addFonte(rows, r.sigla("TJSP", "TJSP")), err
}

type sqlSource struct {
	query string
	args  []any
}

func (r Repository) presoSources(tipo string, valor string, detalhado bool) []sqlSource {
	sources := []sqlSource{}
	if table, ok := r.table("SISDEPENBR", "BR"); ok {
		selectCols := `cpf, UPPER(nome) as nome, UPPER(alcunha) as vulgo, rg, cnc, cadeia, situacao, ` + sqlLiteral(r.sigla("SISDEPENBR", "DEB")) + ` as fonte`
		if detalhado {
			selectCols = `cpf, UPPER(nome) as nome, UPPER(alcunha) as vulgo, rg, cnc, cadeia, situacao, cadeiaUF, cadeiaAmbito,
tipoRecolhimento, regimePrisional, UPPER(nomeApresentacao) as nomeApresentacao, UPPER(nomeSocial) as nomeSocial,
sexo, nacionalidade, naturalidadeUF, naturalidade, escolaridade, rgOrgaoEmissor, rgUf, rgDataExpedicao,
dataInformacao, tipificacao, foto, ` + sqlLiteral(r.sigla("SISDEPENBR", "DEB")) + ` as fonte`
		}
		if where, arg := prisonWhere("BR", tipo, valor); where != "" {
			sources = append(sources, sqlSource{query: `SELECT TOP 1000 ` + selectCols + ` FROM ` + table + ` WHERE ` + where, args: []any{sql.Named("VALOR", arg)}})
		}
	}
	if table, ok := r.table("SISDEPEN", "SIS"); ok {
		selectCols := `NumCPF as cpf, UPPER(NomePreso) as nome, NumRG as rg, DataNascimento as dataNascimento, NomeUnidPenal as nomeUnidPenal, ` + sqlLiteral(r.sigla("SISDEPEN", "DEP")) + ` as fonte`
		if detalhado {
			selectCols += `, NomeMae as nomeMae, NomePai as nomePai, TitEleitor as tituloEleitor, Naturalidade as naturalidade, Estado as estado, Cidade as cidade, Bairro as bairro, NumCEP as cep, Sexo as sexo, EndLogradouro as logradouro, EndNum as numero, EndComplemento as complemento`
		}
		if where, arg := prisonWhere("SIS", tipo, valor); where != "" {
			sources = append(sources, sqlSource{query: `SELECT TOP 1000 ` + selectCols + ` FROM ` + table + ` WHERE ` + where, args: []any{sql.Named("VALOR", arg)}})
		}
	}
	return sources
}

func prisonWhere(source string, tipo string, valor string) (string, string) {
	switch tipo {
	case "cpf":
		if source == "SIS" {
			return "NumCPF=@VALOR", valor
		}
		return "cpf=@VALOR", valor
	case "cnc":
		if source == "BR" {
			return "cnc=@VALOR", valor
		}
	case "nome":
		if source == "SIS" {
			return "NomePreso LIKE @VALOR", "%" + valor + "%"
		}
		return "nome LIKE @VALOR", "%" + valor + "%"
	case "vulgo":
		if source == "BR" {
			return "alcunha LIKE @VALOR", "%" + valor + "%"
		}
	case "nomemae":
		if source == "SIS" {
			return "NomeMae LIKE @VALOR", "%" + valor + "%"
		}
	}
	return "", ""
}

func (r Repository) investigadoSources(tipo string, valor string) []sqlSource {
	sources := []sqlSource{}
	if pf, ok := r.table("BD_GAECO", "ALVOS_PF"); ok {
		where := map[string]string{
			"cpf":      "A.CPF=@VALOR OR A.DOCUMENTO=@VALOR",
			"nome":     "A.NOME LIKE @VALOR",
			"alcunha":  "A.ALCUNHA LIKE @VALOR",
			"operacao": "O.OPERACAO LIKE @VALOR",
		}[tipo]
		if where != "" {
			sources = append(sources, sqlSource{query: r.investigadoQuery(pf, where), args: []any{sql.Named("VALOR", investigadoArg(tipo, valor))}})
		}
	}
	if pj, ok := r.table("BD_GAECO", "ALVOS_PJ"); ok {
		where := map[string]string{
			"cnpj":        "A.CNPJ=@VALOR OR A.DOCUMENTO=@VALOR",
			"razaosocial": "A.RAZAO_SOCIAL LIKE @VALOR OR A.NOME LIKE @VALOR",
			"operacao":    "O.OPERACAO LIKE @VALOR",
		}[tipo]
		if where != "" {
			sources = append(sources, sqlSource{query: r.investigadoQuery(pj, where), args: []any{sql.Named("VALOR", investigadoArg(tipo, valor))}})
		}
	}
	return sources
}

func (r Repository) investigadoQuery(table string, where string) string {
	operacoes, _ := r.table("BD_GAECO", "OPERACOES")
	join := ""
	selectOperacao := "CAST(NULL AS varchar(255)) as operacao"
	if operacoes != "" {
		join = " LEFT JOIN " + operacoes + " O ON A.ID_OPERACAO=O.ID"
		selectOperacao = "O.OPERACAO as operacao"
	}
	return `SELECT TOP 1000 A.*, ` + selectOperacao + `, ` + sqlLiteral(r.sigla("BD_GAECO", "GAECO")) + ` as fonte FROM ` + table + ` A` + join + ` WHERE ` + where
}

func investigadoArg(tipo string, valor string) string {
	if tipo == "nome" || tipo == "alcunha" || tipo == "razaosocial" || tipo == "operacao" {
		return "%" + valor + "%"
	}
	return valor
}

func (r Repository) imoveis(ctx context.Context, documento string) ([]map[string]any, error) {
	out := []map[string]any{}
	if doi, ok := r.table("BD_DOI", "DOI"); ok {
		rows, err := r.query(ctx, `SELECT TOP 1000 *, 'BD_DOI' as fonte FROM `+doi+`
WHERE CPF_CNPJ_ADQUIRENTE=@DOC OR CPF_CNPJ_ALIENANTE=@DOC OR CNPJ_CARTORIO=@DOC`, sql.Named("DOC", documento))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if fn, ok := r.table("BD_PREFEITURA", "FUNCAO_BD_STAR"); ok {
		rows, err := r.query(ctx, `SELECT TOP 1000 proprietarioAnterior, cpfCnPJAnterior, nome, cpfCnpj,
tipoLogradouro, logradouro, numero, bloco, apto, bairro, cep, natureza, transacao, valorMercado,
valorAvaliacao, areaPrivTotal, valorMetro, dtAvaliacao, dtLancamento, fonte
FROM `+fn+`(@DOC)
ORDER BY proprietarioAnterior, dtLancamento`, sql.Named("DOC", documento))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

func simplePostJSON(ctx context.Context, model modelconfig.Model, endpoint string, body any, headers map[string]string) (map[string]any, error) {
	raw, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	for key, value := range headers {
		if strings.TrimSpace(value) != "" {
			req.Header.Set(key, value)
		}
	}
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "infoseg", http.MethodPost, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("infoseg status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func (r Repository) query(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	if r.db == nil {
		return []map[string]any{}, nil
	}
	return rowsToMaps(r.db.QueryContext(ctx, query, args...))
}

func (r Repository) table(modelName string, key string) (string, bool) {
	return r.models.Table(modelName, key)
}

func (r Repository) sigla(modelName string, fallback string) string {
	model, ok := r.models.Get(modelName)
	if !ok || strings.TrimSpace(model.Sigla) == "" {
		return fallback
	}
	return strings.TrimSpace(model.Sigla)
}

func rowsToMaps(rows *sql.Rows, err error) ([]map[string]any, error) {
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	columns, err := rows.Columns()
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	out := []map[string]any{}
	for rows.Next() {
		values := make([]any, len(columns))
		dest := make([]any, len(columns))
		for i := range values {
			dest[i] = &values[i]
		}
		if err := rows.Scan(dest...); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item := map[string]any{}
		for i, column := range columns {
			switch value := values[i].(type) {
			case nil:
				item[column] = nil
			case []byte:
				item[column] = string(value)
			case time.Time:
				item[column] = value.Format("2006-01-02T15:04:05")
			default:
				item[column] = value
			}
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func mergePesquisaRows(groups ...[]map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, rows := range groups {
		out = append(out, rows...)
	}
	return out
}

func addFonte(rows []map[string]any, fonte string) []map[string]any {
	for _, row := range rows {
		if _, ok := row["fonte"]; !ok {
			row["fonte"] = fonte
		}
	}
	return rows
}

func sqlLiteral(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "''") + "'"
}

func modelVar(vars map[string]any, key string) string {
	text := strings.TrimSpace(fmt.Sprint(vars[key]))
	if text == "<nil>" {
		return ""
	}
	return text
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
