package services

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/repositories"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

type AuthService struct {
	users     repositories.UsuarioRepository
	jwt       auth.JWTService
	recaptcha RecaptchaVerifier
	env       string
	aesPW     string
}

type pendingTFASetup struct {
	Purpose string `json:"purpose"`
	UserID  int64  `json:"userID"`
	Secret  string `json:"secret"`
}

func NewAuthService(users repositories.UsuarioRepository, jwt auth.JWTService, recaptcha RecaptchaVerifier, env string, aesPW string) AuthService {
	return AuthService{users: users, jwt: jwt, recaptcha: recaptcha, env: env, aesPW: aesPW}
}

func (s AuthService) Login(ctx context.Context, req types.LoginRequest, remoteIP string) (types.LoginResponse, error) {
	if strings.TrimSpace(req.Login) == "" || strings.TrimSpace(req.Senha) == "" {
		return types.LoginResponse{}, types.ErrInvalidParam
	}
	if s.env != "test" && s.env != "development" {
		if err := s.recaptcha.Verify(ctx, req.Recaptcha, remoteIP); err != nil {
			return types.LoginResponse{}, err
		}
	}
	return s.loginWithoutRecaptcha(ctx, req)
}

func (s AuthService) LoginDev(ctx context.Context, req types.LoginRequest) (types.LoginResponse, error) {
	if s.isProduction() {
		return types.LoginResponse{}, types.ErrInvalidParam
	}
	if strings.TrimSpace(req.Login) == "" || strings.TrimSpace(req.Senha) == "" {
		return types.LoginResponse{}, types.ErrInvalidParam
	}
	return s.loginWithoutRecaptcha(ctx, req)
}

func (s AuthService) LoginByApp(ctx context.Context, req types.LoginRequest) (types.LoginResponse, error) {
	if strings.TrimSpace(req.Login) == "" || strings.TrimSpace(req.Senha) == "" {
		return types.LoginResponse{}, types.ErrInvalidParam
	}
	if strings.TrimSpace(req.TokenApp) == "" {
		return types.LoginResponse{}, types.ErrAppNotFound
	}
	if err := s.validateAppToken(ctx, req.TokenApp); err != nil {
		return types.LoginResponse{}, err
	}
	return s.loginWithoutRecaptcha(ctx, req)
}

func (s AuthService) isProduction() bool {
	return strings.EqualFold(strings.TrimSpace(s.env), "production")
}

func (s AuthService) loginWithoutRecaptcha(ctx context.Context, req types.LoginRequest) (types.LoginResponse, error) {
	user, err := s.authenticate(ctx, req.Login, req.Senha)
	if err != nil {
		return types.LoginResponse{}, err
	}
	if req.QuerTFA != nil && *req.QuerTFA {
		token, err := s.jwt.SignWithTTL(user.ToToken(), time.Minute)
		if err != nil {
			return types.LoginResponse{}, types.ErrInternal.WithCause(err)
		}
		return types.LoginResponse{Token: token}, nil
	}
	token, err := s.jwt.Sign(user.ToToken())
	if err != nil {
		return types.LoginResponse{}, types.ErrInternal.WithCause(err)
	}
	return types.LoginResponse{Token: token}, nil
}

func (s AuthService) authenticate(ctx context.Context, login string, password string) (types.Usuario, error) {
	status, err := s.users.LoginStatus(ctx, login)
	if err != nil {
		return types.Usuario{}, err
	}
	if !status.Ativo {
		return types.Usuario{}, types.ErrLoginFailed
	}
	if strings.ToUpper(status.Acesso) != "LOCAL" {
		return types.Usuario{}, types.ErrNotMigrated.WithCause(types.ErrExternalAccessInvalid)
	}
	if err := s.users.AuthenticateLocal(ctx, login, password); err != nil {
		return types.Usuario{}, err
	}
	user, err := s.users.FindByLogin(ctx, login)
	if err != nil {
		return types.Usuario{}, err
	}
	perms, err := s.users.Permissions(ctx, login, user.ID)
	if err != nil {
		return types.Usuario{}, err
	}
	_ = perms
	return user, nil
}

