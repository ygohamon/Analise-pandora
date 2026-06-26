package apps

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

// Repository executa consultas de leitura usadas pelas telas em dashboard/apps.
type Repository struct {
	db     *sql.DB
	models modelconfig.Registry
}

// NewRepository cria o repository chamado pelo AppsUseCase.
func NewRepository(db *sql.DB, models modelconfig.Registry) Repository {
	return Repository{db: db, models: models}
}

func (r Repository) IntegraPromotorias(ctx context.Context, promotoria string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"INTEGRA", "PROMOTORIAS"}, {"BD_INTEGRA", "PROMOTORIAS"}}, []string{"promotoria", "nome", "descricao"}, promotoria, true)
}

func (r Repository) IntegraDemandas(ctx context.Context, email string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"INTEGRA", "REQUISICOES"}, {"BD_INTEGRA", "REQUISICOES"}}, []string{"email", "solicitante", "usuario"}, email, false)
}

func (r Repository) IntegraCadastro(ctx context.Context, payload map[string]any) ([]map[string]any, error) {
	if r.db == nil {
		return []map[string]any{{"status": "recebido"}}, nil
	}
	// Primeira entrega: preserva a rota POST usada pelo front sem implementar workflow de anexos.
	return []map[string]any{{"status": "recebido", "observacao": "cadastro integra pendente de workflow completo"}}, nil
}

func (r Repository) CacaFantasmasOrgao(ctx context.Context, orgao string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"BD_SAGRES", "CODIGO_ORGAO"}}, []string{"de_orgao", "orgao", "nome"}, orgao, true)
}

func (r Repository) CacaFantasmasAnalise(ctx context.Context, cdugestora string, filtros map[string]string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"BD_SAGRES", "TIPOLOGIAS_CACAFANTASMAS"}, {"BD_SAGRES", "CACAFANTASMAS"}}, []string{"cd_ugestora", "cdugestora", "cdUgestora"}, cdugestora, false)
}

func (r Repository) DNACNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"BD_DNA", "PESSOA_JURIDICA"}, {"BD_DNA", "EMPRESA"}, {"BD_RECEITA", "EMPRESA"}}, []string{"cnpj", "CNPJ"}, utils.OnlyDigits(cnpj), false)
}

func (r Repository) PainelCovidUF(ctx context.Context, uf string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"PAINELCOVID", "TABELA_GERAL"}, {"BD_PAINELCOVID", "TABELA_GERAL"}}, []string{"uf", "UF"}, strings.ToUpper(uf), false)
}

func (r Repository) INPOrgao(ctx context.Context, query map[string]string) ([]map[string]any, error) {
	orgao := firstNonEmpty(query["orgao"], query["cdugestora"], query["cdorgao"])
	return r.queryAny(ctx, []sourceRef{{"BD_SAGRES", "NEPOTISMO"}, {"BD_SAGRES", "INP"}}, []string{"cd_ugestora", "cdugestora", "orgao", "cdorgao"}, orgao, true)
}

func (r Repository) INPCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.queryAny(ctx, []sourceRef{{"BD_SAGRES", "NEPOTISMO"}, {"BD_SAGRES", "INP"}}, []string{"cpf", "CPF", "cpf_servidor"}, utils.OnlyDigits(cpf), false)
}

func (r Repository) MapaConsumo(ctx context.Context, query map[string]string) ([]map[string]any, error) {
	cpf := utils.OnlyDigits(firstNonEmpty(query["cpf"], query["documento"]))
	return r.queryAny(ctx, []sourceRef{{"BD_SEFAZ", "MAPA_CONSUMO"}, {"BD_SAGRES", "MAPA_CONSUMO"}}, []string{"cpf", "documento", "cpf_cnpj"}, cpf, false)
}

