package analise

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

// Repository concentra somente consultas da secao Analise.
type Repository struct {
	db     *sql.DB
	models modelconfig.Registry
}

// NewRepository cria o repository usado pelo AnaliseUseCase.
func NewRepository(db *sql.DB, models modelconfig.Registry) Repository {
	return Repository{db: db, models: models}
}

// Empenhos consulta bases SAGRES por documento do credor.
func (r Repository) Empenhos(ctx context.Context, tipo string, documento string) ([]map[string]any, error) {
	return r.querySagresDocumento(ctx, []string{"SM_EMPENHOS", "SE_EMPENHOS", "SM_EMPENHOS_PAGOS", "SE_EMPENHOS_PAGOS"}, tipo, documento)
}

// Licitacoes consulta bases SAGRES por documento do licitante.
func (r Repository) Licitacoes(ctx context.Context, tipo string, documento string) ([]map[string]any, error) {
	return r.querySagresDocumento(ctx, []string{"SM_LICITACOES", "SE_LICITACOES"}, tipo, documento)
}

// LicitacaoDados consulta licitacoes por identificadores compostos da tela.
func (r Repository) LicitacaoDados(ctx context.Context, cdUgestora string, nuLicitacao string, cdMdLicitacao string) ([]map[string]any, error) {
	return r.querySagresFields(ctx, []string{"SM_LICITACOES", "SE_LICITACOES"}, map[string]string{
		"cd_ugestora":      cdUgestora,
		"nu_licitacao":     nuLicitacao,
		"cd_md_licitacao":  cdMdLicitacao,
		"cdUgestora":       cdUgestora,
		"nuLicitacao":      nuLicitacao,
		"cdMdLicitacao":    cdMdLicitacao,
		"codigo_ugestora":  cdUgestora,
		"numero_licitacao": nuLicitacao,
	})
}

// Aditivos consulta aditivos por documento ou numero de licitacao.
func (r Repository) Aditivos(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	if tipo == "nulicitacao" {
		return r.querySagresFields(ctx, []string{"SM_ADITIVOS", "SE_ADITIVOS"}, map[string]string{
			"nu_licitacao":     valor,
			"nuLicitacao":      valor,
			"numero_licitacao": valor,
		})
	}
	return r.querySagresDocumento(ctx, []string{"SM_ADITIVOS", "SE_ADITIVOS"}, tipo, valor)
}

// Contratos consulta contratos por documento, licitacao ou contrato.
func (r Repository) Contratos(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	switch tipo {
	case "nulicitacao":
		return r.querySagresFields(ctx, []string{"SM_CONTRATOS", "SE_CONTRATOS"}, map[string]string{
			"nu_licitacao":     valor,
			"nuLicitacao":      valor,
			"numero_licitacao": valor,
		})
	case "nucontrato":
		return r.querySagresFields(ctx, []string{"SM_CONTRATOS", "SE_CONTRATOS"}, map[string]string{
			"nu_contrato":     valor,
			"nuContrato":      valor,
			"numero_contrato": valor,
		})
	default:
		return r.querySagresDocumento(ctx, []string{"SM_CONTRATOS", "SE_CONTRATOS"}, tipo, valor)
	}
}

// TCE consulta tabelas CODATA/TCE por data de referencia.
func (r Repository) TCE(ctx context.Context, tipo string, data string) ([]map[string]any, error) {
	key, ok := tceTableKey(tipo)
	if !ok {
		return nil, types.ErrInvalidParam
	}
	table, ok := r.models.Table("WEBSERVICE_TCE", key)
	if !ok || r.db == nil {
		return []map[string]any{}, nil
	}
	parsed, err := parseDate(data)
	if err != nil {
		return nil, types.ErrInvalidParam
	}
	return r.queryTableByDate(ctx, table, parsed, r.sigla("WEBSERVICE_TCE", "TCE"))
}

