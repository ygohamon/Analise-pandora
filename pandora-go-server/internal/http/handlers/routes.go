package handlers

import (
	"net/http"

	"pandora-go-server/internal/cache"
	"pandora-go-server/internal/config"
	analisehandler "pandora-go-server/internal/http/handlers/analise"
	appshandler "pandora-go-server/internal/http/handlers/apps"
	pesquisahandler "pandora-go-server/internal/http/handlers/pesquisa"
	sistemahandler "pandora-go-server/internal/http/handlers/sistema"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/services"
	"pandora-go-server/internal/types"
	sistemauc "pandora-go-server/internal/usecases"
	analiseuc "pandora-go-server/internal/usecases/analise"
	appsuc "pandora-go-server/internal/usecases/apps"
	pesquisauc "pandora-go-server/internal/usecases/pesquisa"
)

// Handler e o compositor HTTP raiz.
// As rotas concretas ficam separadas por secao em pesquisa, analise e sistema.
type Handler struct {
	pesquisa pesquisahandler.Handler
	analise  analisehandler.Handler
	apps     appshandler.Handler
	sistema  sistemahandler.Handler
}

func NewHandler(pessoas pesquisauc.PessoaUseCase, empresa pesquisauc.EmpresaUseCase, endereco pesquisauc.EnderecoUseCase, veiculo pesquisauc.VeiculoConsultaUseCase, embarcacao pesquisauc.EmbarcacaoUseCase, aeronave pesquisauc.AeronaveUseCase, obito pesquisauc.ObitoUseCase, beneficio pesquisauc.BeneficioUseCase, telefone pesquisauc.TelefoneUseCase, orcrim pesquisauc.OrcrimUseCase, pesquisa pesquisauc.UseCases, analise analiseuc.UseCase, apps appsuc.UseCase, bcccs pesquisauc.BCCCSUseCase, sistema sistemauc.SistemaUseCase, authService services.AuthService, cfg config.Config, cacheStore *cache.Memory) Handler {
	return Handler{
		pesquisa: pesquisahandler.NewHandler(pessoas, empresa, endereco, veiculo, embarcacao, aeronave, obito, beneficio, telefone, orcrim, pesquisa, bcccs),
		analise:  analisehandler.NewHandler(analise),
		apps:     appshandler.NewHandler(apps),
		sistema:  sistemahandler.NewHandler(sistema, authService, cfg, cacheStore),
	}
}

func (h Handler) Register(mux *http.ServeMux, protected func(http.Handler) http.Handler, admin func(http.Handler) http.Handler) {
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("GET /ping", h.health)
	mux.HandleFunc("GET /metrics", h.metrics)

	h.sistema.Register(mux, protected, admin)
	h.pesquisa.Register(mux, protected, admin)
	h.analise.Register(mux, protected)
	h.apps.Register(mux, protected, admin)

	mux.HandleFunc("/", h.notMigrated)
}

func (h Handler) health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte("ok"))
}

func (h Handler) metrics(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; version=0.0.4")
	_, _ = w.Write([]byte("# HELP pandora_go_server_up Server availability\n# TYPE pandora_go_server_up gauge\npandora_go_server_up 1\n"))
}

func (h Handler) notMigrated(w http.ResponseWriter, _ *http.Request) {
	httpx.ErrorFrom(w, types.ErrNotMigrated)
}
