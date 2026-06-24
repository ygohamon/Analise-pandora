package handlers

import (
	"net/http"

	"pandora-go-server/internal/cache"
	"pandora-go-server/internal/config"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/services"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/usecases"
)

type Handler struct {
	pessoas usecases.PessoaUseCase
	empresa usecases.EmpresaUseCase
	bcccs   usecases.BCCCSUseCase
	sistema usecases.SistemaUseCase
	auth    services.AuthService
	cfg     config.Config
	cache   *cache.Memory
}

func NewHandler(pessoas usecases.PessoaUseCase, empresa usecases.EmpresaUseCase, bcccs usecases.BCCCSUseCase, sistema usecases.SistemaUseCase, authService services.AuthService, cfg config.Config, cacheStore *cache.Memory) Handler {
	return Handler{pessoas: pessoas, empresa: empresa, bcccs: bcccs, sistema: sistema, auth: authService, cfg: cfg, cache: cacheStore}
}

func (h Handler) Register(mux *http.ServeMux, protected func(http.Handler) http.Handler, admin func(http.Handler) http.Handler) {
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("GET /ping", h.health)
	mux.HandleFunc("GET /metrics", h.metrics)
	mux.HandleFunc("POST /login", h.login)
	mux.HandleFunc("POST /loginDev", h.loginDev)
	mux.HandleFunc("POST /loginTemp", h.loginDev)
	mux.HandleFunc("POST /loginByApp", h.loginByApp)
	mux.HandleFunc("POST /preusuarios", h.cadastraPreUsuario)

	mux.Handle("POST /login/setupTFA", protected(http.HandlerFunc(h.setupTFA)))
	mux.Handle("POST /login/verifyTFA", protected(http.HandlerFunc(h.verifyTFA)))
	mux.Handle("GET /usuarios/me", protected(http.HandlerFunc(h.usuarioMe)))
	mux.Handle("GET /usuarios/me/permissao", protected(http.HandlerFunc(h.permissoesMe)))
	mux.Handle("POST /preusuarios/recadastramento", protected(http.HandlerFunc(h.recadastraPreUsuario)))
	mux.Handle("GET /usuarios/falsos", admin(http.HandlerFunc(h.listaUsuariosFalsos)))
	mux.Handle("GET /usuarios", admin(http.HandlerFunc(h.listaUsuarios)))
	mux.Handle("GET /usuarios/", admin(http.HandlerFunc(h.usuariosGetSubroute)))
	mux.Handle("GET /sistema/perfil", admin(http.HandlerFunc(h.listaPerfis)))
	mux.Handle("GET /sistema/perfis", admin(http.HandlerFunc(h.listaPerfisCompletos)))
	mux.Handle("GET /sistema/perfil/{id}/permissao", admin(http.HandlerFunc(h.permissoesPerfil)))
	mux.Handle("GET /sistema/perfil/{id}/horario", admin(http.HandlerFunc(h.horarioPerfil)))
	mux.Handle("GET /sistema/perfil/{id}/usuarios", admin(http.HandlerFunc(h.usuariosPorPerfil)))
	mux.Handle("GET /sistema/acesso", admin(http.HandlerFunc(h.listaAcessos)))
	mux.Handle("GET /sistema/grupo", admin(http.HandlerFunc(h.listaGrupos)))
	mux.Handle("GET /sistema/permissao", admin(http.HandlerFunc(h.listaPermissoesSistema)))
	mux.Handle("POST /sistema/mail/enviar", admin(http.HandlerFunc(h.enviarEmail)))
	mux.Handle("GET /sistema/mail/info", admin(http.HandlerFunc(h.mailInfo)))
	mux.Handle("GET /sistema/db/info", admin(http.HandlerFunc(h.dbInfo)))
	mux.Handle("GET /sistema/apicache/info", admin(http.HandlerFunc(h.apiCacheInfo)))
	mux.Handle("GET /sistema/apicache/index", admin(http.HandlerFunc(h.apiCacheIndex)))
	mux.Handle("GET /sistema/apicache/clear", admin(http.HandlerFunc(h.clearAPICache)))
	mux.Handle("GET /sistema/modelcache/info", admin(http.HandlerFunc(h.modelCacheInfo)))
	mux.Handle("GET /sistema/modelcache/index", admin(http.HandlerFunc(h.modelCacheIndex)))
	mux.Handle("GET /sistema/modelcache/clear", admin(http.HandlerFunc(h.clearModelCache)))
	mux.Handle("GET /sistema/limitesacesso/ip/historico", admin(http.HandlerFunc(h.limiteAcessoIPHistorico)))
	mux.Handle("GET /sistema/limitesacesso/ip/historico/{key}", admin(http.HandlerFunc(h.limiteAcessoIPHistorico)))
	mux.Handle("GET /sistema/limitesacesso/ip/blacklist", admin(http.HandlerFunc(h.limiteAcessoIPBlacklist)))
	mux.Handle("GET /sistema/limitesacesso/ip", admin(http.HandlerFunc(h.limiteAcessoIPInfo)))
	mux.Handle("GET /sistema/limitesacesso/ip/{key}", admin(http.HandlerFunc(h.limiteAcessoIPInfo)))
	mux.Handle("DELETE /sistema/limitesacesso/ip", admin(http.HandlerFunc(h.clearLimiteAcessoIP)))
	mux.Handle("DELETE /sistema/limitesacesso/ip/{key}", admin(http.HandlerFunc(h.clearLimiteAcessoIP)))
	mux.Handle("GET /sistema/limitesacesso/usuario/historico", admin(http.HandlerFunc(h.limiteAcessoUsuarioHistorico)))
	mux.Handle("GET /sistema/limitesacesso/usuario/historico/{key}", admin(http.HandlerFunc(h.limiteAcessoUsuarioHistorico)))
	mux.Handle("GET /sistema/limitesacesso/usuario", admin(http.HandlerFunc(h.limiteAcessoUsuarioInfo)))
	mux.Handle("GET /sistema/limitesacesso/usuario/{key}", admin(http.HandlerFunc(h.limiteAcessoUsuarioInfo)))
	mux.Handle("DELETE /sistema/limitesacesso/usuario", admin(http.HandlerFunc(h.clearLimiteAcessoUsuario)))
	mux.Handle("DELETE /sistema/limitesacesso/usuario/{key}", admin(http.HandlerFunc(h.clearLimiteAcessoUsuario)))
	mux.Handle("GET /sistema/integra", admin(http.HandlerFunc(h.listaRequisicoesIntegra)))
	mux.Handle("PATCH /sistema/integra/finaliza/{id}", admin(http.HandlerFunc(h.finalizaRequisicaoIntegra)))
	mux.Handle("GET /sistema/integra/historico/perfil/{perfil}", admin(http.HandlerFunc(h.historicoIntegraPorPerfil)))
	mux.Handle("GET /sistema/integra/historico/atendimento", admin(http.HandlerFunc(h.historicoIntegraAtendimento)))
	mux.Handle("GET /sistema/integra/dashboard", admin(http.HandlerFunc(h.dashboardIntegra)))
	mux.Handle("GET /integra/anexo/{id}", admin(http.HandlerFunc(h.downloadAnexoIntegra)))
	mux.Handle("GET /aplicativos", admin(http.HandlerFunc(h.listaAplicativos)))
	mux.Handle("GET /aplicativos/", admin(http.HandlerFunc(h.listaAplicativos)))
	mux.Handle("POST /aplicativos/criar", admin(http.HandlerFunc(h.criaAplicativo)))
	mux.Handle("PATCH /aplicativos/atualizar/{id}", admin(http.HandlerFunc(h.atualizaAplicativo)))
	mux.Handle("DELETE /aplicativos/{id}", admin(http.HandlerFunc(h.removeAplicativo)))
	mux.Handle("GET /logs/lista-negra", admin(http.HandlerFunc(h.listaNegraPandora)))
	mux.Handle("GET /logs", admin(http.HandlerFunc(h.logsRecentes)))
	mux.Handle("GET /logs/usuario", admin(http.HandlerFunc(h.logsUsuarioQuery)))
	mux.Handle("GET /logs/rankings", admin(http.HandlerFunc(h.rankings)))
	mux.Handle("GET /logs/recursos", admin(http.HandlerFunc(h.recursosMaisUtilizados)))
	mux.Handle("GET /logs/processos", admin(http.HandlerFunc(h.processosMaisUtilizados)))
	mux.Handle("GET /logs/tokens", admin(http.HandlerFunc(h.tokensValidos)))
	mux.Handle("GET /logs/usuarios", admin(http.HandlerFunc(h.usuariosQuePesquisaram)))
	mux.Handle("GET /logs/auditoria-pix", admin(http.HandlerFunc(h.auditoriaPix)))
	mux.Handle("GET /logs/processos-reincidentes", admin(http.HandlerFunc(h.processosReincidentes)))
	mux.Handle("GET /logs/processos-reincidentes/detalhes", admin(http.HandlerFunc(h.detalhesProcessoReincidente)))
	mux.Handle("POST /logs/erros", protected(http.HandlerFunc(h.registraLogErro)))
	mux.Handle("GET /logs/erros", admin(http.HandlerFunc(h.logsErros)))
	mux.Handle("GET /logs/alertas-auditoria", admin(http.HandlerFunc(h.alertasAuditoria)))
	mux.Handle("GET /logs/utilizacao", admin(http.HandlerFunc(h.estatisticasUso)))
	mux.Handle("GET /logs/naoencontrados", admin(http.HandlerFunc(h.registrosNaoEncontrados)))
	mux.Handle("GET /logs/apis/resumo", admin(http.HandlerFunc(h.resumoAPIs)))
	mux.Handle("GET /logs/apis/mensal", admin(http.HandlerFunc(h.consultasAPIsMensal)))
	mux.Handle("GET /logs/legado-sem-perfil/resumo", admin(http.HandlerFunc(h.resumoLogsLegadosSemPerfil)))
	mux.Handle("GET /logs/usuario/{usuario}", admin(http.HandlerFunc(h.logsUsuario)))
	mux.Handle("GET /preusuarios/inativos", admin(http.HandlerFunc(h.listaPreUsuariosInativos)))
	mux.Handle("GET /preusuarios/{id}", admin(http.HandlerFunc(h.getPreUsuario)))
	mux.Handle("DELETE /preusuarios/", admin(http.HandlerFunc(h.preUsuariosDeleteSubroute)))
	mux.Handle("POST /preusuarios/", admin(http.HandlerFunc(h.preUsuariosPostSubroute)))
	mux.Handle("GET /pessoas/simplificado/cpf/{cpf}", protected(http.HandlerFunc(h.pessoaSimplificadoCPF)))
	mux.Handle("GET /pessoas/simplificado/nome/{nome}", protected(http.HandlerFunc(h.pessoaSimplificadoNome)))
	mux.Handle("GET /pessoas/simplificado/rg/{rg}", protected(http.HandlerFunc(h.pessoaSimplificadoRG)))
	mux.Handle("GET /pessoas/simplificado/cnh/{cnh}", protected(http.HandlerFunc(h.pessoaSimplificadoCNH)))
	mux.Handle("GET /pessoas/simplificado/titulo/{titulo}", protected(http.HandlerFunc(h.pessoaSimplificadoTitulo)))
	mux.Handle("GET /pessoas/simplificado/nomepai/{nome}", protected(http.HandlerFunc(h.pessoaSimplificadoNomePai)))
	mux.Handle("GET /pessoas/simplificado/nomemae/{nome}", protected(http.HandlerFunc(h.pessoaSimplificadoNomeMae)))
	mux.Handle("GET /pessoas/simplificado/telefone/{telefone}", protected(http.HandlerFunc(h.pessoaSimplificadoTelefone)))
	mux.Handle("GET /pessoas/simplificado/email/{email}", protected(http.HandlerFunc(h.pessoaSimplificadoEmail)))
	mux.Handle("GET /pessoas/simplificado/endereco/{endereco}", protected(http.HandlerFunc(h.pessoaSimplificadoEndereco)))
	mux.Handle("GET /pessoas/integrado/cpf/{cpf}", protected(http.HandlerFunc(h.pessoaIntegradoCPF)))
	mux.Handle("GET /v1/pessoas/integrado/cpf/{cpf}", protected(http.HandlerFunc(h.pessoaIntegradoCPF)))
	mux.Handle("GET /pessoas/integrado/rg/{rg}", protected(http.HandlerFunc(h.pessoaIntegradoRG)))
	mux.Handle("GET /pessoas/integrado/nome/{nome}", protected(http.HandlerFunc(h.pessoaIntegradoNome)))
	mux.Handle("GET /antecedentes/rg/{rg}/{login}", protected(http.HandlerFunc(h.antecedentePDFRG)))
	mux.Handle("GET /empresas/simplificado/cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaSimplificadoCNPJ)))
	mux.Handle("GET /empresas/simplificado/razaosocial/{razaosocial}", protected(http.HandlerFunc(h.empresaSimplificadoRazaoSocial)))
	mux.Handle("GET /empresas/simplificado/nomefantasia/{nomefantasia}", protected(http.HandlerFunc(h.empresaSimplificadoNomeFantasia)))
	mux.Handle("GET /empresas/simplificado/endereco/{endereco}", protected(http.HandlerFunc(h.empresaSimplificadoEndereco)))
	mux.Handle("GET /empresas/simplificado/telefone/{telefone}", protected(http.HandlerFunc(h.empresaSimplificadoTelefone)))
	mux.Handle("GET /empresas/simplificado/email/{email}", protected(http.HandlerFunc(h.empresaSimplificadoEmail)))
	mux.Handle("GET /empresas/simplificado/sociopf_cpf/{cpf}", protected(http.HandlerFunc(h.empresaSimplificadoSocioPFCPF)))
	mux.Handle("GET /empresas/simplificado/sociopf_nome/{nome}", protected(http.HandlerFunc(h.empresaSimplificadoSocioPFNome)))
	mux.Handle("GET /empresas/simplificado/sociopj_cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaSimplificadoSocioPJCNPJ)))
	mux.Handle("GET /empresas/detalhado/cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaDetalhadoCNPJ)))
	mux.Handle("GET /empresas/integrado/cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaIntegradoCNPJ)))
	mux.Handle("POST /bcccs/pix/cpf/{cpf}", protected(http.HandlerFunc(h.bcccsPixCPF)))
	mux.Handle("POST /bcccs/pix/cnpj/{cnpj}", protected(http.HandlerFunc(h.bcccsPixCNPJ)))
	mux.Handle("POST /bcccs/pix/chave/{chave}", protected(http.HandlerFunc(h.bcccsPixChave)))
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
