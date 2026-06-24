package database

import (
	"context"
	"database/sql/driver"
)

type noopConnector struct{}

func (noopConnector) Connect(context.Context) (driver.Conn, error) {
	return nil, ErrDatabaseNotConfigured
}

func (noopConnector) Driver() driver.Driver {
	return noopDriver{}
}

type noopDriver struct{}

func (noopDriver) Open(string) (driver.Conn, error) {
	return nil, ErrDatabaseNotConfigured
}
