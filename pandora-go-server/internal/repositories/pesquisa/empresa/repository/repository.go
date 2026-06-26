package empresa

import (
	"database/sql"
	"fmt"
	"strings"

	"pandora-go-server/internal/modelconfig"
)

// SQLRepository executa consultas SQL especificas do dominio Empresa/CNPJ.
type SQLRepository struct {
	db     *sql.DB
	models modelconfig.Registry
}

// NewSQLRepository cria o repository chamado por EmpresaUseCase.
func NewSQLRepository(db *sql.DB, models modelconfig.Registry) SQLRepository {
	return SQLRepository{db: db, models: models}
}

func (m SQLRepository) table(modelName string, key string) (string, bool) {
	if m.db == nil {
		return "", false
	}
	return m.models.Table(modelName, key)
}

func (m SQLRepository) sigla(modelName string, fallback string) string {
	model, ok := m.models.Get(modelName)
	if !ok || strings.TrimSpace(model.Sigla) == "" {
		return fallback
	}
	return strings.TrimSpace(model.Sigla)
}

func (m SQLRepository) modelVar(modelName string, key string, fallback string) string {
	model, ok := m.models.Get(modelName)
	if !ok || model.Vars == nil {
		return fallback
	}
	value, ok := model.Vars[key]
	if !ok || value == nil {
		return fallback
	}
	text := strings.TrimSpace(fmt.Sprint(value))
	if text == "" {
		return fallback
	}
	return text
}

func sqlLiteral(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "''") + "'"
}

func textSearch(value string) string {
	parts := strings.Fields(strings.TrimSpace(value))
	if len(parts) == 0 {
		return value
	}
	return `"` + strings.Join(parts, "*\" AND \"") + `*"`
}