func (s AuthService) SetupTFA(ctx context.Context, req types.SetupTFARequest) (types.SetupTFAResponse, error) {
	login := strings.TrimSpace(req.Login)
	if login == "" || strings.TrimSpace(req.Senha) == "" {
		return types.SetupTFAResponse{}, types.ErrInvalidParam
	}
	user, err := s.authenticate(ctx, login, req.Senha)
	if err != nil {
		return types.SetupTFAResponse{}, err
	}
	return s.createPendingTFASetup(user)
}

func (s AuthService) SetupTFAForUser(ctx context.Context, userID int64, password string) (types.SetupTFAResponse, error) {
	if strings.TrimSpace(password) == "" {
		return types.SetupTFAResponse{}, types.ErrInvalidParam
	}
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return types.SetupTFAResponse{}, err
	}
	if err := s.users.AuthenticateLocal(ctx, user.Login, password); err != nil {
		return types.SetupTFAResponse{}, err
	}
	return s.createPendingTFASetup(user)
}

func (s AuthService) createPendingTFASetup(user types.Usuario) (types.SetupTFAResponse, error) {
	secret, err := auth.NewTOTPSecret()
	if err != nil {
		return types.SetupTFAResponse{}, types.ErrTFASetupInvalid.WithCause(err)
	}
	setupToken, err := s.jwt.SignWithTTL(pendingTFASetup{
		Purpose: "mfa_setup",
		UserID:  user.ID,
		Secret:  secret,
	}, 5*time.Minute)
	if err != nil {
		return types.SetupTFAResponse{}, types.ErrTFASetupInvalid.WithCause(err)
	}
	otpauth := auth.TOTPURL("PANDORA", user.Login, secret)
	return types.SetupTFAResponse{
		SetupToken: setupToken,
		DataURL:    "data:text/plain;base64," + base64.StdEncoding.EncodeToString([]byte(otpauth)),
		TFAURL:     otpauth,
	}, nil
}

func (s AuthService) VerifyTFA(ctx context.Context, req types.VerifyTFARequest) (types.LoginResponse, error) {
	if strings.TrimSpace(req.Login) == "" || strings.TrimSpace(req.Senha) == "" || strings.TrimSpace(req.Token) == "" {
		return types.LoginResponse{}, types.ErrInvalidParam
	}
	user, err := s.authenticate(ctx, req.Login, req.Senha)
	if err != nil {
		return types.LoginResponse{}, err
	}
	secret, err := s.unprotectTFASecret(user.KeyTFA)
	if err != nil || !auth.VerifyTOTP(secret, req.Token, time.Now(), 1) {
		return types.LoginResponse{}, types.ErrTFACodeInvalid
	}
	if !user.SetupTFA {
		if err := s.users.MarkTFASetup(ctx, req.Login); err != nil {
			return types.LoginResponse{}, err
		}
		user.SetupTFA = true
	}
	token, err := s.jwt.Sign(user.ToToken())
	if err != nil {
		return types.LoginResponse{}, types.ErrInternal.WithCause(err)
	}
	return types.LoginResponse{Token: token}, nil
}

func (s AuthService) VerifyTFAForUser(ctx context.Context, userID int64, tokenTFA string, setupToken string) (types.LoginResponse, error) {
	if strings.TrimSpace(tokenTFA) == "" {
		return types.LoginResponse{}, types.ErrInvalidParam
	}
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return types.LoginResponse{}, err
	}

	if strings.TrimSpace(setupToken) != "" {
		secret, err := s.pendingTFASecret(setupToken, userID)
		if err != nil {
			return types.LoginResponse{}, err
		}
		if !auth.VerifyTOTP(secret, tokenTFA, time.Now(), 1) {
			return types.LoginResponse{}, types.ErrTFACodeInvalid
		}
		protected, err := s.protectTFASecret(secret)
		if err != nil {
			return types.LoginResponse{}, types.ErrTFASetupInvalid.WithCause(err)
		}
		if err := s.users.StoreTFASecret(ctx, user.Login, protected); err != nil {
			return types.LoginResponse{}, err
		}
		if err := s.users.MarkTFASetup(ctx, user.Login); err != nil {
			return types.LoginResponse{}, err
		}
	} else {
		secret, err := s.unprotectTFASecret(user.KeyTFA)
		if err != nil {
			return types.LoginResponse{}, types.ErrTFACodeInvalid.WithCause(err)
		}
		if !auth.VerifyTOTP(secret, tokenTFA, time.Now(), 1) {
			return types.LoginResponse{}, types.ErrTFACodeInvalid
		}
	}
	user.SetupTFA = true
	token, err := s.jwt.Sign(user.ToToken())
	if err != nil {
		return types.LoginResponse{}, types.ErrInternal.WithCause(err)
	}
	return types.LoginResponse{Token: token}, nil
}

