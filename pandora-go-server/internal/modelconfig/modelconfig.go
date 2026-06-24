package modelconfig

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type Model struct {
	Nome    string         `json:"nome"`
	Ativado bool           `json:"ativado"`
	Sigla   string         `json:"sigla"`
	Params  []string       `json:"params"`
	Vars    map[string]any `json:"vars"`
}

type Registry struct {
	models map[string]Model
}

func LoadDefault(logger *slog.Logger) (Registry, error) {
	return Load(filepath.Join(".envs", "models"), logger)
}

func Load(dir string, logger *slog.Logger) (Registry, error) {
	registry := Registry{models: map[string]Model{}}
	for _, name := range []string{"model.core.json", "model.nacional.json", "model.local.json"} {
		path := filepath.Join(dir, name)
		models, err := loadFile(path)
		if err != nil {
			if os.IsNotExist(err) && name != "model.core.json" {
				if logger != nil {
					logger.Warn("optional model config not found", "file", name)
				}
				continue
			}
			return Registry{}, err
		}
		for _, model := range models {
			if model.Nome == "" {
				continue
			}
			if model.Vars == nil {
				model.Vars = map[string]any{}
			}
			registry.models[model.Nome] = model
		}
	}
	return registry, nil
}

func (r Registry) Get(name string) (Model, bool) {
	model, ok := r.models[name]
	return model, ok
}

func (r Registry) Table(modelName, key string) (string, bool) {
	model, ok := r.Get(modelName)
	if !ok || !model.Ativado {
		return "", false
	}
	value, ok := model.Vars[key]
	if !ok || value == nil {
		return "", false
	}
	text := fmt.Sprint(value)
	return text, text != ""
}

func (r Registry) Count() int {
	return len(r.models)
}

func (r Registry) ActiveCount() int {
	count := 0
	for _, model := range r.models {
		if model.Ativado {
			count++
		}
	}
	return count
}

func (r Registry) ExternalAPIs() []string {
	out := []string{}
	for name, model := range r.models {
		if !model.Ativado {
			continue
		}
		for key, value := range model.Vars {
			text := fmt.Sprint(value)
			if strings.HasPrefix(strings.ToLower(strings.TrimSpace(text)), "http") {
				out = append(out, fmt.Sprintf("%s.%s", name, key))
				break
			}
		}
	}
	sort.Strings(out)
	return out
}

func loadFile(path string) ([]Model, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var models []Model
	if err := json.Unmarshal(raw, &models); err != nil {
		return nil, fmt.Errorf("parse model config %s: %w", path, err)
	}
	return models, nil
}
