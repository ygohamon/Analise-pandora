package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/types"
)

// UsuarioRepository agrega ports administrativos mantidos por compatibilidade.
type UsuarioRepository interface {
	AuthRepository
	AplicativoRepository
	UsuarioConsultaRepository
	PermissaoRepository
	PerfilRepository
	LogsRepository
	AuditoriaRepository
	IntegraAdminRepository
	SistemaAdminRepository
	PreUsuarioRepository
}

// AuthRepository define consultas de autenticacao e TFA.
type AuthRepository interface {
	LoginStatus(context.Context, string) (UsuarioStatus, error)
	AuthenticateLocal(context.Context, string, string) error
	StoreTFASecret(context.Context, string, string) error
	MarkTFASetup(context.Context, string) error
	UpdatePassword(context.Context, int64, string) error
	ResetTFA(context.Context, string) error
}

// AplicativoRepository define consultas administrativas de aplicativos autorizados.
type AplicativoRepository interface {
	AuthorizedAppByToken(context.Context, string) (AuthorizedApp, error)
	ListAuthorizedApps(context.Context) ([]types.AplicativoAutorizado, error)
	CreateAuthorizedApp(context.Context, types.AplicativoPayload, string) error
	UpdateAuthorizedApp(context.Context, types.AplicativoPayload) error
	DeleteAuthorizedApp(context.Context, int64) error
}

// UsuarioConsultaRepository define consultas administrativas de usuarios.
type UsuarioConsultaRepository interface {
	FindByLogin(context.Context, string) (types.Usuario, error)
	FindByID(context.Context, int64) (types.Usuario, error)
	ListUsers(context.Context, string) ([]types.UsuarioAdmin, error)
	ListDeletedUsers(context.Context) ([]types.UsuarioFalso, error)
	ListBlacklist(context.Context) ([]types.ListaNegraUsuario, error)
	UserLogs(context.Context, string, *int) ([]types.LogAcessoUsuario, error)
	UserLogsByCPF(context.Context, string, *int) ([]types.LogAcessoUsuario, error)
	UserHistory(context.Context, string, int, int) ([]map[string]any, error)
	UpdatePreferences(context.Context, int64, UserPreferencePatch) error
	ResetPassword(context.Context, int64, string) error
	ResetAllLocalPasswords(context.Context, string) error
	RemoveFalseUser(context.Context, map[string]string) error
	SetBlacklistStatus(context.Context, string, map[string]string) error
}

// PermissaoRepository define consultas de permissoes efetivas e catalogo.
type PermissaoRepository interface {
	Permissions(context.Context, string, int64) ([]types.Permissao, error)
	ListPermissionCatalog(context.Context) ([]map[string]string, error)
	ProfilePermissions(context.Context, int64) ([]types.Permissao, error)
}

// PerfilRepository define consultas administrativas de perfis.
type PerfilRepository interface {
	ListProfiles(context.Context) ([]string, error)
	ListFullProfiles(context.Context) ([]types.PerfilAdmin, error)
	ListAccesses(context.Context) ([]string, error)
	ListGroups(context.Context) ([]string, error)
	ProfileSchedule(context.Context, int64) (types.PerfilHorario, error)
	UsersByProfile(context.Context, int64) ([]types.PerfilUsuario, error)
	UpdateProfilePermissions(context.Context, int64, []types.Permissao) error
	UpdateProfileFlag(context.Context, int64, string, any) error
	UpdateProfileSchedule(context.Context, int64, bool, int64, int64) error
	UpdateProfileProcess(context.Context, int64, bool, *int64) error
	UpdateProfileSession(context.Context, int64, int64) error
	CreateProfile(context.Context, types.PerfilAdmin) error
	DeleteProfile(context.Context, int64) error
}