func (s AuthService) pendingTFASecret(setupToken string, userID int64) (string, error) {
	claims, err := s.jwt.Verify(setupToken)
	if err != nil {
		return "", types.ErrTFASetupInvalid.WithCause(err)
	}
	payload := auth.UserFromClaims(claims)
	purpose, _ := payload["purpose"].(string)
	secret, _ := payload["secret"].(string)
	tokenUserID, err := claimInt64(payload["userID"])
	if err != nil || purpose != "mfa_setup" || tokenUserID != userID || secret == "" {
		return "", types.ErrTFASetupInvalid
	}
	return secret, nil
}

func (s AuthService) protectTFASecret(secret string) (string, error) {
	encrypted, err := utils.EncryptAESGCM(secret, s.aesPW)
	if err != nil {
		return "", err
	}
	return "enc:v1:" + encrypted, nil
}

func (s AuthService) unprotectTFASecret(secret *string) (string, error) {
	if secret == nil || strings.TrimSpace(*secret) == "" {
		return "", types.ErrTFACodeInvalid
	}
	value := strings.TrimSpace(*secret)
	if !strings.HasPrefix(value, "enc:v1:") {
		return value, nil
	}
	return utils.DecryptAESGCM(strings.TrimPrefix(value, "enc:v1:"), s.aesPW)
}

func claimInt64(value any) (int64, error) {
	switch v := value.(type) {
	case float64:
		return int64(v), nil
	case int64:
		return v, nil
	case int:
		return int64(v), nil
	case string:
		return strconv.ParseInt(v, 10, 64)
	default:
		return 0, fmt.Errorf("invalid numeric claim")
	}
}

func (s AuthService) validateAppToken(ctx context.Context, token string) error {
	claims, err := s.jwt.Verify(token)
	if err != nil {
		return types.ErrExternalAccessTokenInvalid.WithCause(err)
	}
	appClaims, _ := claims["app"].(map[string]any)
	claimName, _ := appClaims["nome"].(string)
	if claimName == "" {
		return types.ErrExternalAccessTokenInvalid
	}
	app, err := s.users.AuthorizedAppByToken(ctx, token)
	if err != nil {
		return err
	}
	now := time.Now()
	if !app.Ativo || app.Nome != claimName {
		return types.ErrExternalAccessInvalid
	}
	if app.DataInicio.Valid && app.DataInicio.Time.After(now) {
		return types.ErrExternalAccessInvalid
	}
	if app.DataExpiracao.Valid && app.DataExpiracao.Time.Before(now) {
		return types.ErrExternalAccessInvalid
	}
	return nil
}

func (s AuthService) Me(ctx context.Context, id int64) (types.Usuario, error) {
	return s.users.FindByID(ctx, id)
}

func (s AuthService) User(ctx context.Context, id int64) (types.Usuario, error) {
	return s.users.FindByID(ctx, id)
}

func (s AuthService) ListUsers(ctx context.Context) ([]types.UsuarioAdmin, error) {
	return s.users.ListUsers(ctx, "")
}

func (s AuthService) ListUsersPartial(ctx context.Context, search string) ([]types.UsuarioAdmin, error) {
	if len(strings.TrimSpace(search)) <= 2 {
		return nil, types.ErrInvalidParam
	}
	return s.users.ListUsers(ctx, search)
}

func (s AuthService) Permissions(ctx context.Context, id int64) (string, error) {
	perms, err := s.users.Permissions(ctx, "", id)
	if err != nil {
		return "", err
	}
	grouped := types.PermissoesPorSecao{}
	for _, perm := range perms {
		grouped[perm.Secao] = append(grouped[perm.Secao], perm.Item)
	}
	raw, err := json.Marshal(grouped)
	if err != nil {
		return "", types.ErrInternal.WithCause(err)
	}
	encrypted, err := utils.EncryptCryptoJSAES(string(raw), s.aesPW)
	if err != nil {
		return "", types.ErrInternal.WithCause(err)
	}
	return encrypted, nil
}

