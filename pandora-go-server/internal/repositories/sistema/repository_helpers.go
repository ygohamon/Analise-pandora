package repositories

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"strconv"
	"strings"
	"time"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func int64FromAny(value any) int64 {
	switch typed := value.(type) {
	case int64:
		return typed
	case int:
		return int64(typed)
	case int32:
		return int64(typed)
	case float64:
		return int64(typed)
	case []byte:
		parsed, _ := strconv.ParseInt(string(typed), 10, 64)
		return parsed
	case string:
		parsed, _ := strconv.ParseInt(typed, 10, 64)
		return parsed
	case fmt.Stringer:
		parsed, _ := strconv.ParseInt(typed.String(), 10, 64)
		return parsed
	default:
		return 0
	}
}

func appDateRange(startValue string, endValue string) (time.Time, driver.Value, error) {
	start, err := parseAppDate(startValue)
	if err != nil {
		return time.Time{}, nil, err
	}
	endValue = strings.TrimSpace(endValue)
	if endValue == "" {
		return start, nil, nil
	}
	end, err := parseAppDate(endValue)
	if err != nil {
		return time.Time{}, nil, err
	}
	return start, end, nil
}

func parseAppDate(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return time.Time{}, fmt.Errorf("empty date")
	}
	for _, layout := range []string{"1/2/2006", "01/02/2006", "2006-01-02", "2006-01-02T15:04:05", time.RFC3339} {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed, nil
		}
	}
	return time.Time{}, fmt.Errorf("invalid date %q", value)
}

func scanUserLogs(rows *sql.Rows) ([]types.LogAcessoUsuario, error) {
	out := []types.LogAcessoUsuario{}
	for rows.Next() {
		var item types.LogAcessoUsuario
		var usuario, ip, secao, itemValue, chave, valor, mensagem, processo, userAgent, osValue, dataHora sql.NullString
		if err := rows.Scan(&usuario, &ip, &secao, &itemValue, &chave, &valor, &mensagem, &processo, &userAgent, &osValue, &dataHora); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item.Usuario = utils.SQLStringPtr(usuario)
		item.IP = utils.SQLStringPtr(ip)
		item.Secao = utils.SQLStringPtr(secao)
		item.Item = utils.SQLStringPtr(itemValue)
		item.Chave = utils.SQLStringPtr(chave)
		item.Valor = utils.SQLStringPtr(valor)
		item.Mensagem = utils.SQLStringPtr(mensagem)
		item.Processo = utils.SQLStringPtr(processo)
		item.UserAgent = utils.SQLStringPtr(userAgent)
		item.OS = utils.SQLStringPtr(osValue)
		item.DataHora = utils.SQLStringPtr(dataHora)
		out = append(out, item)
	}
	return out, rows.Err()
}

func dbExecErr(err error) error {
	if err == nil {
		return nil
	}
	return types.ErrDatabaseUnavailable.WithCause(err)
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
	if err := rows.Err(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return out, nil
}

func dateFilterSQL(period string, duration string) string {
	switch strings.ToLower(strings.TrimSpace(period)) {
	case "semana":
		return "AND L.data_hora >= DATEADD(DAY, -7, GETDATE())"
	case "mes":
		return "AND L.data_hora >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)"
	case "ano":
		return "AND L.data_hora >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1)"
	case "tudo":
		return ""
	}
	duration = strings.TrimSpace(duration)
	if duration != "" && duration != "-1" {
		if _, err := strconv.Atoi(duration); err == nil {
			return "AND L.data_hora >= DATEADD(DAY, -" + duration + ", GETDATE())"
		}
	}
	return ""
}

func durationFilter(column string, duration string) (string, []any) {
	duration = strings.TrimSpace(duration)
	if duration == "" || duration == "-1" {
		return "", nil
	}
	days, err := strconv.Atoi(duration)
	if err != nil || days <= 0 {
		return "", nil
	}
	return "AND " + column + " >= DATEADD(DAY, -@DURACAO, GETDATE())", []any{sql.Named("DURACAO", days)}
}

func safeTop(value string, fallback int) int {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil || parsed <= 0 {
		return fallback
	}
	if parsed > 1000 {
		return 1000
	}
	return parsed
}

func scanPermissions(rows *sql.Rows) ([]types.Permissao, error) {
	out := []types.Permissao{}
	for rows.Next() {
		var p types.Permissao
		if err := rows.Scan(&p.IDSecao, &p.Secao, &p.IDItem, &p.Item); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		out = append(out, p)
	}
	if err := rows.Err(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return out, nil
}

func sqlString(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func nullableString(value string) driver.Value {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return value
}

func nullableInt64(value int64) driver.Value {
	if value == 0 {
		return nil
	}
	return value
}
