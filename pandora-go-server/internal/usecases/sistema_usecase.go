package usecases

import (
	"context"
	"database/sql"
	"os"
	"strconv"
	"strings"
	"time"

	"pandora-go-server/internal/config"
)

// SistemaUseCase concentra consultas operacionais do painel de sistema.
type SistemaUseCase struct {
	cfg config.Config
	db  *sql.DB
}

// NewSistemaUseCase cria o caso de uso chamado pelos handlers de sistema.
func NewSistemaUseCase(cfg config.Config, db *sql.DB) SistemaUseCase {
	return SistemaUseCase{cfg: cfg, db: db}
}

// DBInfo verifica conectividade do banco e retorna o mesmo formato consumido pelo front.
func (u SistemaUseCase) DBInfo(ctx context.Context) map[string]any {
	connected := false
	if u.db != nil {
		pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		defer cancel()
		connected = u.db.PingContext(pingCtx) == nil
	}
	engine := dbEngineName(u.cfg.Database.Driver)
	return map[string]any{
		"connected": connected,
		"engine":    engine,
		"config": map[string]any{
			"server":            os.Getenv("BD_SERVER"),
			"port":              envInt("BD_PORT", 1433),
			"database":          os.Getenv("BD_DATABASE"),
			"requestTimeout":    envInt("BD_REQUEST_TIMEOUT", 0),
			"connectionTimeout": envInt("BD_CONNECTION_TIMEOUT", 0),
			"engine":            engine,
		},
	}
}

func dbEngineName(driver string) string {
	switch driver {
	case "sqlserver":
		return "mssql"
	case "":
		return "none"
	default:
		return driver
	}
}

func envInt(key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key)))
	if err != nil {
		return fallback
	}
	return value
}
