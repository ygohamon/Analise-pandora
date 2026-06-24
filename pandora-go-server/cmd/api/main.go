package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pandora-go-server/internal/app"
	"pandora-go-server/internal/config"
	"pandora-go-server/internal/database"
	"pandora-go-server/internal/modelconfig"
)

func main() {
	cfg := config.Load()
	var handler slog.Handler
	if cfg.Env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: cfg.LogLevel})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: cfg.LogLevel})
	}
	logger := slog.New(handler)
	slog.SetDefault(logger)

	models, err := modelconfig.LoadDefault(logger)
	if err != nil {
		logger.Error("model config initialization failed", "error", err)
		os.Exit(1)
	}
	logger.Info("model config loaded", "count", models.Count(), "active", models.ActiveCount(), "external_apis", models.ExternalAPIs())

	db, err := database.Open(cfg.Database)
	if err != nil {
		logger.Error("database initialization failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	if cfg.Database.Driver == "" {
		logger.Warn("database not configured; query routes will fail until BD_* envs are provided")
	} else {
		pingCtx, pingCancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := db.PingContext(pingCtx); err != nil {
			logger.Error("database connection failed", "driver", cfg.Database.Driver, "error", err)
			pingCancel()
			os.Exit(1)
		}
		pingCancel()
		logger.Info("database connected",
			"driver", cfg.Database.Driver,
			"max_open_conns", cfg.Database.MaxOpenConns,
			"max_idle_conns", cfg.Database.MaxIdleConns,
			"conn_max_lifetime", cfg.Database.ConnMaxLifetime.String(),
		)
	}
	logger.Info("runtime ready",
		"env", cfg.Env,
		"port", cfg.Port,
		"request_timeout", cfg.RequestTimeout.String(),
		"cache_ttl", cfg.CacheTTL.String(),
		"rate_limit_per_minute", cfg.RateLimitPerMin,
	)

	server := app.NewServer(cfg, logger, db, models)

	go func() {
		logger.Info("pandora-go-server listening", "addr", server.Addr)
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
	logger.Info("pandora-go-server stopped")
}