func (r Repository) Relacionamentos(ctx context.Context, tipo string, valor string, query map[string]string) ([]map[string]any, error) {
	switch tipo {
	case "lista":
		return r.queryAny(ctx, []sourceRef{{"BD_RELACIONAMENTOS", "RELACIONAMENTOS"}, {"BD_RECEITA", "PARENTESCO"}}, []string{"cpf", "cnpj", "documento"}, valor, false)
	case "pessoa":
		return r.queryAny(ctx, []sourceRef{{"BD_RELACIONAMENTOS", "PESSOA"}, {"BD_RECEITA", "PARENTESCO"}}, []string{"cpf", "CPF"}, utils.OnlyDigits(query["cpf"]), false)
	case "telefone":
		return r.queryAny(ctx, []sourceRef{{"BD_RELACIONAMENTOS", "TELEFONE"}, {"BD_RECEITA", "TELEFONE"}}, []string{"telefone", "numero"}, utils.OnlyDigits(query["telefone"]), false)
	case "empresa":
		return r.queryAny(ctx, []sourceRef{{"BD_RELACIONAMENTOS", "EMPRESA"}, {"BD_RECEITA", "EMPRESA"}}, []string{"cnpj", "CNPJ"}, utils.OnlyDigits(query["cnpj"]), false)
	case "orgao":
		return r.queryAny(ctx, []sourceRef{{"BD_RELACIONAMENTOS", "ORGAO"}, {"BD_SAGRES", "CODIGO_ORGAO"}}, []string{"cdugestora", "cd_ugestora", "cdorgao"}, firstNonEmpty(query["cdugestora"], query["cdorgao"]), false)
	case "endereco":
		return r.queryAny(ctx, []sourceRef{{"BD_RELACIONAMENTOS", "ENDERECO"}, {"BD_RECEITA", "ENDERECO"}}, []string{"logradouro", "endereco"}, query["endereco"], true)
	default:
		return []map[string]any{}, nil
	}
}

func (r Repository) Faccoes(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	refs := []sourceRef{{"FACCOES_APP", "FACCIONADO"}, {"FACCOES", "FACCIONADO"}, {"BD_FACCOES", "FACCIONADO"}, {"FACCOES", "FACCOES"}}
	switch tipo {
	case "lista":
		return r.queryAll(ctx, []sourceRef{{"FACCOES_APP", "FACCAO"}, {"FACCOES", "FACCOES"}, {"BD_FACCOES", "FACCOES"}})
	case "membros":
		return r.queryAny(ctx, refs, []string{"id_faccao", "idFaccao", "ID_FACCAO"}, valor, false)
	case "imagens":
		return r.queryAny(ctx, []sourceRef{{"FACCOES_APP", "IMAGENS"}, {"FACCOES", "IMAGENS"}, {"BD_FACCOES", "IMAGENS"}}, []string{"cpf", "CPF"}, utils.OnlyDigits(valor), false)
	case "semvalidacao":
		return r.queryAll(ctx, []sourceRef{{"FACCOES_APP", "FACCOES_SEM_VALIDACAO"}, {"FACCOES", "FACCOES_SEM_VALIDACAO"}, {"BD_FACCOES", "FACCOES_SEM_VALIDACAO"}})
	case "faccionados_semvalidacao":
		return r.queryAll(ctx, []sourceRef{{"FACCOES_APP", "FACCIONADOS_SEM_VALIDACAO"}, {"FACCOES", "FACCIONADOS_SEM_VALIDACAO"}, {"BD_FACCOES", "FACCIONADOS_SEM_VALIDACAO"}})
	case "cpf", "depen_cpf":
		return r.queryAny(ctx, refs, []string{"cpf", "CPF"}, utils.OnlyDigits(valor), false)
	case "rg", "depen_rg":
		return r.queryAny(ctx, refs, []string{"rg", "numero_rg", "RG"}, valor, false)
	case "nome", "depen_nome":
		return r.queryAny(ctx, refs, []string{"nome", "nome_faccionado", "NOME"}, valor, true)
	case "nomemae", "depen_nomemae":
		return r.queryAny(ctx, refs, []string{"nome_mae", "nomeMae", "NOME_MAE"}, valor, true)
	case "nomepai", "depen_nomepai":
		return r.queryAny(ctx, refs, []string{"nome_pai", "nomePai", "NOME_PAI"}, valor, true)
	case "alcunha":
		return r.queryAny(ctx, refs, []string{"alcunha", "ALCUNHA"}, valor, true)
	default:
		return []map[string]any{}, nil
	}
}

