package app

import (
	"database/sql"
	"log/slog"
	"net/http"
	"time"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/cache"
	"pandora-go-server/internal/config"
	handlers "pandora-go-server/internal/http/handlers"
	"pandora-go-server/internal/integrations/bcccs"
	"pandora-go-server/internal/middleware"
	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/repositories"
	empresarepo "pandora-go-server/internal/repositories/empresa/repository"
	pessoarepo "pandora-go-server/internal/repositories/pessoa/repository"
	"pandora-go-server/internal/services"
	"pandora-go-server/internal/usecases"
)

func NewServer(cfg config.Config, logger *slog.Logger, db *sql.DB, models modelconfig.Registry) *http.Server {
	apiMux := http.NewServeMux()

	cacheStore := cache.NewMemory()
	jwtVerifier := auth.NewJWTVerifier(cfg.JWTSecret)
	jwtService := auth.NewJWTService(cfg.JWTSecret, cfg.JWTExpiration)
	protected := chain(
		middleware.RequireJWT(jwtVerifier),
		middleware.RequireRequestHash(5*time.Minute),
		middleware.CacheGET(cacheStore, cfg.CacheTTL),
	)
	admin := chain(
		middleware.RequireJWT(jwtVerifier),
		middleware.RequireRequestHash(5*time.Minute),
		middleware.RequireAdmin,
		middleware.CacheGET(cacheStore, cfg.CacheTTL),
	)

	pessoaRepo := pessoarepo.NewSQLRepository(db, models)
	empresaRepo := empresarepo.NewSQLRepository(db, models)
	bcccsRepo := repositories.NewSQLBCCCSRepository(db, models)
	bcccsModel, _ := models.Get("API_BCCCS")
	pessoaUseCase := usecases.NewPessoaUseCase(pessoaRepo)
	empresaUseCase := usecases.NewEmpresaUseCase(empresaRepo)
	bcccsUseCase := usecases.NewBCCCSUseCase(bcccsRepo, bcccs.NewClient(bcccsModel))
	sistemaUseCase := usecases.NewSistemaUseCase(cfg, db)
	usuarioRepo := repositories.NewSQLUsuarioRepository(db, models)
	authService := services.NewAuthService(
		usuarioRepo,
		jwtService,
		services.GoogleRecaptchaVerifier{Secret: cfg.RecaptchaSecret},
		cfg.Env,
		cfg.ServerAESPW,
	)
	handlers.NewHandler(pessoaUseCase, empresaUseCase, bcccsUseCase, sistemaUseCase, authService, cfg, cacheStore).Register(apiMux, protected, admin)

	mux := http.NewServeMux()
	mux.Handle("/server/", http.StripPrefix("/server", apiMux))
	mux.Handle("/", apiMux)

	handler := chain(
		middleware.Recover(logger),
		middleware.RequestID,
		middleware.SecurityHeaders,
		middleware.CORS(cfg.AllowedOrigins, cfg.Env),
		middleware.Timeout(cfg.RequestTimeout),
		middleware.MaxBody(cfg.MaxBodyBytes),
		middleware.RateLimit(cfg.RateLimitPerMin),
		middleware.Logger(logger, cfg.Env),
	)(mux)

	return &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}
}

func chain(middlewares ...func(http.Handler) http.Handler) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		for i := len(middlewares) - 1; i >= 0; i-- {
			next = middlewares[i](next)
		}
		return next
	}
}
