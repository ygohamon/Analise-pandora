package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// EmpresaCNPJRepository agrega consultas especificas de empresa mantidas por compatibilidade.
type EmpresaCNPJRepository interface {
	EmpresaDetalhadaRepository
	EmpresaSimplificadaRepository
}

// EmpresaDetalhadaRepository define consulta detalhada de CNPJ.
type EmpresaDetalhadaRepository interface {
	DetalhadoCNPJ(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}

// EmpresaSimplificadaRepository define consultas usadas pelas rotas /empresas/simplificado.
type EmpresaSimplificadaRepository interface {
	SimplificadoCNPJ(context.Context, string) ([]map[string]any, error)
	SimplificadoRazaoSocial(context.Context, string) ([]map[string]any, error)
	SimplificadoNomeFantasia(context.Context, string) ([]map[string]any, error)
	SimplificadoEndereco(context.Context, string) ([]map[string]any, error)
	SimplificadoTelefone(context.Context, string) ([]map[string]any, error)
	SimplificadoEmail(context.Context, string) ([]map[string]any, error)
	SimplificadoSocioPFCPF(context.Context, string) ([]map[string]any, error)
	SimplificadoSocioPFNome(context.Context, string) ([]map[string]any, error)
	SimplificadoSocioPJCNPJ(context.Context, string) ([]map[string]any, error)
}

// IntegradoEmpresaRepository agrupa consultas locais usadas pelo integrado por CNPJ.
type IntegradoEmpresaRepository interface {
	EmpresaCNPJRepository
	EmpresaIntegradoLocalRepository
	EmpresaIntegradoExternoRepository
}

// EmpresaIntegradoLocalRepository define fontes locais reaproveitadas pelo integrado CNPJ.
type EmpresaIntegradoLocalRepository interface {
	LocalEmpresaCNPJ(context.Context, string) ([]map[string]any, error)
	LocalAtividadeEconomicaCNPJ(context.Context, string) ([]map[string]any, error)
	LocalEnderecoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalTelefoneCNPJ(context.Context, string) ([]map[string]any, error)
	LocalContadorCNPJ(context.Context, string) ([]map[string]any, error)
	LocalSocioPFCNPJ(context.Context, string) ([]map[string]any, error)
	LocalSocioPJCNPJ(context.Context, string) ([]map[string]any, error)
	LocalHistoricoQuadroSocietarioCNPJ(context.Context, string) ([]map[string]any, error)
	LocalVirtualCNPJ(context.Context, string) ([]map[string]any, error)
	LocalVeiculoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalAeronaveCNPJ(context.Context, string) ([]map[string]any, error)
	LocalEmbarcacaoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalRIFCNPJ(context.Context, string) ([]map[string]any, error)
	LocalFilialCNPJ(context.Context, string) ([]map[string]any, error)
	LocalEmpenhoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalEmpregadorCNPJ(context.Context, string) ([]map[string]any, error)
	LocalTipologiaCNPJ(context.Context, string) ([]map[string]any, error)
	LocalOperacaoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalProcessoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalImovelCNPJ(context.Context, string) ([]map[string]any, error)
	LocalEleitoralCNPJ(context.Context, string) ([]map[string]any, error)
	LocalAjuntaCNPJ(context.Context, string) ([]map[string]any, error)
	LocalCartorioCNPJ(context.Context, string) ([]map[string]any, error)
}

// EmpresaIntegradoExternoRepository define fontes externas reaproveitadas pelo integrado CNPJ.
type EmpresaIntegradoExternoRepository interface {
	CortexExternoCNPJ(context.Context, string, types.SearchOptions) (map[string][]map[string]any, error)
	CredlinkExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
	ReceitaExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
	SocioReceitaExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
	TransparenciaExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
	TCUExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
	TJSPExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
	JusbrasilExternoCNPJ(context.Context, string) (map[string][]map[string]any, error)
}
