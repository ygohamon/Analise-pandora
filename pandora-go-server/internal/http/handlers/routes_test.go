package handlers

import (
	"net/http"
	"testing"

	"pandora-go-server/internal/cache"
	"pandora-go-server/internal/config"
	"pandora-go-server/internal/services"
	sistemauc "pandora-go-server/internal/usecases"
	analiseuc "pandora-go-server/internal/usecases/analise"
	appsuc "pandora-go-server/internal/usecases/apps"
	pesquisauc "pandora-go-server/internal/usecases/pesquisa"
)

func TestRegisterRoutesDoesNotPanic(t *testing.T) {
	t.Parallel()
	mux := http.NewServeMux()
	identity := func(next http.Handler) http.Handler { return next }

	handler := NewHandler(
		pesquisauc.PessoaUseCase{},
		pesquisauc.EmpresaUseCase{},
		pesquisauc.EnderecoUseCase{},
		pesquisauc.VeiculoConsultaUseCase{},
		pesquisauc.EmbarcacaoUseCase{},
		pesquisauc.AeronaveUseCase{},
		pesquisauc.ObitoUseCase{},
		pesquisauc.BeneficioUseCase{},
		pesquisauc.TelefoneUseCase{},
		pesquisauc.OrcrimUseCase{},
		pesquisauc.UseCases{},
		analiseuc.UseCase{},
		appsuc.UseCase{},
		pesquisauc.BCCCSUseCase{},
		sistemauc.SistemaUseCase{},
		services.AuthService{},
		config.Config{},
		cache.NewMemory(),
	)

	handler.Register(mux, identity, identity)
}