// LogsRepository define consultas administrativas de logs e estatisticas.
type LogsRepository interface {
	APIQueriesSummary(context.Context, *int, *int) ([]types.APIResumoMensal, error)
	APIQueriesMonthly(context.Context, *int, *int, string) ([]types.APIConsultaMensal, error)
	RecentLogs(context.Context, int, int) ([]types.LogSistema, error)
	LegacyNoProfileLogsCount(context.Context) (int64, error)
	ValidTokens(context.Context, int) ([]map[string]any, error)
	ErrorLogs(context.Context, map[string]string) ([]map[string]any, error)
	UpsertErrorLog(context.Context, types.ErrorLogPayload) error
	Rankings(context.Context, string, string, string, string) ([]map[string]any, error)
	Resources(context.Context, string, string, string, string, string) ([]map[string]any, error)
	ProcessesMostUsed(context.Context, string) ([]map[string]any, error)
	UsersSearchedValue(context.Context, string, string, string) ([]map[string]any, error)
	UsageStats(context.Context, string, string) ([]map[string]any, error)
	NotFoundRecords(context.Context) ([]map[string]any, error)
}

// AuditoriaRepository define consultas administrativas de auditoria.
type AuditoriaRepository interface {
	AuditPix(context.Context, map[string]string) ([]map[string]any, error)
	RecurrentProcesses(context.Context, string, string) ([]map[string]any, error)
	RecurrentProcessDetails(context.Context, string, string, string, string) ([]map[string]any, error)
	AuditAlerts(context.Context, string, int, string) ([]map[string]any, error)
}

// IntegraAdminRepository define consultas administrativas do modulo Integra.
type IntegraAdminRepository interface {
	IntegraRequests(context.Context) ([]map[string]any, error)
	FinishIntegraRequest(context.Context, int64) error
	IntegraHistoryByProfile(context.Context, string) ([]map[string]any, error)
	IntegraServiceHistory(context.Context) ([]map[string]any, error)
	IntegraDashboard(context.Context) ([]map[string]any, error)
	IntegraAttachment(context.Context, int64) (types.IntegraAttachment, error)
}

// SistemaAdminRepository define consultas administrativas de sistema e limites.
type SistemaAdminRepository interface {
	ActiveMailerUsers(context.Context) ([]map[string]any, error)
	AccessLimitIPHistory(context.Context, bool) ([]map[string]any, error)
	AccessLimitUserHistory(context.Context) ([]map[string]any, error)
}

// PreUsuarioRepository define consultas administrativas de pre-usuario e ativacao.
type PreUsuarioRepository interface {
	ListInactivePreUsers(context.Context) ([]types.PessoaUsuarioCadastro, error)
	FindPreUser(context.Context, int64) (types.PessoaUsuarioCadastro, error)
	PreUserExistsByCPFOrEmail(context.Context, types.PessoaUsuarioCadastro) (bool, error)
	CreatePreUser(context.Context, types.PessoaUsuarioCadastro, bool) error
	UpdatePreUser(context.Context, types.PessoaUsuarioCadastro, int64) error
	PersonIDByUserID(context.Context, int64) (int64, error)
	UserIDByPersonID(context.Context, int64) (int64, error)
	ActivatePreUser(context.Context, int64) error
	DeactivatePreUser(context.Context, int64) error
	DeletePreUser(context.Context, int64) error
	ActivateUser(context.Context, int64) error
	DeactivateUser(context.Context, int64) error
	SetUserRecadastramento(context.Context, int64, bool) error
	UpdateUserPasswordReset(context.Context, int64, string) error
	CreateUserFromActivation(context.Context, types.PessoaUsuarioCadastro) error
	UpdatePreUserTerm(context.Context, int64, string) error
}

// UserPreferencePatch limita as preferencias que o proprio usuario pode alterar.
type UserPreferencePatch struct {
	TemaEscuro *bool
	ESPA       *bool
}

type UsuarioStatus struct {
	Ativo  bool
	Acesso string
}

type AuthorizedApp struct {
	Nome          string
	Ativo         bool
	DataInicio    sql.NullTime
	DataExpiracao sql.NullTime
}

type SQLUsuarioRepository struct {
	db     *sql.DB
	models modelconfig.Registry
}

func NewSQLUsuarioRepository(db *sql.DB, models modelconfig.Registry) SQLUsuarioRepository {
	return SQLUsuarioRepository{db: db, models: models}
}
