package analise

import (
	"net/http"

	analiseuc "pandora-go-server/internal/usecases/analise"
)

// Handler concentra as rotas da secao Analise e delega para o usecase.
type Handler struct {
	analise analiseuc.UseCase
}

func NewHandler(analise analiseuc.UseCase) Handler {
	return Handler{analise: analise}
}

func (h Handler) Register(mux *http.ServeMux, protected func(http.Handler) http.Handler) {
	mux.Handle("GET /empenhos/{tipo}/{valor}", protected(http.HandlerFunc(h.analiseEmpenhos)))
	mux.Handle("GET /licitacoes/{tipo}/{valor}", protected(http.HandlerFunc(h.analiseLicitacoes)))
	mux.Handle("GET /licitacoes/dados", protected(http.HandlerFunc(h.analiseLicitacaoDados)))
	mux.Handle("GET /aditivos/{tipo}/{valor}", protected(http.HandlerFunc(h.analiseAditivos)))
	mux.Handle("GET /contratos/{tipo}/{valor}", protected(http.HandlerFunc(h.analiseContratos)))
	mux.Handle("GET /tce/{tipo}/{data}", protected(http.HandlerFunc(h.analiseTCE)))
}