func (s AuthService) ListProfiles(ctx context.Context) ([]string, error) {
	return s.users.ListProfiles(ctx)
}

func (s AuthService) ListFullProfiles(ctx context.Context) ([]types.PerfilAdmin, error) {
	return s.users.ListFullProfiles(ctx)
}

func (s AuthService) ListAccesses(ctx context.Context) ([]string, error) {
	return s.users.ListAccesses(ctx)
}

func (s AuthService) ListGroups(ctx context.Context) ([]string, error) {
	return s.users.ListGroups(ctx)
}

func (s AuthService) ListPermissionCatalog(ctx context.Context) ([]map[string]string, error) {
	return s.users.ListPermissionCatalog(ctx)
}

func (s AuthService) UserPermissionsRaw(ctx context.Context, id int64) ([]types.Permissao, error) {
	return s.users.Permissions(ctx, "", id)
}

func (s AuthService) ProfilePermissions(ctx context.Context, id int64) ([]types.Permissao, error) {
	return s.users.ProfilePermissions(ctx, id)
}

func (s AuthService) ProfileSchedule(ctx context.Context, id int64) (types.PerfilHorario, error) {
	return s.users.ProfileSchedule(ctx, id)
}

func (s AuthService) UsersByProfile(ctx context.Context, id int64) ([]types.PerfilUsuario, error) {
	return s.users.UsersByProfile(ctx, id)
}

func (s AuthService) ListDeletedUsers(ctx context.Context) ([]types.UsuarioFalso, error) {
	return s.users.ListDeletedUsers(ctx)
}

func (s AuthService) ListBlacklist(ctx context.Context) ([]types.ListaNegraUsuario, error) {
	return s.users.ListBlacklist(ctx)
}

func (s AuthService) APIQueriesSummary(ctx context.Context, year *int, month *int) ([]types.APIResumoMensal, error) {
	return s.users.APIQueriesSummary(ctx, year, month)
}

func (s AuthService) APIQueriesMonthly(ctx context.Context, year *int, month *int, service string) ([]types.APIConsultaMensal, error) {
	return s.users.APIQueriesMonthly(ctx, year, month, service)
}

func (s AuthService) RecentLogs(ctx context.Context, quantity int, offset int) ([]types.LogSistema, error) {
	return s.users.RecentLogs(ctx, quantity, offset)
}

func (s AuthService) LegacyNoProfileLogsCount(ctx context.Context) (int64, error) {
	return s.users.LegacyNoProfileLogsCount(ctx)
}

func (s AuthService) ValidTokens(ctx context.Context) ([]map[string]any, error) {
	return s.users.ValidTokens(ctx, 0)
}

func (s AuthService) AuditPix(ctx context.Context, filters map[string]string) ([]map[string]any, error) {
	return s.users.AuditPix(ctx, filters)
}

func (s AuthService) RecurrentProcesses(ctx context.Context, period string, duration string) ([]map[string]any, error) {
	return s.users.RecurrentProcesses(ctx, period, duration)
}

func (s AuthService) RecurrentProcessDetails(ctx context.Context, login string, process string, period string, duration string) ([]map[string]any, error) {
	if strings.TrimSpace(login) == "" || strings.TrimSpace(process) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.users.RecurrentProcessDetails(ctx, login, process, period, duration)
}

func (s AuthService) ErrorLogs(ctx context.Context, filters map[string]string) ([]map[string]any, error) {
	return s.users.ErrorLogs(ctx, filters)
}

func (s AuthService) RegisterErrorLog(ctx context.Context, payload types.ErrorLogPayload) error {
	if strings.TrimSpace(payload.Tipo) == "" || strings.TrimSpace(payload.Mensagem) == "" {
		return types.ErrInvalidParam
	}
	return s.users.UpsertErrorLog(ctx, payload)
}

func (s AuthService) AuditAlerts(ctx context.Context, category string, minimum int, period string) ([]map[string]any, error) {
	return s.users.AuditAlerts(ctx, category, minimum, period)
}

