package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"pandora-go-server/internal/app"
	"pandora-go-server/internal/config"
	"pandora-go-server/internal/database"
	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/modelconfig"
)

func main() {
	cfg := config.Load()
	var handler slog.Handler
	if cfg.Env == "production" || cfg.LogFormat == "json" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: cfg.LogLevel})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: cfg.LogLevel,
			ReplaceAttr: func(_ []string, attr slog.Attr) slog.Attr {
				if attr.Key == slog.TimeKey {
					return slog.Attr{}
				}
				return attr
			},
		})
	}
	logger := slog.New(handler)
	slog.SetDefault(logger)

	models, err := modelconfig.LoadDefault(logger)
	if err != nil {
		logger.Error("model config initialization failed", "error", err)
		os.Exit(1)
	}
	externalAPIs := models.ExternalAPIs()
	if cfg.CrawlersURL != "" {
		externalAPIs = append(externalAPIs, "PANDORA_CRAWLERS.URL")
	}
	logStartup(cfg.Env, fmt.Sprintf("MODELS LOADED TOTAL: %d ACTIVED: %d APIS: %d", models.Count(), models.ActiveCount(), len(externalAPIs)))
	for _, apiName := range externalAPIs {
		sharedintegrations.LogDependencyStatus(context.Background(), "api", apiName, "configured")
	}

	db, err := database.Open(cfg.Database)
	if err != nil {
		logger.Error("database initialization failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	if cfg.Database.Driver == "" {
		logger.Warn("database not configured; query routes will fail until BD_* envs are provided")
		sharedintegrations.LogDependencyStatus(context.Background(), "database", "primary", "not_configured")
	} else {
		databaseName := databaseDisplayName()
		pingCtx, pingCancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := db.PingContext(pingCtx); err != nil {
			logger.Error("database connection failed", "driver", cfg.Database.Driver, "error", err)
			sharedintegrations.LogDependencyStatus(context.Background(), "database", databaseName, "falha", "error", err)
			pingCancel()
			os.Exit(1)
		}
		pingCancel()
		sharedintegrations.LogDependencyStatus(context.Background(), "database", databaseName, "ok",
			"max_open_conns", cfg.Database.MaxOpenConns,
			"max_idle_conns", cfg.Database.MaxIdleConns,
			"conn_max_lifetime", cfg.Database.ConnMaxLifetime.String(),
		)
	}
	if cfg.Env == "production" {
		logger.Info("runtime ready",
			"env", cfg.Env,
			"port", cfg.Port,
			"request_timeout", cfg.RequestTimeout.String(),
			"cache_ttl", cfg.CacheTTL.String(),
			"rate_limit_per_minute", cfg.RateLimitPerMin,
		)
	} else {
		logStartup(cfg.Env, fmt.Sprintf("RUNTIME MODE: %s, TIMEOUT: %s, CACHE: %s, RATE_LIMIT: %d/MIN",
			runtimeMode(cfg.Env), spacedDuration(cfg.RequestTimeout), spacedDuration(cfg.CacheTTL), cfg.RateLimitPerMin))
	}

	server := app.NewServer(cfg, logger, db, models)
	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel()
	if cfg.Database.Driver != "" {
		go watchDatabaseStatus(appCtx, db, databaseDisplayName(), 30*time.Second)
	}

	go func() {
		if cfg.Env == "production" {
			logger.Info("pandora-go-server listening", "addr", server.Addr)
		} else {
			logStartup(cfg.Env, "LISTENING PORT = "+cfg.Port)
		}
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("http server failed", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}
	if cfg.Env == "production" {
		logger.Info("pandora-go-server stopped")
	} else {
		logStartup(cfg.Env, "STOPPED")
	}
}

func logStartup(env, message string) {
	if env == "production" {
		return
	}
	fmt.Fprintf(os.Stdout, "%s %s %s\n", time.Now().Format("15:04:05.000"), yellow("[ BOOT ]"), message)
}

func databaseDisplayName() string {
	if name := os.Getenv("BD_DATABASE"); name != "" {
		return name
	}
	return "BD_PANDORA"
}

func runtimeMode(env string) string {
	switch env {
	case "production":
		return "PRODUCTION"
	case "ratification", "homologation", "staging":
		return "RATIFICATION"
	default:
		return "DEVELOPMENT"
	}
}

func spacedDuration(value time.Duration) string {
	text := strings.ToUpper(value.String())
	replacer := strings.NewReplacer("H", " H ", "M", " M ", "S", " S ")
	return strings.Join(strings.Fields(replacer.Replace(text)), " ")
}

func yellow(text string) string {
	return "\033[33m" + text + "\033[0m"
}

func watchDatabaseStatus(ctx context.Context, db *sql.DB, name string, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
			err := db.PingContext(pingCtx)
			cancel()
			if err != nil {
				sharedintegrations.LogDependencyStatus(ctx, "database", name, "falha", "error", err)
				continue
			}
			sharedintegrations.LogDependencyStatus(ctx, "database", name, "ok")
		}
	}
}