// FaccoesMutation executa criacao/validacao de faccoes e faccionados.
// Chamado pelo AppsUseCase; exige tabelas FACCOES_APP configuradas para escrita.
func (r Repository) FaccoesMutation(ctx context.Context, tipo string, id string, userID int64, payload map[string]any) ([]map[string]any, error) {
	if r.db == nil {
		return []map[string]any{}, nil
	}
	switch tipo {
	case "validate_faccao":
		return r.validateFaccoesRow(ctx, "FACCAO", "ID_FACCAO", id, userID, "idFaccao")
	case "reject_faccao":
		return r.rejectFaccao(ctx, id)
	case "validate_faccionado":
		return r.validateFaccoesRow(ctx, "FACCIONADO", "ID_FACCIONADO", id, userID, "idFaccionado")
	case "reject_faccionado":
		return r.deleteFaccoesRow(ctx, "FACCIONADO", "ID_FACCIONADO", id, "idFaccionado")
	case "create_faccao":
		return r.createFaccao(ctx, payload, userID)
	case "create_faccionado":
		return r.createFaccionado(ctx, payload, userID)
	default:
		return []map[string]any{}, nil
	}
}

func (r Repository) validateFaccoesRow(ctx context.Context, tableKey string, idColumn string, id string, userID int64, outKey string) ([]map[string]any, error) {
	table, ok := r.faccoesTable(tableKey)
	if !ok {
		return nil, types.ErrModelNotConfigured
	}
	idInt, err := strconv.ParseInt(strings.TrimSpace(id), 10, 64)
	if err != nil || idInt <= 0 {
		return nil, types.ErrInvalidParam
	}
	_, err = r.db.ExecContext(ctx, fmt.Sprintf("UPDATE %s SET VALIDATED_BY_USER_ID = @USER_ID WHERE %s = @ID", table, idColumn), sql.Named("USER_ID", userID), sql.Named("ID", idInt))
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return []map[string]any{{outKey: idInt, "idUsuarioValidador": userID}}, nil
}

func (r Repository) deleteFaccoesRow(ctx context.Context, tableKey string, idColumn string, id string, outKey string) ([]map[string]any, error) {
	table, ok := r.faccoesTable(tableKey)
	if !ok {
		return nil, types.ErrModelNotConfigured
	}
	idInt, err := strconv.ParseInt(strings.TrimSpace(id), 10, 64)
	if err != nil || idInt <= 0 {
		return nil, types.ErrInvalidParam
	}
	if _, err = r.db.ExecContext(ctx, fmt.Sprintf("DELETE FROM %s WHERE %s = @ID", table, idColumn), sql.Named("ID", idInt)); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return []map[string]any{{outKey: idInt}}, nil
}

