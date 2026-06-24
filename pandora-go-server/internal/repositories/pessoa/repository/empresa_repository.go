package pessoa

import (
	"database/sql"
	"fmt"
	"strings"
)

func normalizeHistoricoQuadroSocietarioCNERows(rows []map[string]any) []map[string]any {
	for _, row := range rows {
		if _, ok := row["fonte"]; !ok || row["fonte"] == nil || strings.TrimSpace(fmt.Sprint(row["fonte"])) == "" {
			row["fonte"] = "CNE"
		}
		if _, ok := row["tipo"]; !ok || row["tipo"] == nil || strings.TrimSpace(fmt.Sprint(row["tipo"])) == "" {
			row["tipo"] = "pf"
		}
	}
	return rows
}

func (m pessoaIntegradoLocalModel) integradoLocalCorporateSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if proc, ok := m.models.Table("CNE", "HISTORICO_PARTICIPACAO_PF_EM_SOCIEDADES"); ok && proc != "" {
		sources = append(sources, pessoaMapSource{
			category: "historico_quadro_societario",
			query: `
EXEC ` + proc + ` @CPF`,
			args:      func(cpf string) []any { return []any{sql.Named("CPF", cpf)} },
			normalize: normalizeHistoricoQuadroSocietarioCNERows,
		})
	}
	if socio, ok := m.models.Table("BD_RECEITA", "SOCIO_HISTORICO"); ok && socio != "" {
		pj, _ := m.models.Table("BD_RECEITA", "PJ")
		qual, _ := m.models.Table("BD_RECEITA", "QUALIFICACAO_RESPONSAVEL")
		if pj != "" && qual != "" {
			fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
			sources = append(sources, pessoaMapSource{
				category: "historico_quadro_societario",
				query: `
SELECT TOP 1000
	NUM_CNPJ_EMPRESA as cnpj,
	PJ.RazaoSocial as razaoSocial,
	PJ.NomeFantasia as nomeFantasia,
	PJ.DataInicioAtividade as dataInicioAtividade,
	PJ.CpfResponsavel as cpfResponsavel,
	PJ.NomeResponsavel as nomeResponsavel,
	S.NUM_CPF as cpf,
	S.Nome as nome,
	DATA_ENTRADA_SOCIEDADE as dataEntradaSociedade,
	DATA_DE_EXCLUSAO_NA_SOCIEDADE as dataSaidaSociedade,
	CAST(VALOR_PERCENTUA_CAPITAL_SOCIAL AS FLOAT) as percCapital,
	Q.nm_qualificacao_responsavel_socio as vinculo,
	'pf' as tipo,
	` + fonte + ` as fonte
FROM ` + socio + ` S
LEFT OUTER JOIN ` + pj + ` PJ ON S.NUM_CNPJ_EMPRESA = PJ.cnpj
LEFT OUTER JOIN ` + qual + ` Q ON S.COD_QUALIFICACAO_SOCIO = Q.cod_qualificacao_responsavel_socio
WHERE NUM_CPF=@CPF`,
				args: oneCPFArg,
			})
		}
	}
	return sources
}