func (s AuthService) Rankings(ctx context.Context, ranking string, duration string, top string, parameter string) ([]map[string]any, error) {
	return s.users.Rankings(ctx, ranking, duration, top, parameter)
}

func (s AuthService) Resources(ctx context.Context, duration string, withKey string, profile string, year string, month string) ([]map[string]any, error) {
	return s.users.Resources(ctx, duration, withKey, profile, year, month)
}

func (s AuthService) ProcessesMostUsed(ctx context.Context, duration string) ([]map[string]any, error) {
	return s.users.ProcessesMostUsed(ctx, duration)
}

func (s AuthService) UsersSearchedValue(ctx context.Context, duration string, key string, value string) ([]map[string]any, error) {
	if strings.TrimSpace(key) == "" || strings.TrimSpace(value) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.users.UsersSearchedValue(ctx, duration, key, value)
}

func (s AuthService) UsageStats(ctx context.Context, category string, duration string) ([]map[string]any, error) {
	if category != "pesquisa" && category != "login" {
		return nil, types.ErrInvalidParam
	}
	return s.users.UsageStats(ctx, category, duration)
}

func (s AuthService) NotFoundRecords(ctx context.Context) ([]map[string]any, error) {
	return s.users.NotFoundRecords(ctx)
}

func (s AuthService) IntegraRequests(ctx context.Context) ([]map[string]any, error) {
	return s.users.IntegraRequests(ctx)
}

func (s AuthService) FinishIntegraRequest(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.users.FinishIntegraRequest(ctx, id)
}

func (s AuthService) IntegraHistoryByProfile(ctx context.Context, profile string) ([]map[string]any, error) {
	if strings.TrimSpace(profile) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.users.IntegraHistoryByProfile(ctx, profile)
}

func (s AuthService) IntegraServiceHistory(ctx context.Context) ([]map[string]any, error) {
	return s.users.IntegraServiceHistory(ctx)
}

func (s AuthService) IntegraDashboard(ctx context.Context) ([]map[string]any, error) {
	return s.users.IntegraDashboard(ctx)
}

func (s AuthService) IntegraAttachment(ctx context.Context, id int64) (types.IntegraAttachment, error) {
	if id <= 0 {
		return types.IntegraAttachment{}, types.ErrInvalidParam
	}
	return s.users.IntegraAttachment(ctx, id)
}

func (s AuthService) ActiveMailerUsers(ctx context.Context) ([]map[string]any, error) {
	return s.users.ActiveMailerUsers(ctx)
}

func (s AuthService) ListAuthorizedApps(ctx context.Context) ([]types.AplicativoAutorizado, error) {
	return s.users.ListAuthorizedApps(ctx)
}

func (s AuthService) CreateAuthorizedApp(ctx context.Context, app types.AplicativoPayload) (string, error) {
	if strings.TrimSpace(app.Nome) == "" || strings.TrimSpace(app.DataInicio) == "" {
		return "", types.ErrInvalidParam
	}
	token, err := s.jwt.SignApp(app)
	if err != nil {
		return "", types.ErrInternal.WithCause(err)
	}
	if err := s.users.CreateAuthorizedApp(ctx, app, token); err != nil {
		return "", err
	}
	return token, nil
}

func (s AuthService) UpdateAuthorizedApp(ctx context.Context, id int64, app types.AplicativoPayload) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	app.ID = id
	return s.users.UpdateAuthorizedApp(ctx, app)
}

func (s AuthService) DeleteAuthorizedApp(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.users.DeleteAuthorizedApp(ctx, id)
}

func (s AuthService) AccessLimitIPCurrent(context.Context) ([]map[string]any, error) {
	return []map[string]any{}, nil
}

func (s AuthService) AccessLimitUserCurrent(context.Context) ([]map[string]any, error) {
	return []map[string]any{}, nil
}

func (s AuthService) AccessLimitIPHistory(ctx context.Context, blacklist bool) ([]map[string]any, error) {
	return s.users.AccessLimitIPHistory(ctx, blacklist)
}

func (s AuthService) AccessLimitUserHistory(ctx context.Context) ([]map[string]any, error) {
	return s.users.AccessLimitUserHistory(ctx)
}

