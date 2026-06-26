package empresa

import (
	"database/sql"
	"time"

	"pandora-go-server/internal/types"
)

// rowsToMaps preserva os aliases SQL que compoem o contrato JSON legado.
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
