package pessoa

import (
	"context"
	"database/sql"
)

// ListaOrcrins consulta a base administrativa de faccionados para a tela orcrim.
func (m SQLRepository) ListaOrcrins(ctx context.Context) ([]map[string]any, error) {
	return m.orcrins(ctx, "")
}

func (m SQLRepository) OrcrinsPorNome(ctx context.Context, orcrim string) ([]map[string]any, error) {
	return m.orcrins(ctx, orcrim)
}

func (m SQLRepository) orcrins(ctx context.Context, filtro string) ([]map[string]any, error) {
	orcrim, ok := m.models.Table("BD_ORCRIM", "FACCIONADOS")
	if !ok || orcrim == "" || m.db == nil {
		return []map[string]any{}, nil
	}
	where := ""
	args := []any{}
	if filtro != "" {
		where = "WHERE NM_OPERACAO LIKE @FILTRO OR FONTE LIKE @FILTRO OR NOME LIKE @FILTRO"
		args = append(args, sql.Named("FILTRO", likeValue(filtro)))
	}
	query := `
SELECT TOP 5000
	ID as id,
	CPF1 as cpf,
	RG1 as documento,
	NOME as nome,
	VULGO as vulgo,
	NOME_PAI as pai,
	NOME_MAE as mae,
	DT_NASCIMENTO as dataNascimento,
	REGIAO as DDD,
	MANDADO_PRISAO as mandado,
	FUNCAO as funcao,
	OBS as obs,
	SITUACAO_PESSOAL as situacaoPessoal,
	SITUACAO_PROCESSUAL as situacaoProcessual,
	TATUAGEM as tatuagem,
	MATRICULA_SAP as matricula,
	FONTE as fonte,
	SEGREDO_JUSTICA as segredo,
	PIC as pic,
	PROCESSO as processo,
	NM_OPERACAO as operacao,
	DT_DENUNCIA as denuncia,
	FONTES_ABERTAS as abertas,
	IMG as img,
	ADVOGADO as advogado,
	img_adv as img_adv,
	OAB_ADV as oab
FROM ` + orcrim + `
` + where
	return rowsToMaps(m.db.QueryContext(ctx, query, args...))
}
