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
	"pandora-go-server/internal/integrations/crawlers"
	"pandora-go-server/internal/middleware"
	"pandora-go-server/internal/modelconfig"
	analiserepo "pandora-go-server/internal/repositories/analise"
	appsrepo "pandora-go-server/internal/repositories/apps"
	pesquisarepo "pandora-go-server/internal/repositories/pesquisa"
	empresarepo "pandora-go-server/internal/repositories/pesquisa/empresa/repository"
	pessoarepo "pandora-go-server/internal/repositories/pesquisa/pessoa/repository"
	sistemarepo "pandora-go-server/internal/repositories/sistema"
	"pandora-go-server/internal/services"
	"pandora-go-server/internal/usecases"
	analiseuc "pandora-go-server/internal/usecases/analise"
	appsuc "pandora-go-server/internal/usecases/apps"
	pesquisauc "pandora-go-server/internal/usecases/pesquisa"
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
	consultaRepo := pesquisarepo.NewConsultaOperacionalRepository(pessoaRepo, empresaRepo)
	pesquisaRepo := pesquisarepo.NewRepository(db, models)
	analiseRepo := analiserepo.NewRepository(db, models)
	appsRepo := appsrepo.NewRepository(db, models)
	bcccsRepo := pesquisarepo.NewSQLBCCCSRepository(db, models)
	bcccsModel, _ := models.Get("API_BCCCS")
	var crawlerPort pesquisauc.CrawlerSearchPort
	if cfg.CrawlersURL != "" {
		crawlerPort = crawlers.NewClient(cfg.CrawlersURL, cfg.CrawlersTimeout)
	}
	pessoaUseCase := pesquisauc.NewPessoaUseCase(pessoaRepo, crawlerPort)
	empresaUseCase := pesquisauc.NewEmpresaUseCase(empresaRepo, crawlerPort)
	enderecoUseCase := pesquisauc.NewEnderecoUseCase(consultaRepo)
	veiculoUseCase := pesquisauc.NewVeiculoConsultaUseCase(consultaRepo)
	embarcacaoUseCase := pesquisauc.NewEmbarcacaoUseCase(consultaRepo)
	aeronaveUseCase := pesquisauc.NewAeronaveUseCase(consultaRepo)
	obitoUseCase := pesquisauc.NewObitoUseCase(consultaRepo)
	beneficioUseCase := pesquisauc.NewBeneficioUseCase(consultaRepo)
	telefoneUseCase := pesquisauc.NewTelefoneUseCase(consultaRepo)
	orcrimUseCase := pesquisauc.NewOrcrimUseCase(consultaRepo)
	pesquisaUseCases := pesquisauc.NewUseCases(pesquisaRepo)
	analiseUseCase := analiseuc.NewUseCase(analiseRepo)
	appsUseCase := appsuc.NewUseCase(appsRepo)
	bcccsUseCase := pesquisauc.NewBCCCSUseCase(bcccsRepo, bcccs.NewClient(bcccsModel))
	sistemaUseCase := usecases.NewSistemaUseCase(cfg, db)
	usuarioRepo := sistemarepo.NewSQLUsuarioRepository(db, models)
	authService := services.NewAuthService(
		usuarioRepo,
		jwtService,
		services.GoogleRecaptchaVerifier{Secret: cfg.RecaptchaSecret},
		cfg.Env,
		cfg.ServerAESPW,
	)
	handlers.NewHandler(pessoaUseCase, empresaUseCase, enderecoUseCase, veiculoUseCase, embarcacaoUseCase, aeronaveUseCase, obitoUseCase, beneficioUseCase, telefoneUseCase, orcrimUseCase, pesquisaUseCases, analiseUseCase, appsUseCase, bcccsUseCase, sistemaUseCase, authService, cfg, cacheStore).Register(apiMux, protected, admin)

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
