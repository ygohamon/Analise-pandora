package services

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"

	"pandora-go-server/internal/auth"
	repositories "pandora-go-server/internal/repositories/sistema"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

type AuthService struct {
	authRepo       repositories.AuthRepository
	appRepo        repositories.AplicativoRepository
	userRepo       repositories.UsuarioConsultaRepository
	permissionRepo repositories.PermissaoRepository
	profileRepo    repositories.PerfilRepository
	logsRepo       repositories.LogsRepository
	auditRepo      repositories.AuditoriaRepository
	integraRepo    repositories.IntegraAdminRepository
	systemRepo     repositories.SistemaAdminRepository
	preUserRepo    repositories.PreUsuarioRepository
	jwt            auth.JWTService
	recaptcha      RecaptchaVerifier
	env            string
	aesPW          string
}

type pendingTFASetup struct {
	Purpose string `json:"purpose"`
	UserID  int64  `json:"userID"`
	Secret  string `json:"secret"`
}

func NewAuthService(users repositories.UsuarioRepository, jwt auth.JWTService, recaptcha RecaptchaVerifier, env string, aesPW string) AuthService {
	return AuthService{
		authRepo:       users,
		appRepo:        users,
		userRepo:       users,
		permissionRepo: users,
		profileRepo:    users,
		logsRepo:       users,
		auditRepo:      users,
		integraRepo:    users,
		systemRepo:     users,
		preUserRepo:    users,
		jwt:            jwt,
		recaptcha:      recaptcha,
		env:            env,
		aesPW:          aesPW,
	}
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
	if req.QuerTFA == nil {
		querTFA := false
		req.QuerTFA = &querTFA
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

func (s AuthService) requiresStagedTFAToken() bool {
	switch strings.ToLower(strings.TrimSpace(s.env)) {
	case "production", "ratification", "homologation", "staging":
		return true
	default:
		return false
	}
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
	if req.QuerTFA == nil && strings.TrimSpace(req.TokenApp) == "" && s.requiresStagedTFAToken() {
		token, err := s.jwt.SignWithTTL(user.ToToken(), 5*time.Minute)
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
	status, err := s.authRepo.LoginStatus(ctx, login)
	if err != nil {
		return types.Usuario{}, err
	}
	if !status.Ativo {
		return types.Usuario{}, types.ErrLoginFailed
	}
	if strings.ToUpper(status.Acesso) != "LOCAL" {
		return types.Usuario{}, types.ErrNotMigrated.WithCause(types.ErrExternalAccessInvalid)
	}
	if err := s.authRepo.AuthenticateLocal(ctx, login, password); err != nil {
		return types.Usuario{}, err
	}
	user, err := s.userRepo.FindByLogin(ctx, login)
	if err != nil {
		return types.Usuario{}, err
	}
	perms, err := s.permissionRepo.Permissions(ctx, login, user.ID)
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
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return types.SetupTFAResponse{}, err
	}
	if err := s.authRepo.AuthenticateLocal(ctx, user.Login, password); err != nil {
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
		if err := s.authRepo.MarkTFASetup(ctx, req.Login); err != nil {
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
	user, err := s.userRepo.FindByID(ctx, userID)
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
		if err := s.authRepo.StoreTFASecret(ctx, user.Login, protected); err != nil {
			return types.LoginResponse{}, err
		}
		if err := s.authRepo.MarkTFASetup(ctx, user.Login); err != nil {
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
	app, err := s.appRepo.AuthorizedAppByToken(ctx, token)
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
	return s.userRepo.FindByID(ctx, id)
}

func (s AuthService) User(ctx context.Context, id int64) (types.Usuario, error) {
	return s.userRepo.FindByID(ctx, id)
}

func (s AuthService) ensureSelfOrAdmin(ctx context.Context, actorID int64, targetID int64) error {
	if actorID <= 0 || targetID <= 0 {
		return types.ErrInvalidParam
	}
	if actorID == targetID {
		return nil
	}
	actor, err := s.userRepo.FindByID(ctx, actorID)
	if err != nil {
		return err
	}
	if !actor.IsAdmin() {
		return types.ErrRouteUnauthorized
	}
	return nil
}

func (s AuthService) ValidateCurrentPassword(ctx context.Context, actorID int64, password string) error {
	if strings.TrimSpace(password) == "" {
		return types.ErrInvalidParam
	}
	user, err := s.userRepo.FindByID(ctx, actorID)
	if err != nil {
		return err
	}
	return s.authRepo.AuthenticateLocal(ctx, user.Login, password)
}

func (s AuthService) ChangePassword(ctx context.Context, actorID int64, targetID int64, currentPassword string, newPassword string) error {
	if err := s.ensureSelfOrAdmin(ctx, actorID, targetID); err != nil {
		return err
	}
	actor, err := s.userRepo.FindByID(ctx, actorID)
	if err != nil {
		return err
	}
	if actorID == targetID && !actor.IsAdmin() {
		if err := s.ValidateCurrentPassword(ctx, actorID, currentPassword); err != nil {
			return err
		}
	}
	if strings.TrimSpace(newPassword) == "" || len(newPassword) < 8 {
		return types.ErrInvalidParam
	}
	return s.authRepo.UpdatePassword(ctx, targetID, newPassword)
}

func (s AuthService) UpdateUserPreferences(ctx context.Context, actorID int64, targetID int64, patch repositories.UserPreferencePatch) error {
	if err := s.ensureSelfOrAdmin(ctx, actorID, targetID); err != nil {
		return err
	}
	return s.userRepo.UpdatePreferences(ctx, targetID, patch)
}

func (s AuthService) UpdatePreUserTerm(ctx context.Context, actorID int64, targetID int64, termo string) error {
	if err := s.ensureSelfOrAdmin(ctx, actorID, targetID); err != nil {
		return err
	}
	if strings.TrimSpace(termo) == "" {
		return types.ErrInvalidParam
	}
	idPessoa, err := s.preUserRepo.PersonIDByUserID(ctx, targetID)
	if err != nil {
		return err
	}
	return s.preUserRepo.UpdatePreUserTerm(ctx, idPessoa, termo)
}

func (s AuthService) MyHistory(ctx context.Context, actorID int64, targetID int64, quantity int, offset int) ([]map[string]any, error) {
	if err := s.ensureSelfOrAdmin(ctx, actorID, targetID); err != nil {
		return nil, err
	}
	user, err := s.userRepo.FindByID(ctx, targetID)
	if err != nil {
		return nil, err
	}
	return s.userRepo.UserHistory(ctx, user.Login, quantity, offset)
}

func (s AuthService) ListUsers(ctx context.Context) ([]types.UsuarioAdmin, error) {
	return s.userRepo.ListUsers(ctx, "")
}

func (s AuthService) ListUsersPartial(ctx context.Context, search string) ([]types.UsuarioAdmin, error) {
	if len(strings.TrimSpace(search)) <= 2 {
		return nil, types.ErrInvalidParam
	}
	return s.userRepo.ListUsers(ctx, search)
}

func (s AuthService) Permissions(ctx context.Context, id int64) (string, error) {
	perms, err := s.permissionRepo.Permissions(ctx, "", id)
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
	return s.profileRepo.ListProfiles(ctx)
}

func (s AuthService) ListFullProfiles(ctx context.Context) ([]types.PerfilAdmin, error) {
	return s.profileRepo.ListFullProfiles(ctx)
}

func (s AuthService) ListAccesses(ctx context.Context) ([]string, error) {
	return s.profileRepo.ListAccesses(ctx)
}

func (s AuthService) ListGroups(ctx context.Context) ([]string, error) {
	return s.profileRepo.ListGroups(ctx)
}

func (s AuthService) ListPermissionCatalog(ctx context.Context) ([]map[string]string, error) {
	return s.permissionRepo.ListPermissionCatalog(ctx)
}

func (s AuthService) UserPermissionsRaw(ctx context.Context, id int64) ([]types.Permissao, error) {
	return s.permissionRepo.Permissions(ctx, "", id)
}

func (s AuthService) ProfilePermissions(ctx context.Context, id int64) ([]types.Permissao, error) {
	return s.permissionRepo.ProfilePermissions(ctx, id)
}

func (s AuthService) ProfileSchedule(ctx context.Context, id int64) (types.PerfilHorario, error) {
	return s.profileRepo.ProfileSchedule(ctx, id)
}

func (s AuthService) UsersByProfile(ctx context.Context, id int64) ([]types.PerfilUsuario, error) {
	return s.profileRepo.UsersByProfile(ctx, id)
}

func (s AuthService) UpdateProfilePermissions(ctx context.Context, id int64, perms []types.Permissao) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.profileRepo.UpdateProfilePermissions(ctx, id, perms)
}

func (s AuthService) UpdateProfileFlag(ctx context.Context, id int64, key string, value any) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.profileRepo.UpdateProfileFlag(ctx, id, key, value)
}

func (s AuthService) UpdateProfileSchedule(ctx context.Context, id int64, active bool, start int64, end int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.profileRepo.UpdateProfileSchedule(ctx, id, active, start, end)
}

func (s AuthService) UpdateProfileProcess(ctx context.Context, id int64, required bool, limit *int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.profileRepo.UpdateProfileProcess(ctx, id, required, limit)
}

func (s AuthService) UpdateProfileSession(ctx context.Context, id int64, minutes int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.profileRepo.UpdateProfileSession(ctx, id, minutes)
}

func (s AuthService) CreateProfile(ctx context.Context, profile types.PerfilAdmin) error {
	return s.profileRepo.CreateProfile(ctx, profile)
}

func (s AuthService) DeleteProfile(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.profileRepo.DeleteProfile(ctx, id)
}

func (s AuthService) ResetUserPassword(ctx context.Context, id int64, password string) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	if strings.TrimSpace(password) == "" {
		password = gerarSenhaTemporaria(10)
	}
	return s.userRepo.ResetPassword(ctx, id, password)
}

func (s AuthService) ResetAllPasswords(ctx context.Context, password string) error {
	if strings.TrimSpace(password) == "" {
		password = gerarSenhaTemporaria(10)
	}
	return s.userRepo.ResetAllLocalPasswords(ctx, password)
}

func (s AuthService) ResetTFA(ctx context.Context, login string) error {
	if strings.TrimSpace(login) == "" {
		return types.ErrInvalidParam
	}
	return s.authRepo.ResetTFA(ctx, login)
}

func (s AuthService) RemoveFalseUser(ctx context.Context, payload map[string]string) error {
	return s.userRepo.RemoveFalseUser(ctx, payload)
}

func (s AuthService) SetBlacklistStatus(ctx context.Context, action string, payload map[string]string) error {
	if action != "bloquear" && action != "ativar" {
		return types.ErrInvalidParam
	}
	return s.userRepo.SetBlacklistStatus(ctx, action, payload)
}

func (s AuthService) ListDeletedUsers(ctx context.Context) ([]types.UsuarioFalso, error) {
	return s.userRepo.ListDeletedUsers(ctx)
}

func (s AuthService) ListBlacklist(ctx context.Context) ([]types.ListaNegraUsuario, error) {
	return s.userRepo.ListBlacklist(ctx)
}

func (s AuthService) APIQueriesSummary(ctx context.Context, year *int, month *int) ([]types.APIResumoMensal, error) {
	return s.logsRepo.APIQueriesSummary(ctx, year, month)
}

func (s AuthService) APIQueriesMonthly(ctx context.Context, year *int, month *int, service string) ([]types.APIConsultaMensal, error) {
	return s.logsRepo.APIQueriesMonthly(ctx, year, month, service)
}

func (s AuthService) RecentLogs(ctx context.Context, quantity int, offset int) ([]types.LogSistema, error) {
	return s.logsRepo.RecentLogs(ctx, quantity, offset)
}

func (s AuthService) LegacyNoProfileLogsCount(ctx context.Context) (int64, error) {
	return s.logsRepo.LegacyNoProfileLogsCount(ctx)
}

func (s AuthService) ValidTokens(ctx context.Context) ([]map[string]any, error) {
	return s.logsRepo.ValidTokens(ctx, 0)
}

func (s AuthService) AuditPix(ctx context.Context, filters map[string]string) ([]map[string]any, error) {
	return s.auditRepo.AuditPix(ctx, filters)
}

func (s AuthService) RecurrentProcesses(ctx context.Context, period string, duration string) ([]map[string]any, error) {
	return s.auditRepo.RecurrentProcesses(ctx, period, duration)
}

func (s AuthService) RecurrentProcessDetails(ctx context.Context, login string, process string, period string, duration string) ([]map[string]any, error) {
	if strings.TrimSpace(login) == "" || strings.TrimSpace(process) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.auditRepo.RecurrentProcessDetails(ctx, login, process, period, duration)
}

func (s AuthService) ErrorLogs(ctx context.Context, filters map[string]string) ([]map[string]any, error) {
	return s.logsRepo.ErrorLogs(ctx, filters)
}

func (s AuthService) RegisterErrorLog(ctx context.Context, payload types.ErrorLogPayload) error {
	if strings.TrimSpace(payload.Tipo) == "" || strings.TrimSpace(payload.Mensagem) == "" {
		return types.ErrInvalidParam
	}
	return s.logsRepo.UpsertErrorLog(ctx, payload)
}

func (s AuthService) AuditAlerts(ctx context.Context, category string, minimum int, period string) ([]map[string]any, error) {
	return s.auditRepo.AuditAlerts(ctx, category, minimum, period)
}

func (s AuthService) Rankings(ctx context.Context, ranking string, duration string, top string, parameter string) ([]map[string]any, error) {
	return s.logsRepo.Rankings(ctx, ranking, duration, top, parameter)
}

func (s AuthService) Resources(ctx context.Context, duration string, withKey string, profile string, year string, month string) ([]map[string]any, error) {
	return s.logsRepo.Resources(ctx, duration, withKey, profile, year, month)
}

func (s AuthService) ProcessesMostUsed(ctx context.Context, duration string) ([]map[string]any, error) {
	return s.logsRepo.ProcessesMostUsed(ctx, duration)
}

func (s AuthService) UsersSearchedValue(ctx context.Context, duration string, key string, value string) ([]map[string]any, error) {
	if strings.TrimSpace(key) == "" || strings.TrimSpace(value) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.logsRepo.UsersSearchedValue(ctx, duration, key, value)
}

func (s AuthService) UsageStats(ctx context.Context, category string, duration string) ([]map[string]any, error) {
	if category != "pesquisa" && category != "login" {
		return nil, types.ErrInvalidParam
	}
	return s.logsRepo.UsageStats(ctx, category, duration)
}

func (s AuthService) NotFoundRecords(ctx context.Context) ([]map[string]any, error) {
	return s.logsRepo.NotFoundRecords(ctx)
}

func (s AuthService) IntegraRequests(ctx context.Context) ([]map[string]any, error) {
	return s.integraRepo.IntegraRequests(ctx)
}

func (s AuthService) FinishIntegraRequest(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.integraRepo.FinishIntegraRequest(ctx, id)
}

func (s AuthService) IntegraHistoryByProfile(ctx context.Context, profile string) ([]map[string]any, error) {
	if strings.TrimSpace(profile) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.integraRepo.IntegraHistoryByProfile(ctx, profile)
}

func (s AuthService) IntegraServiceHistory(ctx context.Context) ([]map[string]any, error) {
	return s.integraRepo.IntegraServiceHistory(ctx)
}

func (s AuthService) IntegraDashboard(ctx context.Context) ([]map[string]any, error) {
	return s.integraRepo.IntegraDashboard(ctx)
}

func (s AuthService) IntegraAttachment(ctx context.Context, id int64) (types.IntegraAttachment, error) {
	if id <= 0 {
		return types.IntegraAttachment{}, types.ErrInvalidParam
	}
	return s.integraRepo.IntegraAttachment(ctx, id)
}

func (s AuthService) ActiveMailerUsers(ctx context.Context) ([]map[string]any, error) {
	return s.systemRepo.ActiveMailerUsers(ctx)
}

func (s AuthService) ListAuthorizedApps(ctx context.Context) ([]types.AplicativoAutorizado, error) {
	return s.appRepo.ListAuthorizedApps(ctx)
}

func (s AuthService) CreateAuthorizedApp(ctx context.Context, app types.AplicativoPayload) (string, error) {
	if strings.TrimSpace(app.Nome) == "" || strings.TrimSpace(app.DataInicio) == "" {
		return "", types.ErrInvalidParam
	}
	token, err := s.jwt.SignApp(app)
	if err != nil {
		return "", types.ErrInternal.WithCause(err)
	}
	if err := s.appRepo.CreateAuthorizedApp(ctx, app, token); err != nil {
		return "", err
	}
	return token, nil
}

func (s AuthService) UpdateAuthorizedApp(ctx context.Context, id int64, app types.AplicativoPayload) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	app.ID = id
	return s.appRepo.UpdateAuthorizedApp(ctx, app)
}

func (s AuthService) DeleteAuthorizedApp(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.appRepo.DeleteAuthorizedApp(ctx, id)
}

func (s AuthService) AccessLimitIPCurrent(context.Context) ([]map[string]any, error) {
	return []map[string]any{}, nil
}

func (s AuthService) AccessLimitUserCurrent(context.Context) ([]map[string]any, error) {
	return []map[string]any{}, nil
}

func (s AuthService) AccessLimitIPHistory(ctx context.Context, blacklist bool) ([]map[string]any, error) {
	return s.systemRepo.AccessLimitIPHistory(ctx, blacklist)
}

func (s AuthService) AccessLimitUserHistory(ctx context.Context) ([]map[string]any, error) {
	return s.systemRepo.AccessLimitUserHistory(ctx)
}

func (s AuthService) ListInactivePreUsers(ctx context.Context) ([]types.PessoaUsuarioCadastro, error) {
	return s.preUserRepo.ListInactivePreUsers(ctx)
}

func (s AuthService) PreUser(ctx context.Context, id int64) (types.PessoaUsuarioCadastro, error) {
	return s.preUserRepo.FindPreUser(ctx, id)
}

func (s AuthService) UserLogs(ctx context.Context, login string, top *int) ([]types.LogAcessoUsuario, error) {
	if strings.TrimSpace(login) == "" {
		return nil, types.ErrInvalidParam
	}
	return s.userRepo.UserLogs(ctx, login, top)
}

func (s AuthService) UserLogsByCPF(ctx context.Context, cpf string, top *int) ([]types.LogAcessoUsuario, error) {
	cpf = utils.NormalizeCPF(cpf)
	if cpf == "" {
		return nil, types.ErrInvalidParam
	}
	return s.userRepo.UserLogsByCPF(ctx, cpf, top)
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
	exists, err := s.preUserRepo.PreUserExistsByCPFOrEmail(ctx, p)
	if err != nil {
		return err
	}
	if exists {
		return types.ErrCPFAlreadyExists
	}
	p.CPF = utils.NormalizeCPF(p.CPF)
	return s.preUserRepo.CreatePreUser(ctx, p, false)
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
	idPessoa, err := s.preUserRepo.PersonIDByUserID(ctx, userID)
	if err != nil {
		return err
	}
	p.CPF = utils.NormalizeCPF(p.CPF)
	if err := s.preUserRepo.UpdatePreUser(ctx, p, idPessoa); err != nil {
		return err
	}
	if err := s.preUserRepo.DeactivateUser(ctx, userID); err != nil {
		return err
	}
	return s.preUserRepo.SetUserRecadastramento(ctx, userID, false)
}

func (s AuthService) ActivatePreUser(ctx context.Context, p types.PessoaUsuarioCadastro, actorID int64) error {
	if p.ID == 0 || strings.TrimSpace(p.Login) == "" || strings.TrimSpace(p.Perfil) == "" || strings.TrimSpace(p.Acesso) == "" {
		return types.ErrInvalidParam
	}
	if p.IDCadastrador == 0 {
		p.IDCadastrador = actorID
	}
	if strings.EqualFold(p.Acesso, "LOCAL") && strings.TrimSpace(p.Senha) == "" {
		p.Senha = gerarSenhaTemporaria(8)
	}
	idUsuario, err := s.preUserRepo.UserIDByPersonID(ctx, p.ID)
	if err == nil && idUsuario > 0 {
		if strings.EqualFold(p.Acesso, "LOCAL") {
			if err := s.preUserRepo.UpdateUserPasswordReset(ctx, idUsuario, p.Senha); err != nil {
				return err
			}
		}
		if err := s.preUserRepo.ActivateUser(ctx, idUsuario); err != nil {
			return err
		}
	} else {
		if err := s.preUserRepo.CreateUserFromActivation(ctx, p); err != nil {
			return err
		}
	}
	return s.preUserRepo.ActivatePreUser(ctx, p.ID)
}

func gerarSenhaTemporaria(length int) string {
	const chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*-+ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
	if length <= 0 {
		length = 8
	}
	out := make([]byte, length)
	max := big.NewInt(int64(len(chars)))
	for i := range out {
		n, err := crand.Int(crand.Reader, max)
		if err != nil {
			out[i] = chars[time.Now().UnixNano()%int64(len(chars))]
			continue
		}
		out[i] = chars[n.Int64()]
	}
	return string(out)
}

func (s AuthService) DeletePreUser(ctx context.Context, id int64) error {
	if id <= 0 {
		return types.ErrInvalidParam
	}
	return s.preUserRepo.DeletePreUser(ctx, id)
}

func (s AuthService) EnablePreUserRecadastramento(ctx context.Context, idPessoa int64) error {
	if idPessoa <= 0 {
		return types.ErrInvalidParam
	}
	idUsuario, err := s.preUserRepo.UserIDByPersonID(ctx, idPessoa)
	if err != nil {
		return err
	}
	if err := s.preUserRepo.ActivateUser(ctx, idUsuario); err != nil {
		return err
	}
	return s.preUserRepo.SetUserRecadastramento(ctx, idUsuario, true)
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
