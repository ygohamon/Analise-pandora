package database

import (
	"database/sql"
	"errors"

	_ "github.com/microsoft/go-mssqldb"

	"pandora-go-server/internal/config"
)

func Open(cfg config.DatabaseConfig) (*sql.DB, error) {
	if cfg.Driver == "" || cfg.DSN == "" {
		return sql.OpenDB(noopConnector{}), nil
	}

	db, err := sql.Open(cfg.Driver, cfg.DSN)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)
	return db, nil
}

var ErrDatabaseNotConfigured = errors.New("database not configured")
