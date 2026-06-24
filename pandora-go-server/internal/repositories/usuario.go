package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/types"
)

type UsuarioRepository interface {
	LoginStatus(context.Context, string) (UsuarioStatus, error)
	AuthenticateLocal(context.Context, string, string) error
	AuthorizedAppByToken(context.Context, string) (AuthorizedApp, error)
	ListAuthorizedApps(context.Context) ([]types.AplicativoAutorizado, error)
	CreateAuthorizedApp(context.Context, types.AplicativoPayload, string) error
	UpdateAuthorizedApp(context.Context, types.AplicativoPayload) error
	DeleteAuthorizedApp(context.Context, int64) error
	FindByLogin(context.Context, string) (types.Usuario, error)
	FindByID(context.Context, int64) (types.Usuario, error)
	ListUsers(context.Context, string) ([]types.UsuarioAdmin, error)
	Permissions(context.Context, string, int64) ([]types.Permissao, error)
	StoreTFASecret(context.Context, string, string) error
	MarkTFASetup(context.Context, string) error
	ListProfiles(context.Context) ([]string, error)
	ListFullProfiles(context.Context) ([]types.PerfilAdmin, error)
	ListAccesses(context.Context) ([]string, error)
	ListGroups(context.Context) ([]string, error)
	ListPermissionCatalog(context.Context) ([]map[string]string, error)
	ProfilePermissions(context.Context, int64) ([]types.Permissao, error)
	ProfileSchedule(context.Context, int64) (types.PerfilHorario, error)
	UsersByProfile(context.Context, int64) ([]types.PerfilUsuario, error)
	ListDeletedUsers(context.Context) ([]types.UsuarioFalso, error)
	ListBlacklist(context.Context) ([]types.ListaNegraUsuario, error)
	APIQueriesSummary(context.Context, *int, *int) ([]types.APIResumoMensal, error)
	APIQueriesMonthly(context.Context, *int, *int, string) ([]types.APIConsultaMensal, error)
	RecentLogs(context.Context, int, int) ([]types.LogSistema, error)
	LegacyNoProfileLogsCount(context.Context) (int64, error)
	ValidTokens(context.Context, int) ([]map[string]any, error)
	AuditPix(context.Context, map[string]string) ([]map[string]any, error)
	RecurrentProcesses(context.Context, string, string) ([]map[string]any, error)
	RecurrentProcessDetails(context.Context, string, string, string, string) ([]map[string]any, error)
	ErrorLogs(context.Context, map[string]string) ([]map[string]any, error)
	UpsertErrorLog(context.Context, types.ErrorLogPayload) error
	AuditAlerts(context.Context, string, int, string) ([]map[string]any, error)
	Rankings(context.Context, string, string, string, string) ([]map[string]any, error)
	Resources(context.Context, string, string, string, string, string) ([]map[string]any, error)
	ProcessesMostUsed(context.Context, string) ([]map[string]any, error)
	UsersSearchedValue(context.Context, string, string, string) ([]map[string]any, error)
	UsageStats(context.Context, string, string) ([]map[string]any, error)
	NotFoundRecords(context.Context) ([]map[string]any, error)
	IntegraRequests(context.Context) ([]map[string]any, error)
	FinishIntegraRequest(context.Context, int64) error
	IntegraHistoryByProfile(context.Context, string) ([]map[string]any, error)
	IntegraServiceHistory(context.Context) ([]map[string]any, error)
	IntegraDashboard(context.Context) ([]map[string]any, error)
	IntegraAttachment(context.Context, int64) (types.IntegraAttachment, error)
	ActiveMailerUsers(context.Context) ([]map[string]any, error)
	AccessLimitIPHistory(context.Context, bool) ([]map[string]any, error)
	AccessLimitUserHistory(context.Context) ([]map[string]any, error)
	ListInactivePreUsers(context.Context) ([]types.PessoaUsuarioCadastro, error)
	FindPreUser(context.Context, int64) (types.PessoaUsuarioCadastro, error)
	UserLogs(context.Context, string, *int) ([]types.LogAcessoUsuario, error)
	UserLogsByCPF(context.Context, string, *int) ([]types.LogAcessoUsuario, error)
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
	CreateUserFromActivation(context.Context, types.PessoaUsuarioCadastro) error
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
