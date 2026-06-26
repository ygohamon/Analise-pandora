package sistema

import (
	"net/http"

	"pandora-go-server/internal/cache"
	"pandora-go-server/internal/config"
	"pandora-go-server/internal/services"
	sistemauc "pandora-go-server/internal/usecases"
)

// Handler concentra as rotas administrativas: auth, usuarios, logs e sistema.
type Handler struct {
	sistema sistemauc.SistemaUseCase
	auth    services.AuthService
	cfg     config.Config
	cache   *cache.Memory
}

func NewHandler(sistema sistemauc.SistemaUseCase, authService services.AuthService, cfg config.Config, cacheStore *cache.Memory) Handler {
	return Handler{sistema: sistema, auth: authService, cfg: cfg, cache: cacheStore}
}

func (h Handler) Register(mux *http.ServeMux, protected func(http.Handler) http.Handler, admin func(http.Handler) http.Handler) {
	mux.HandleFunc("POST /login", h.login)
	mux.HandleFunc("POST /loginDev", h.loginDev)
	mux.HandleFunc("POST /loginTemp", h.loginDev)
	mux.HandleFunc("POST /loginByApp", h.loginByApp)
	mux.HandleFunc("POST /preusuarios", h.cadastraPreUsuario)

	mux.Handle("POST /login/setupTFA", protected(http.HandlerFunc(h.setupTFA)))
	mux.Handle("POST /login/verifyTFA", protected(http.HandlerFunc(h.verifyTFA)))
	mux.Handle("GET /usuarios/me", protected(http.HandlerFunc(h.usuarioMe)))
	mux.Handle("GET /usuarios/me/permissao", protected(http.HandlerFunc(h.permissoesMe)))
	mux.Handle("POST /usuarios/validar-senha", protected(http.HandlerFunc(h.validarSenhaAtual)))
	mux.Handle("PATCH /usuarios/{id}/trocasenha", protected(http.HandlerFunc(h.trocaSenhaUsuario)))
	mux.Handle("PATCH /usuarios/{id}", protected(http.HandlerFunc(h.atualizaPreferenciasUsuario)))
	mux.Handle("PATCH /preusuarios/{id}/termo", protected(http.HandlerFunc(h.atualizaTermoPreUsuario)))
	mux.Handle("GET /historico/me/{id}", protected(http.HandlerFunc(h.meuHistorico)))
	mux.Handle("POST /preusuarios/recadastramento", protected(http.HandlerFunc(h.recadastraPreUsuario)))
	mux.Handle("GET /usuarios/falsos", admin(http.HandlerFunc(h.listaUsuariosFalsos)))
	mux.Handle("POST /usuarios/falsos/remover", admin(http.HandlerFunc(h.removeUsuarioFalso)))
	mux.Handle("POST /usuarios/lista-negra/{acao}", admin(http.HandlerFunc(h.alteraListaNegraUsuario)))
	mux.Handle("PATCH /usuarios/{id}/redefinirsenha", admin(http.HandlerFunc(h.redefineSenhaUsuario)))
	mux.Handle("PATCH /usuarios/reset-geral", admin(http.HandlerFunc(h.redefineSenhasGeral)))
	mux.Handle("POST /usuarios/resetTfa", admin(http.HandlerFunc(h.resetTFAUsuario)))
	mux.Handle("DELETE /usuarios/{id}", admin(http.HandlerFunc(h.removeUsuarioPorIdentificador)))
	mux.Handle("GET /usuarios", admin(http.HandlerFunc(h.listaUsuarios)))
	mux.Handle("GET /usuarios/", admin(http.HandlerFunc(h.usuariosGetSubroute)))
	mux.Handle("GET /sistema/perfil", admin(http.HandlerFunc(h.listaPerfis)))
	mux.Handle("GET /sistema/perfis", admin(http.HandlerFunc(h.listaPerfisCompletos)))
	mux.Handle("POST /sistema/perfil", admin(http.HandlerFunc(h.criaPerfil)))
	mux.Handle("DELETE /sistema/perfil/{id}", admin(http.HandlerFunc(h.removePerfil)))
	mux.Handle("GET /sistema/perfil/{id}/permissao", admin(http.HandlerFunc(h.permissoesPerfil)))
	mux.Handle("PATCH /sistema/perfil/{id}/permissao", admin(http.HandlerFunc(h.atualizaPermissoesPerfil)))
	mux.Handle("GET /sistema/perfil/{id}/horario", admin(http.HandlerFunc(h.horarioPerfil)))
	mux.Handle("PATCH /sistema/perfil/{id}/horario", admin(http.HandlerFunc(h.atualizaHorarioPerfil)))
	mux.Handle("PATCH /sistema/perfil/{id}/processo", admin(http.HandlerFunc(h.atualizaProcessoPerfil)))
	mux.Handle("PATCH /sistema/perfil/{id}/sessao", admin(http.HandlerFunc(h.atualizaSessaoPerfil)))
	mux.Handle("PATCH /sistema/perfil/{id}/{flag}", admin(http.HandlerFunc(h.atualizaFlagPerfil)))
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
}
