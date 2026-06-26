package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func (r SQLUsuarioRepository) APIQueriesSummary(ctx context.Context, year *int, month *int) ([]types.APIResumoMensal, error) {
	table, ok := r.models.Table("BD_PANDORA", "API_CONSULTA_MENSAL")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	filters := []string{}
	args := []any{}
	if year != nil {
		filters = append(filters, "ano = @ANO")
		args = append(args, sql.Named("ANO", *year))
	}
	if month != nil {
		filters = append(filters, "mes = @MES")
		args = append(args, sql.Named("MES", *month))
	}
	where := ""
	if len(filters) > 0 {
		where = "WHERE " + strings.Join(filters, " AND ")
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	servico,
	SUM(quantidade) AS quantidade,
	MAX(limite_alerta) AS limiteAlerta,
	MAX(ano) AS ano,
	MAX(mes) AS mes
FROM `+table+`
`+where+`
GROUP BY servico
ORDER BY servico ASC`, args...)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.APIResumoMensal{}
	for rows.Next() {
		var item types.APIResumoMensal
		var limite, ano, mes sql.NullInt64
		if err := rows.Scan(&item.Servico, &item.Quantidade, &limite, &ano, &mes); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		if limite.Valid {
			item.LimiteAlerta = &limite.Int64
		}
		if ano.Valid {
			item.Ano = &ano.Int64
		}
		if mes.Valid {
			item.Mes = &mes.Int64
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) APIQueriesMonthly(ctx context.Context, year *int, month *int, service string) ([]types.APIConsultaMensal, error) {
	table, ok := r.models.Table("BD_PANDORA", "API_CONSULTA_MENSAL")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	filters := []string{}
	args := []any{}
	if year != nil {
		filters = append(filters, "ano = @ANO")
		args = append(args, sql.Named("ANO", *year))
	}
	if month != nil {
		filters = append(filters, "mes = @MES")
		args = append(args, sql.Named("MES", *month))
	}
	service = strings.TrimSpace(strings.ToLower(service))
	if service != "" {
		filters = append(filters, "servico = @SERVICO")
		args = append(args, sql.Named("SERVICO", service))
	}
	where := ""
	if len(filters) > 0 {
		where = "WHERE " + strings.Join(filters, " AND ")
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	id,
	servico,
	ano,
	mes,
	quantidade,
	limite_alerta AS limiteAlerta,
	CONVERT(varchar(33), data_criacao, 126) AS dataCriacao,
	CONVERT(varchar(33), data_atualizacao, 126) AS dataAtualizacao
FROM `+table+`
`+where+`
ORDER BY ano DESC, mes DESC, servico ASC`, args...)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.APIConsultaMensal{}
	for rows.Next() {
		var item types.APIConsultaMensal
		var limite sql.NullInt64
		var dataCriacao, dataAtualizacao sql.NullString
		if err := rows.Scan(&item.ID, &item.Servico, &item.Ano, &item.Mes, &item.Quantidade, &limite, &dataCriacao, &dataAtualizacao); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		if limite.Valid {
			item.LimiteAlerta = &limite.Int64
		}
		item.DataCriacao = utils.SQLStringPtr(dataCriacao)
		item.DataAtualizacao = utils.SQLStringPtr(dataAtualizacao)
		out = append(out, item)
	}
	return out, rows.Err()
}
