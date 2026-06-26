package usecases

import "context"

import repositories "pandora-go-server/internal/repositories/pesquisa"

// CrawlerSearchPort representa a fonte aberta pandora-crawlers.
// Os integrados chamam esta porta apenas em funcao=crawlers.
type CrawlerSearchPort interface {
	Search(context.Context, string) ([]map[string]any, error)
}

// integradoPessoaPorts declara as portas especificas que o integrado de pessoa
// orquestra. O repository concreto pode continuar implementando o agregado
// legado, mas o usecase passa a documentar sua dependencia por dominio/fonte.
type integradoPessoaPorts interface {
	repositories.PessoaBaseRepository
	repositories.PessoaSimplificadaRepository
	repositories.EnderecoRepository
	repositories.TelefoneRepository
	repositories.ParentescoRepository
	repositories.VizinhoRepository
	repositories.EmpresaRepository
	repositories.VeiculoRepository
	repositories.ProcessoRepository
	repositories.MandadoRepository
	repositories.BeneficioRepository
	repositories.PatrimonioRepository
	repositories.EleitoralRepository
	repositories.VirtualRepository
}

// integradoEmpresaPorts declara as portas locais e externas usadas pelo
// integrado de empresa/CNPJ. A resposta e a ordem das abas continuam no usecase.
type integradoEmpresaPorts interface {
	repositories.EmpresaIntegradoLocalRepository
	repositories.EmpresaIntegradoExternoRepository
}