func (s AuthService) ListInactivePreUsers(ctx context.Context) ([]types.PessoaUsuarioCadastro, error) {
	return s.users.ListInactivePreUsers(ctx)
}

func (s AuthService) PreUser(ctx context.Context, id int64) (types.PessoaUsuarioCadastro, error) {
	return s.users.FindPreUser(ctx, id)
}

func (s AuthService) UserLogs(ctx context.Context, login string, top *int) ([]types.LogAcessoUsuario, error) {
	if strings.TrimSpace(login) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.users.UserLogs(ctx, login, top)
}

func (s AuthService) UserLogsByCPF(ctx context.Context, cpf string, top *int) ([]types.LogAcessoUsuario, error) {
	cpf = utils.NormalizeCPF(cpf)
	if cpf == "" {
		return nil, types.ErrInvalidParam
	}
	return s.users.UserLogsByCPF(ctx, cpf, top)
}

func (s AuthService) RegisterPreUser(ctx context.Context, p types.PessoaUsuarioCadastro, remoteIP string) error {
	if err := s.validatePreUser(p); err != nil {
		return err
	}
	if s.env != "test" && s.env != "development" {
		if err := s.recaptcha.Verify(ctx, p.Recaptcha, remoteIP); err != nil {
			return err
		}
	}
	exists, err := s.users.PreUserExistsByCPFOrEmail(ctx, p)
	if err != nil {
		return err
	}
	if exists {
		return types.ErrCPFAlreadyExists
	}
	p.CPF = utils.NormalizeCPF(p.CPF)
	return s.users.CreatePreUser(ctx, p, false)
}

func (s AuthService) RecadastrarPreUser(ctx context.Context, p types.PessoaUsuarioCadastro, userID int64, remoteIP string) error {
	if err := s.validatePreUser(p); err != nil {
		return err
	}
	if s.env != "test" && s.env != "development" {
		if err := s.recaptcha.Verify(ctx, p.Recaptcha, remoteIP); err != nil {
			return err
		}
	}
	idPessoa, err := s.users.PersonIDByUserID(ctx, userID)
	if err != nil {
		return err
	}
	p.CPF = utils.NormalizeCPF(p.CPF)
	if err := s.users.UpdatePreUser(ctx, p, idPessoa); err != nil {
		return err
	}
	if err := s.users.DeactivateUser(ctx, userID); err != nil {
		return err
	}
	return s.users.SetUserRecadastramento(ctx, userID, false)
}

func (s AuthService) ActivatePreUser(ctx context.Context, p types.PessoaUsuarioCadastro, actorID int64) error {
	if p.ID == 0 || strings.TrimSpace(p.Login) == "" || strings.TrimSpace(p.Perfil) == "" || strings.TrimSpace(p.Acesso) == "" {
		return types.ErrInvalidParam
	}
	if p.IDCadastrador == 0 {
		p.IDCadastrador = actorID
	}
	idUsuario, err := s.users.UserIDByPersonID(ctx, p.ID)
	if err == nil && idUsuario > 0 {
		if err := s.users.ActivateUser(ctx, idUsuario); err != nil {
			return err
		}
	} else {
		if err := s.users.CreateUserFromActivation(ctx, p); err != nil {
			return err
		}
	}
	return s.users.ActivatePreUser(ctx, p.ID)
}

func (s AuthService) DeletePreUser(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.users.DeletePreUser(ctx, id)
}

func (s AuthService) EnablePreUserRecadastramento(ctx context.Context, idPessoa int64) error {
	if idPessoa <= 0 {
		return types.ErrInvalidParam
	}
	idUsuario, err := s.users.UserIDByPersonID(ctx, idPessoa)
	if err != nil {
		return err
	}
	if err := s.users.ActivateUser(ctx, idUsuario); err != nil {
		return err
	}
	return s.users.SetUserRecadastramento(ctx, idUsuario, true)
}

func (s AuthService) validatePreUser(p types.PessoaUsuarioCadastro) error {
	if !validators.ValidCPF(p.CPF) {
		return types.ErrInvalidCPF
	}
	if !validators.ValidEmail(p.Email) {
		return types.ErrInvalidEmail
	}
	if strings.TrimSpace(p.Nome) == "" {
		return types.ErrInvalidParam
	}
	return nil
}