func (r Repository) rejectFaccao(ctx context.Context, id string) ([]map[string]any, error) {
	faccaoTable, ok := r.faccoesTable("FACCAO")
	if !ok {
		return nil, types.ErrModelNotConfigured
	}
	faccionadoTable, ok := r.faccoesTable("FACCIONADO")
	if !ok {
		return nil, types.ErrModelNotConfigured
	}
	idInt, err := strconv.ParseInt(strings.TrimSpace(id), 10, 64)
	if err != nil || idInt <= 0 {
		return nil, types.ErrInvalidParam
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rollbackUnlessCommitted(tx, &err)
	if _, err = tx.ExecContext(ctx, fmt.Sprintf("DELETE FROM %s WHERE FK_FACCAO_ID = @ID", faccionadoTable), sql.Named("ID", idInt)); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	if _, err = tx.ExecContext(ctx, fmt.Sprintf("DELETE FROM %s WHERE ID_FACCAO = @ID", faccaoTable), sql.Named("ID", idInt)); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	if err = tx.Commit(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return []map[string]any{{"idFaccao": idInt}}, nil
}

func (r Repository) createFaccao(ctx context.Context, payload map[string]any, userID int64) ([]map[string]any, error) {
	faccao := mapField(payload, "faccao")
	table, ok := r.faccoesTable("FACCAO")
	if !ok {
		return nil, types.ErrModelNotConfigured
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rollbackUnlessCommitted(tx, &err)
	var id int64
	err = tx.QueryRowContext(ctx, fmt.Sprintf(`
INSERT INTO %s (VERSAO_FACCAO, SIGLA, NOME, DESCRICAO, DATA_INICIO, CREATED_BY_USER_ID, IS_MOST_RECENT)
OUTPUT INSERTED.ID_FACCAO
VALUES (1, @SIGLA, @NOME, @DESCRICAO, @DATA_INICIO, @USER_ID, 1)`, table),
		sql.Named("SIGLA", nullableString(faccao, "sigla")),
		sql.Named("NOME", nullableString(faccao, "nome")),
		sql.Named("DESCRICAO", nullableString(faccao, "descricao")),
		sql.Named("DATA_INICIO", nullableString(faccao, "dataInicio")),
		sql.Named("USER_ID", userID),
	).Scan(&id)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	createdMembers := []int64{}
	for _, membro := range sliceMapField(faccao, "membros") {
		membro["idFaccao"] = id
		memberID, memberErr := r.createFaccionadoTx(ctx, tx, membro, userID)
		if memberErr != nil {
			err = memberErr
			return nil, memberErr
		}
		createdMembers = append(createdMembers, memberID)
	}
	if err = tx.Commit(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return []map[string]any{{"novaFaccaoIdGerado": id, "idsNovosFaccionados": createdMembers}}, nil
}

func (r Repository) createFaccionado(ctx context.Context, payload map[string]any, userID int64) ([]map[string]any, error) {
	faccionado := mapField(payload, "faccionado")
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rollbackUnlessCommitted(tx, &err)
	id, err := r.createFaccionadoTx(ctx, tx, faccionado, userID)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	if err = tx.Commit(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return []map[string]any{{"novoFaccionadoIdGerado": id}}, nil
}

func (r Repository) createFaccionadoTx(ctx context.Context, tx *sql.Tx, faccionado map[string]any, userID int64) (int64, error) {
	table, ok := r.faccoesTable("FACCIONADO")
	if !ok {
		return 0, types.ErrModelNotConfigured
	}
	idFaccao := intField(faccionado, "idFaccao")
	versaoFaccao, err := r.currentFaccaoVersion(ctx, tx, idFaccao)
	if err != nil {
		return 0, err
	}
	var id int64
	err = tx.QueryRowContext(ctx, fmt.Sprintf(`
INSERT INTO %s (NOME_MAE_SOLTEIRA, NOME, NOME_MAE, NOME_PAI, DATA_NASCIMENTO, SEXO, CREATED_BY_USER_ID, IS_MOST_RECENT, FK_FACCAO_ID, FK_FACCAO_VERSAO)
OUTPUT INSERTED.ID_FACCIONADO
VALUES (@NOME_MAE_SOLTEIRA, @NOME, @NOME_MAE, @NOME_PAI, @DATA_NASCIMENTO, @SEXO, @USER_ID, 1, @ID_FACCAO, @VERSAO_FACCAO)`, table),
		sql.Named("NOME_MAE_SOLTEIRA", nullableString(faccionado, "nomeMaeSolteira")),
		sql.Named("NOME", nullableString(faccionado, "nome")),
		sql.Named("NOME_MAE", nullableString(faccionado, "nomeMae")),
		sql.Named("NOME_PAI", nullableString(faccionado, "nomePai")),
		sql.Named("DATA_NASCIMENTO", nullableString(faccionado, "dataNascimento")),
		sql.Named("SEXO", nullableString(faccionado, "sexo")),
		sql.Named("USER_ID", userID),
		sql.Named("ID_FACCAO", idFaccao),
		sql.Named("VERSAO_FACCAO", versaoFaccao),
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	if err = r.insertFaccionadoChildren(ctx, tx, id, faccionado, idFaccao, versaoFaccao); err != nil {
		return 0, err
	}
	return id, nil
}

func (r Repository) currentFaccaoVersion(ctx context.Context, tx *sql.Tx, idFaccao int64) (int64, error) {
	table, ok := r.faccoesTable("FACCAO")
	if !ok {
		return 0, types.ErrModelNotConfigured
	}
	var versao int64 = 1
	err := tx.QueryRowContext(ctx, fmt.Sprintf("SELECT TOP 1 VERSAO_FACCAO FROM %s WHERE ID_FACCAO = @ID AND IS_MOST_RECENT = 1", table), sql.Named("ID", idFaccao)).Scan(&versao)
	if err == sql.ErrNoRows {
		return 1, nil
	}
	return versao, err
}

func (r Repository) insertFaccionadoChildren(ctx context.Context, tx *sql.Tx, id int64, f map[string]any, idFaccao int64, versaoFaccao int64) error {
	for _, value := range sliceStringField(f, "alcunhas") {
		if table, ok := r.faccoesTable("ALCUNHA"); ok {
			if _, err := tx.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (FK_ID_FACCIONADO, FK_VERSAO_FACCIONADO, ALCUNHA) VALUES (@ID, 1, @VALOR)", table), sql.Named("ID", id), sql.Named("VALOR", value)); err != nil {
				return err
			}
		}
	}
	for _, value := range sliceStringField(f, "cpfs") {
		if table, ok := r.faccoesTable("CPF_FACCIONADO"); ok {
			if _, err := tx.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (FK_ID_FACCIONADO, FK_VERSAO_FACCIONADO, CPF_FACCIONADO) VALUES (@ID, 1, @VALOR)", table), sql.Named("ID", id), sql.Named("VALOR", utils.OnlyDigits(value))); err != nil {
				return err
			}
		}
	}
	for _, item := range sliceMapField(f, "rgs") {
		if table, ok := r.faccoesTable("RG_FACCIONADO"); ok {
			if _, err := tx.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (FK_ID_FACCIONADO, FK_VERSAO_FACCIONADO, NUMERO_RG, ORG_EMISSOR, UF) VALUES (@ID, 1, @RG, @ORG, @UF)", table), sql.Named("ID", id), sql.Named("RG", nullableString(item, "numeroRg")), sql.Named("ORG", nullableString(item, "orgEmissor")), sql.Named("UF", nullableString(item, "uf"))); err != nil {
				return err
			}
		}
	}
	for _, item := range sliceMapField(f, "telefones") {
		if table, ok := r.faccoesTable("TELEFONE_FACCIONADO"); ok {
			if _, err := tx.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (FK_ID_FACCIONADO, FK_VERSAO_FACCIONADO, DDD, NUMERO) VALUES (@ID, 1, @DDD, @NUMERO)", table), sql.Named("ID", id), sql.Named("DDD", nullableString(item, "ddd")), sql.Named("NUMERO", nullableString(item, "numero"))); err != nil {
				return err
			}
		}
	}
	for _, item := range sliceMapField(f, "enderecos") {
		if table, ok := r.faccoesTable("ENDERECO_FACCIONADO"); ok {
			if _, err := tx.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (FK_ID_FACCIONADO, FK_VERSAO_FACCIONADO, LOGRADOURO, NUMERO, BAIRRO, CIDADE, UF, COMPLEMENTO, PONTO_DE_REFERENCIA, CEP) VALUES (@ID, 1, @LOGRADOURO, @NUMERO, @BAIRRO, @CIDADE, @UF, @COMPLEMENTO, @REFERENCIA, @CEP)", table), sql.Named("ID", id), sql.Named("LOGRADOURO", nullableString(item, "logradouro")), sql.Named("NUMERO", nullableString(item, "numero")), sql.Named("BAIRRO", nullableString(item, "bairro")), sql.Named("CIDADE", nullableString(item, "cidade")), sql.Named("UF", nullableString(item, "uf")), sql.Named("COMPLEMENTO", nullableString(item, "complemento")), sql.Named("REFERENCIA", nullableString(item, "pontoDeReferencia")), sql.Named("CEP", utils.OnlyDigits(stringValue(item["cep"])))); err != nil {
				return err
			}
		}
	}
	if table, ok := r.faccoesTable("FACCIONADO_FACCAO"); ok {
		_, err := tx.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (FK_ID_FACCIONADO, FK_VERSAO_FACCIONADO, FK_ID_FACCAO, FK_VERSAO_FACCAO, DATA_ENTRADA) VALUES (@ID, 1, @ID_FACCAO, @VERSAO_FACCAO, @DATA_ENTRADA)", table), sql.Named("ID", id), sql.Named("ID_FACCAO", idFaccao), sql.Named("VERSAO_FACCAO", versaoFaccao), sql.Named("DATA_ENTRADA", nullableString(f, "dataEntradaFaccao")))
		return err
	}
	return nil
}

func (r Repository) TipoRankUF(ctx context.Context) ([]map[string]any, error) {
	return r.queryAll(ctx, []sourceRef{{"BD_TIPOLOGIAS", "TIPORANK_UF"}, {"BD_SAGRES", "TIPORANK_UF"}})
}

func (r Repository) TipoRankMunicipio(ctx context.Context, uf string, municipio string) ([]map[string]any, error) {
	if strings.TrimSpace(municipio) != "" {
		return r.queryAny(ctx, []sourceRef{{"BD_TIPOLOGIAS", "TIPORANK"}, {"BD_SAGRES", "TIPORANK"}}, []string{"municipio", "no_municipio"}, municipio, true)
	}
	return r.queryAny(ctx, []sourceRef{{"BD_TIPOLOGIAS", "TIPORANK"}, {"BD_SAGRES", "TIPORANK"}}, []string{"uf", "UF"}, strings.ToUpper(uf), false)
}

func (r Repository) ArielFoto(ctx context.Context, payload map[string]any) ([]map[string]any, error) {
	// Fonte Ariel externa fica em etapa propria; retorno resiliente evita quebrar a tela.
	return []map[string]any{}, nil
}

func (r Repository) SimbaTop(ctx context.Context, tipo string, documento string) ([]map[string]any, error) {
	cols := []string{"cpf", "CPF", "documento"}
	if tipo == "cnpj" {
		cols = []string{"cnpj", "CNPJ", "documento"}
	}
	return r.queryAny(ctx, []sourceRef{{"BD_SIMBA", "TOP"}, {"SIMBA", "TOP"}}, cols, utils.OnlyDigits(documento), false)
}

func (r Repository) YellowPages(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	if tipo == "cnpj" {
		return r.queryAny(ctx, []sourceRef{{"YELLOWPAGES", "EMPRESA"}, {"BD_YELLOWPAGES", "EMPRESA"}}, []string{"cnpj", "CNPJ"}, utils.OnlyDigits(valor), false)
	}
	return r.queryAny(ctx, []sourceRef{{"YELLOWPAGES", "EMPRESA"}, {"BD_YELLOWPAGES", "EMPRESA"}}, []string{"razao_social", "razaoSocial", "nome"}, valor, true)
}

func (r Repository) SefazML(ctx context.Context, tipo string, valor string, query map[string]string) ([]map[string]any, error) {
	switch tipo {
	case "municipio":
		return r.queryAny(ctx, []sourceRef{{"BD_SEFAZ", "ITEMNOTAFISCAL"}, {"BD_SEFAZ", "PRODUTO"}}, []string{"municipio", "nomeMunicipio"}, valor, true)
	case "item":
		return r.queryAny(ctx, []sourceRef{{"BD_SEFAZ", "ITEMNOTAFISCAL"}, {"BD_SEFAZ", "ITEM_DETALHADO"}}, []string{"idItem", "id_item", "IdItem"}, valor, false)
	case "topfornecedores":
		return r.queryAll(ctx, []sourceRef{{"BD_SEFAZ", "TOP_FORNECEDORES"}, {"BD_SEFAZ", "ITEMNOTAFISCAL"}})
	case "vendasfornecedor":
		return r.queryAny(ctx, []sourceRef{{"BD_SEFAZ", "VENDAS_FORNECEDOR"}, {"BD_SEFAZ", "ITEMNOTAFISCAL"}}, []string{"cnpj_fornecedor", "cnpjFornecedor"}, utils.OnlyDigits(query["cnpj"]), false)
	case "produto":
		return r.queryAny(ctx, []sourceRef{{"BD_SEFAZ", "PRODUTO"}, {"BD_SEFAZ", "ITEMNOTAFISCAL"}}, []string{"produto", "nomeProduto", "descricao"}, query["produto"], true)
	default:
		return r.queryAll(ctx, []sourceRef{{"BD_SEFAZ", "ITENS_DISCREPANTES"}, {"BD_SEFAZ", "ITEMNOTAFISCAL"}})
	}
}

func (r Repository) Sadep(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	refs := []sourceRef{{"SADEP", "MANDADOS"}, {"BD_SADEP", "MANDADOS"}, {"SADEP", "MANDADEMANDOS"}}
	switch tipo {
	case "uf", "mandadosporuf", "relatorio_uf":
		return r.queryAny(ctx, refs, []string{"uf", "UF"}, strings.ToUpper(valor), false)
	case "cpf", "detalhamento_cpf", "mandado_cpf":
		return r.queryAny(ctx, refs, []string{"cpf", "CPF"}, utils.OnlyDigits(valor), false)
	case "geocode":
		return []map[string]any{{"endereco": valor}}, nil
	case "pdf":
		return []map[string]any{}, nil
	default:
		return []map[string]any{}, nil
	}
}

func (r Repository) RelacionaTipologia(ctx context.Context, pj bool, uf string) ([]map[string]any, error) {
	key := "RELACIONA_TIPOLOGIA"
	if pj {
		key = "RELACIONA_TIPOLOGIA_PJ"
	}
	return r.queryAny(ctx, []sourceRef{{"BD_TIPOLOGIAS", key}, {"BD_SAGRES", key}}, []string{"uf", "UF"}, strings.ToUpper(uf), false)
}

type sourceRef struct {
	model string
	key   string
}

func (r Repository) queryAll(ctx context.Context, refs []sourceRef) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, ref := range refs {
		table, ok := r.models.Table(ref.model, ref.key)
		if !ok {
			continue
		}
		rows, err := r.query(ctx, "SELECT TOP 1000 *, "+sqlLiteral(r.sigla(ref.model, ref.model))+" as fonte FROM "+table)
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

func (r Repository) queryAny(ctx context.Context, refs []sourceRef, columns []string, value string, like bool) ([]map[string]any, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return []map[string]any{}, nil
	}
	out := []map[string]any{}
	for _, ref := range refs {
		table, ok := r.models.Table(ref.model, ref.key)
		if !ok {
			continue
		}
		for _, col := range columns {
			op := "="
			arg := value
			if like {
				op = "LIKE"
				arg = "%" + value + "%"
			}
			rows, err := r.query(ctx, fmt.Sprintf("SELECT TOP 1000 *, %s as fonte FROM %s WHERE %s %s @VALOR", sqlLiteral(r.sigla(ref.model, ref.model)), table, col, op), sql.Named("VALOR", arg))
			if err == nil {
				out = append(out, rows...)
				break
			}
		}
	}
	return out, nil
}

func (r Repository) query(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	if r.db == nil {
		return []map[string]any{}, nil
	}
	return rowsToMaps(r.db.QueryContext(ctx, query, args...))
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

func (r Repository) sigla(model string, fallback string) string {
	if m, ok := r.models.Get(model); ok && strings.TrimSpace(m.Sigla) != "" {
		return strings.TrimSpace(m.Sigla)
	}
	return fallback
}

func (r Repository) faccoesTable(key string) (string, bool) {
	for _, model := range []string{"FACCOES_APP", "FACCOES", "BD_FACCOES"} {
		if table, ok := r.models.Table(model, key); ok && strings.TrimSpace(table) != "" {
			return table, true
		}
	}
	return "", false
}

func sqlLiteral(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "''") + "'"
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func rollbackUnlessCommitted(tx *sql.Tx, err *error) {
	if tx != nil && err != nil && *err != nil {
		_ = tx.Rollback()
	}
}

func mapField(payload map[string]any, key string) map[string]any {
	if payload == nil {
		return map[string]any{}
	}
	if item, ok := payload[key].(map[string]any); ok {
		return item
	}
	return payload
}

func sliceMapField(payload map[string]any, key string) []map[string]any {
	raw, ok := payload[key].([]any)
	if !ok {
		return nil
	}
	out := []map[string]any{}
	for _, item := range raw {
		if mapped, ok := item.(map[string]any); ok {
			out = append(out, mapped)
		}
	}
	return out
}

func sliceStringField(payload map[string]any, key string) []string {
	raw, ok := payload[key].([]any)
	if !ok {
		return nil
	}
	out := []string{}
	for _, item := range raw {
		value := strings.TrimSpace(stringValue(item))
		if value != "" {
			out = append(out, value)
		}
	}
	return out
}

func nullableString(payload map[string]any, key string) any {
	value := strings.TrimSpace(stringValue(payload[key]))
	if value == "" {
		return nil
	}
	return value
}

func intField(payload map[string]any, key string) int64 {
	switch value := payload[key].(type) {
	case float64:
		return int64(value)
	case int64:
		return value
	case int:
		return int64(value)
	case string:
		parsed, _ := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
		return parsed
	default:
		return 0
	}
}

func stringValue(value any) string {
	switch v := value.(type) {
	case nil:
		return ""
	case string:
		return v
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	case int:
		return strconv.Itoa(v)
	case int64:
		return strconv.FormatInt(v, 10)
	default:
		return fmt.Sprint(v)
	}
}
