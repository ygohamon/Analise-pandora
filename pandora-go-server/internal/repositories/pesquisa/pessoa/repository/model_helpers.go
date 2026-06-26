package pessoa

import (
	"fmt"
	"strings"

	"pandora-go-server/internal/modelconfig"
)

func (m pessoaStore) modelSigla(modelName string, fallback string) string {
	model, ok := m.models.Get(modelName)
	if !ok || strings.TrimSpace(model.Sigla) == "" {
		return fallback
	}
	return strings.TrimSpace(model.Sigla)
}

func sqlLiteral(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "''") + "'"
}

func (m pessoaStore) modelTable(modelName string, key string) (modelconfig.Model, string, bool) {
	model, ok := m.models.Get(modelName)
	if !ok || !model.Ativado {
		return modelconfig.Model{}, "", false
	}
	table, ok := m.models.Table(modelName, key)
	return model, table, ok
}

func (m pessoaStore) modelVar(modelName string, key string, fallback string) string {
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

func (m pessoaStore) modelVarInt(modelName string, key string, fallback int) int {
	text := m.modelVar(modelName, key, "")
	if text == "" {
		return fallback
	}
	var value int
	if _, err := fmt.Sscanf(text, "%d", &value); err != nil || value <= 0 {
		return fallback
	}
	return value
}
