package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) IntegraRequests(ctx context.Context) ([]map[string]any, error) {
	requisicoes, promotorias, err := r.integraTables()
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	R.ID_REQUISICAO as idRequisicao, R.NOME as nome, R.EMAIL as email,
	R.TIPO_REFERENCIA as tipoReferencia, R.DOC as doc, R.TIPO_AREA as tipoArea,
	R.TIPO_GRUPO as tipoGrupo, R.DETALHES_RESUMO_FATOS as detalhesResumoDosFatos,
	R.DETALHES_FATORES_ADVERSOS as detalhesFatoresAdversos,
	R.DETALHES_FINALIDADE as detalhesFinalidade, R.TEMPO_INFORMACAO as tempoInformacao,
	R.FINALIZADO as finalizado, P.DESCRICAO as promotoria,
	R.DT_REQUISICAO as dataRequisicao
FROM `+requisicoes+` R
INNER JOIN `+promotorias+` P ON (R.ID_PROMOTORIA = P.ID_PROMOTORIA)
ORDER BY R.DT_REQUISICAO DESC`)
	requests, err := rowsToMaps(rows, err)
	if err != nil {
		return nil, err
	}
	for _, request := range requests {
		id := int64FromAny(request["idRequisicao"])
		request["anexos"], _ = r.integraExtras(ctx, "ANEXOS", id, `ID_ANEXO as idAnexo, NOME_ARQUIVO as nomeArquivo`)
		request["imoveis"], _ = r.integraExtras(ctx, "IMOVEIS", id, `ENDERECO as endereco, NECESSIDADE as necessidade`)
		request["pessoasFisicas"], _ = r.integraExtras(ctx, "PESSOAS_FISICAS", id, `CPF as cpf, IDENTIDADE as identidade, ORGAO_EXPEDITOR as orgaoExpeditor, UF_ORGAO_EXPEDITOR as ufOrgaoExpeditor, NECESSIDADE as necessidade, NOME as nome, NOMEMAE as nomeMae, NOMEPAI as nomePai`)
		request["pessoasJuridicas"], _ = r.integraExtras(ctx, "PESSOAS_JURIDICAS", id, `CNPJ as cnpj, NOMEFANTASIA as nomeFantasia, RAZAOSOCIAL as razaoSocial, NECESSIDADE as necessidade`)
		request["veiculos"], _ = r.integraExtras(ctx, "VEICULOS", id, `CPF as cpf, PLACA as placa, NECESSIDADE as necessidade`)
	}
	return requests, nil
}

func (r SQLUsuarioRepository) FinishIntegraRequest(ctx context.Context, id int64) error {
	table, ok := r.models.Table("BD_INTEGRA", "REQUISICOES")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `UPDATE `+table+` SET FINALIZADO=1 WHERE ID_REQUISICAO=@ID`, sql.Named("ID", id))
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) IntegraHistoryByProfile(ctx context.Context, profile string) ([]map[string]any, error) {
	requisicoes, _, err := r.integraTables()
	if err != nil {
		return nil, err
	}
	pessoa, usuario, perfil, err := r.userTables()
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	RQ.NOME AS nome,
	RQ.EMAIL AS email,
	RQ.TIPO_GRUPO AS grupo,
	RQ.TIPO_AREA AS area,
	MAX(RQ.DT_REQUISICAO) AS ultimaRequisicao,
	COUNT(*) AS total
FROM `+requisicoes+` RQ
INNER JOIN `+pessoa+` PS ON PS.EMAIL COLLATE SQL_Latin1_General_CP1_CI_AS = RQ.EMAIL COLLATE SQL_Latin1_General_CP1_CI_AS
INNER JOIN `+usuario+` US ON US.ID_PESSOA = PS.ID
INNER JOIN `+perfil+` PF ON PF.ID = US.ID_PERFIL
WHERE PF.DESCRICAO = @PERFIL
GROUP BY RQ.NOME, RQ.EMAIL, RQ.TIPO_GRUPO, RQ.TIPO_AREA
ORDER BY ultimaRequisicao DESC`, sql.Named("PERFIL", profile))
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) IntegraServiceHistory(ctx context.Context) ([]map[string]any, error) {
	table, ok := r.models.Table("BD_INTEGRA", "REQUISICOES")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	NOME,
	TIPO_GRUPO,
	TIPO_AREA,
	FINALIZADO,
	DT_REQUISICAO
FROM `+table+`
ORDER BY DT_REQUISICAO DESC`)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) IntegraDashboard(ctx context.Context) ([]map[string]any, error) {
	table, ok := r.models.Table("BD_INTEGRA", "REQUISICOES")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	TIPO_GRUPO as grupo,
	COUNT(*) as total,
	SUM(CASE WHEN FINALIZADO = 1 THEN 1 ELSE 0 END) as finalizadas,
	SUM(CASE WHEN FINALIZADO = 0 THEN 1 ELSE 0 END) as pendentes,
	AVG(DATEDIFF(DAY, DT_REQUISICAO, GETDATE())) as mediaDiasAbertos
FROM `+table+`
GROUP BY TIPO_GRUPO`)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) IntegraAttachment(ctx context.Context, id int64) (types.IntegraAttachment, error) {
	table, ok := r.models.Table("BD_INTEGRA", "ANEXOS")
	if !ok || r.db == nil {
		return types.IntegraAttachment{}, types.ErrModelNotConfigured
	}
	var attachment types.IntegraAttachment
	err := r.db.QueryRowContext(ctx, `
SELECT ARQUIVO as arquivo, NOME_ARQUIVO as nomeArquivo, DATALENGTH(ARQUIVO) AS tamanho, MIME as mime
FROM `+table+`
WHERE ID_ANEXO=@ID`, sql.Named("ID", id)).
		Scan(&attachment.Arquivo, &attachment.NomeArquivo, &attachment.Tamanho, &attachment.MIME)
	if err == sql.ErrNoRows {
		return types.IntegraAttachment{}, types.ErrNotFound
	}
	if err != nil {
		return types.IntegraAttachment{}, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return attachment, nil
}

func (r SQLUsuarioRepository) integraTables() (string, string, error) {
	requisicoes, ok := r.models.Table("BD_INTEGRA", "REQUISICOES")
	if !ok || r.db == nil {
		return "", "", types.ErrModelNotConfigured
	}
	promotorias, ok := r.models.Table("BD_INTEGRA", "PROMOTORIAS")
	if !ok || promotorias == "" {
		return "", "", types.ErrModelNotConfigured
	}
	return requisicoes, promotorias, nil
}

func (r SQLUsuarioRepository) integraExtras(ctx context.Context, modelKey string, id int64, columns string) ([]map[string]any, error) {
	table, ok := r.models.Table("BD_INTEGRA", modelKey)
	if !ok || table == "" {
		return []map[string]any{}, nil
	}
	rows, err := r.db.QueryContext(ctx, `SELECT `+columns+` FROM `+table+` WHERE ID_REQUISICAO=@ID`, sql.Named("ID", id))
	return rowsToMaps(rows, err)
}