func (r Repository) querySagresDocumento(ctx context.Context, keys []string, tipo string, documento string) ([]map[string]any, error) {
	documento = utils.OnlyDigits(documento)
	if documento == "" {
		return nil, types.ErrInvalidParam
	}
	candidates := []string{"cpf_cnpj_credor", "cpfCnpjCredor", "cpf_cnpj", "cpfcnpj", "cpf", "cnpj"}
	if tipo == "cpf" {
		candidates = []string{"cpf_cnpj_credor", "cpfCnpjCredor", "cpf_cnpj", "cpfcnpj", "cpf"}
	}
	if tipo == "cnpj" {
		candidates = []string{"cpf_cnpj_credor", "cpfCnpjCredor", "cpf_cnpj", "cpfcnpj", "cnpj"}
	}
	return r.querySagresAnyColumn(ctx, keys, candidates, documento)
}

func (r Repository) querySagresFields(ctx context.Context, keys []string, filters map[string]string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, key := range keys {
		table, ok := r.models.Table("BD_SAGRES", key)
		if !ok || r.db == nil {
			continue
		}
		rows, err := r.queryKnownFields(ctx, table, filters, r.sigla("BD_SAGRES", "TCEPB"))
		if err != nil {
			continue
		}
		out = append(out, rows...)
	}
	return out, nil
}

func (r Repository) querySagresAnyColumn(ctx context.Context, keys []string, columns []string, value string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, key := range keys {
		table, ok := r.models.Table("BD_SAGRES", key)
		if !ok || r.db == nil {
			continue
		}
		for _, column := range columns {
			rows, err := r.queryColumn(ctx, table, column, value, r.sigla("BD_SAGRES", "TCEPB"))
			if err == nil {
				out = append(out, rows...)
				break
			}
		}
	}
	return out, nil
}

func (r Repository) queryKnownFields(ctx context.Context, table string, filters map[string]string, fonte string) ([]map[string]any, error) {
	for column, value := range filters {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		rows, err := r.queryColumn(ctx, table, column, value, fonte)
		if err == nil {
			return rows, nil
		}
	}
	return []map[string]any{}, nil
}

func (r Repository) queryColumn(ctx context.Context, table string, column string, value string, fonte string) ([]map[string]any, error) {
	query := fmt.Sprintf("SELECT TOP 1000 *, @FONTE as fonte FROM %s WHERE %s = @VALOR", table, column)
	return rowsToMaps(r.db.QueryContext(ctx, query, sql.Named("VALOR", value), sql.Named("FONTE", fonte)))
}

func (r Repository) queryTableByDate(ctx context.Context, table string, data time.Time, fonte string) ([]map[string]any, error) {
	fields := []string{"data", "dt", "data_referencia", "dt_referencia", "competencia"}
	for _, field := range fields {
		rows, err := r.queryColumn(ctx, table, field, data.Format("2006-01-02"), fonte)
		if err == nil {
			return rows, nil
		}
	}
	rows, err := r.db.QueryContext(ctx, "SELECT TOP 1000 *, @FONTE as fonte FROM "+table, sql.Named("FONTE", fonte))
	return rowsToMaps(rows, err)
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
		return m.Sigla
	}
	return fallback
}

func parseDate(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	for _, layout := range []string{"2006-01-02", "02/01/2006", "20060102", time.RFC3339} {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed, nil
		}
	}
	return time.Time{}, fmt.Errorf("invalid date")
}

func tceTableKey(tipo string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(tipo)) {
	case "conta_bancaria":
		return "CONTA_BANCARIA", true
	case "empenho":
		return "EMPENHO", true
	case "empenho_anulacao":
		return "EMPENHO_ANULACAO", true
	case "empenho_suplementacao":
		return "EMPENHO_SUPLEMENTACAO", true
	case "licitacao":
		return "LICITACAO", true
	case "pagamento":
		return "PAGAMENTO", true
	case "pagamento_anulado":
		return "PAGAMENTO_ANULADO", true
	case "pagamento_extra_orcamentario":
		return "PAGAMENTO_EXTRA_ORCAMENTARIO", true
	case "pagamento_orcamentario":
		return "PAGAMENTO_ORCAMENTARIO", true
	case "pagamento_orcamentario_anulado":
		return "PAGAMENTO_ORCAMENTARIO_ANULADO", true
	case "pagamento_restituicao_receita":
		return "PAGAMENTO_RESTITUICAO_RECEITA", true
	case "pagamento_restos_pagar":
		return "PAGAMENTO_RESTOS_PAGAR", true
	case "pagamento_retencao":
		return "PAGAMENTO_RETENCAO", true
	default:
		return "", false
	}
}
