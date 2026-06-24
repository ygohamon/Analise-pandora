package config

import (
	"log/slog"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"pandora-go-server/internal/envfile"
)

type Config struct {
	Env             string
	Port            string
	AllowedOrigins  []string
	JWTSecret       string
	JWTExpiration   time.Duration
	ServerAESPW     string
	RecaptchaSecret string
	RequestTimeout  time.Duration
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	MaxBodyBytes    int64
	CacheTTL        time.Duration
	RateLimitPerMin int
	LogLevel        slog.Level
	Database        DatabaseConfig
}

type DatabaseConfig struct {
	Driver          string
	DSN             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

func Load() Config {
	loadEnvFiles()
	env := getenv("SERVER_ENV", "production")
	return Config{
		Env:             env,
		Port:            getenv("SERVER_PORT", "7000"),
		AllowedOrigins:  splitCSV(os.Getenv("CORS_ORIGINS")),
		JWTSecret:       os.Getenv("JWT_TOKEN_SENHA"),
		JWTExpiration:   durationSeconds("JWT_TOKEN_TEMPO_EXPIRACAO", 3600*6),
		ServerAESPW:     os.Getenv("SERVER_AES_PW"),
		RecaptchaSecret: os.Getenv("GOOGLE_RECAPTCHA_SECRET_KEY"),
		RequestTimeout:  durationSeconds("REQUEST_TIMEOUT_SECONDS", 120),
		ReadTimeout:     durationSeconds("SERVER_READ_TIMEOUT_SECONDS", 10),
		WriteTimeout:    durationSeconds("SERVER_WRITE_TIMEOUT_SECONDS", 180),
		IdleTimeout:     durationSeconds("SERVER_IDLE_TIMEOUT_SECONDS", 120),
		MaxBodyBytes:    int64(intEnv("MAX_BODY_BYTES", 5<<20)),
		CacheTTL:        durationSeconds("CACHE_TTL_SECONDS", 300),
		RateLimitPerMin: intEnv("RATE_LIMIT_PER_MINUTE", 120),
		LogLevel:        logLevel(os.Getenv("LOG_LEVEL")),
		Database: DatabaseConfig{
			Driver:          databaseDriver(),
			DSN:             databaseDSN(),
			MaxOpenConns:    intEnv("DB_MAX_OPEN_CONNS", 50),
			MaxIdleConns:    intEnv("DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetime: durationSeconds("DB_CONN_MAX_LIFETIME_SECONDS", 300),
		},
	}
}

func loadEnvFiles() {
	if explicit := strings.TrimSpace(os.Getenv("ENV_FILE")); explicit != "" {
		_ = envfile.Load(explicit, false)
		return
	}

	env := getenv("SERVER_ENV", "production")
	_ = envfile.Load(filepath.Join(".envs", "."+env, "server.env"), false)

	if env == "production" {
		return
	}
	_ = envfile.Load(filepath.Join(".envs", ".production", "server.env"), false)
}

func databaseDriver() string {
	if driver := strings.TrimSpace(os.Getenv("BD_DRIVER")); driver != "" {
		return driver
	}
	if engine := strings.TrimSpace(os.Getenv("BD_ENGINE")); strings.EqualFold(engine, "pg") {
		return "postgres"
	}
	if os.Getenv("BD_SERVER") != "" {
		return "sqlserver"
	}
	return ""
}

func databaseDSN() string {
	if dsn := strings.TrimSpace(os.Getenv("BD_DSN")); dsn != "" {
		return dsn
	}
	if os.Getenv("BD_SERVER") == "" {
		return ""
	}

	user := url.QueryEscape(os.Getenv("BD_USER"))
	password := url.QueryEscape(os.Getenv("BD_PW"))
	host := os.Getenv("BD_SERVER")
	port := getenv("BD_PORT", "1433")
	query := url.Values{}
	query.Set("database", os.Getenv("BD_DATABASE"))
	if timeout := strings.TrimSpace(os.Getenv("BD_CONNECTION_TIMEOUT")); timeout != "" {
		query.Set("connection timeout", timeout)
	}
	if timeout := strings.TrimSpace(os.Getenv("BD_REQUEST_TIMEOUT")); timeout != "" {
		query.Set("request timeout", timeout)
	}
	return "sqlserver://" + user + ":" + password + "@" + host + ":" + port + "?" + query.Encode()
}

func getenv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func intEnv(key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key)))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func durationSeconds(key string, fallback int) time.Duration {
	return time.Duration(intEnv(key, fallback)) * time.Second
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func logLevel(value string) slog.Level {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
