package types

import (
	"errors"
	"net/http"
)

type ErrorKind string
type AuditSeverity string

const (
	KindValidation    ErrorKind = "validation"
	KindAuth          ErrorKind = "auth"
	KindAccess        ErrorKind = "access"
	KindQuota         ErrorKind = "quota"
	KindNotFound      ErrorKind = "not_found"
	KindConflict      ErrorKind = "conflict"
	KindDependency    ErrorKind = "dependency"
	KindConfiguration ErrorKind = "configuration"
	KindNotMigrated   ErrorKind = "not_migrated"
	KindInternal      ErrorKind = "internal"
)

const (
	AuditInfo     AuditSeverity = "info"
	AuditWarning  AuditSeverity = "warning"
	AuditSecurity AuditSeverity = "security"
	AuditCritical AuditSeverity = "critical"
)

type AppError struct {
	Code          string
	Message       string
	HTTPStatus    int
	Kind          ErrorKind
	AuditSeverity AuditSeverity
	AuditReason   string
	Cause         error
}

func (e *AppError) Error() string {
	if e == nil {
		return ""
	}
	if e.Cause != nil {
		return e.Code + ": " + e.Cause.Error()
	}
	return e.Code + ": " + e.Message
}

func (e *AppError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

func (e *AppError) WithCause(cause error) *AppError {
	if e == nil {
		return nil
	}
	return &AppError{
		Code:          e.Code,
		Message:       e.Message,
		HTTPStatus:    e.HTTPStatus,
		Kind:          e.Kind,
		AuditSeverity: e.AuditSeverity,
		AuditReason:   e.AuditReason,
		Cause:         cause,
	}
}

func NewAppError(code string, status int, kind ErrorKind, severity AuditSeverity, message string, auditReason string) *AppError {
	return &AppError{
		Code:          code,
		Message:       message,
		HTTPStatus:    status,
		Kind:          kind,
		AuditSeverity: severity,
		AuditReason:   auditReason,
	}
}

func AsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}

var (
	ErrInternal = NewAppError(
		"ESERVER",
		http.StatusInternalServerError,
		KindInternal,
		AuditCritical,
		"NAO FOI POSSIVEL CONCLUIR A SOLICITACAO NESTE MOMENTO.",
		"internal_unexpected_error",
	)
	ErrInvalidParam = NewAppError(
		"EPARAMINVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditInfo,
		"PARAMETRO INFORMADO NAO ATENDE AO FORMATO ESPERADO.",
		"request_parameter_invalid",
	)
	ErrInvalidPayload = NewAppError(
		"EPAYLOADNOTVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditInfo,
		"DADOS ENVIADOS NAO ATENDEM AO FORMATO ESPERADO.",
		"request_payload_invalid",
	)
	ErrInvalidPassword = NewAppError(
		"EPASSWORDNOTVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditWarning,
		"NAO FOI POSSIVEL VALIDAR AS CREDENCIAIS INFORMADAS.",
		"password_invalid",
	)
	ErrInvalidCPF = NewAppError(
		"EPARAMINVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditInfo,
		"DOCUMENTO INFORMADO NAO ATENDE AO FORMATO ESPERADO.",
		"cpf_invalid",
	)
	ErrInvalidCNPJ = NewAppError(
		"EPARAMINVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditInfo,
		"DOCUMENTO INFORMADO NAO ATENDE AO FORMATO ESPERADO.",
		"cnpj_invalid",
	)
	ErrInvalidEmail = NewAppError(
		"EPARAMINVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditInfo,
		"E-MAIL INFORMADO NAO ATENDE AO FORMATO ESPERADO.",
		"email_invalid",
	)
	ErrNotFound = NewAppError(
		"ENOTFOUND",
		http.StatusNotFound,
		KindNotFound,
		AuditInfo,
		"NAO FORAM ENCONTRADOS REGISTROS PARA A SOLICITACAO.",
		"resource_not_found",
	)
	ErrConflict = NewAppError(
		"ECONFLICT",
		http.StatusConflict,
		KindConflict,
		AuditWarning,
		"NAO FOI POSSIVEL PROCESSAR A SOLICITACAO COM OS DADOS ATUAIS.",
		"resource_conflict",
	)
	ErrCPFAlreadyExists = NewAppError(
		"ECPFEXIST",
		http.StatusConflict,
		KindConflict,
		AuditWarning,
		"JA EXISTE CADASTRO PARA O DOCUMENTO INFORMADO.",
		"cpf_already_exists",
	)
	ErrRegistrationIncomplete = NewAppError(
		"EREGISTERINCOMPLETE",
		http.StatusUnprocessableEntity,
		KindValidation,
		AuditWarning,
		"CADASTRO DO USUARIO PRECISA SER COMPLEMENTADO.",
		"registration_incomplete",
	)
	ErrUnauthorized = NewAppError(
		"ENOTAUTH",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL VALIDAR O ACESSO A ESTE RECURSO.",
		"auth_not_validated",
	)
	ErrRouteUnauthorized = NewAppError(
		"ENOTAUTH",
		http.StatusForbidden,
		KindAccess,
		AuditSecurity,
		"USUARIO SEM PERMISSAO PARA ACESSAR ESTE RECURSO.",
		"route_access_denied",
	)
	ErrTokenInvalid = NewAppError(
		"ETOKENNOTVALID",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL VALIDAR A SESSAO DE ACESSO.",
		"token_invalid",
	)
	ErrTokenNotFound = NewAppError(
		"ETOKENNOTFOUND",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL IDENTIFICAR A SESSAO DE ACESSO.",
		"token_not_found",
	)
	ErrHashInvalid = NewAppError(
		"EHASHNOTVALID",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL VALIDAR A ASSINATURA DA REQUISICAO.",
		"hash_invalid",
	)
	ErrHashNotFound = NewAppError(
		"EHASHNOTFOUND",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL IDENTIFICAR A ASSINATURA DA REQUISICAO.",
		"hash_not_found",
	)
	ErrLoginFailed = NewAppError(
		"ELOGINFAILED",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"LOGIN E/OU SENHA INCORRETOS.",
		"login_failed",
	)
	ErrLoginTimeout = NewAppError(
		"ETIMEOUT",
		http.StatusGatewayTimeout,
		KindDependency,
		AuditWarning,
		"A VALIDACAO DE ACESSO NAO RESPONDEU NO TEMPO ESPERADO.",
		"login_timeout",
	)
	ErrTFARequired = NewAppError(
		"ETFAREQUIRED",
		http.StatusAccepted,
		KindAuth,
		AuditSecurity,
		"VALIDACAO EM DOIS FATORES NECESSARIA PARA CONCLUIR O ACESSO.",
		"two_factor_required",
	)
	ErrTFACodeInvalid = NewAppError(
		"ETFANOTVALID",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"CODIGO DE AUTENTICACAO NAO VALIDADO.",
		"two_factor_code_invalid",
	)
	ErrTFASetupInvalid = NewAppError(
		"ETFASETUPINVALID",
		http.StatusBadRequest,
		KindValidation,
		AuditSecurity,
		"NAO FOI POSSIVEL PREPARAR A AUTENTICACAO EM DOIS FATORES.",
		"two_factor_setup_invalid",
	)
	ErrRecaptchaInvalid = NewAppError(
		"ERECAPTCHANOTVALID",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL VALIDAR O DESAFIO DE SEGURANCA.",
		"recaptcha_invalid",
	)
	ErrRecaptchaNotFound = NewAppError(
		"ERECAPTCHANOTFOUND",
		http.StatusBadRequest,
		KindValidation,
		AuditSecurity,
		"DESAFIO DE SEGURANCA NAO INFORMADO.",
		"recaptcha_not_found",
	)
	ErrBotDetected = NewAppError(
		"EBOTDETECTED",
		http.StatusForbidden,
		KindAccess,
		AuditSecurity,
		"REQUISICAO BLOQUEADA PELO CONTROLE DE SEGURANCA.",
		"bot_detected",
	)
	ErrQuotaEmpty = NewAppError(
		"EQUOTAEMPTY",
		http.StatusTooManyRequests,
		KindQuota,
		AuditSecurity,
		"LIMITE DE REQUISICOES ATINGIDO PARA ESTE ACESSO.",
		"quota_empty",
	)
	ErrExternalAccessInvalid = NewAppError(
		"EAPPINVALID",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL AUTORIZAR O APLICATIVO INFORMADO.",
		"external_app_invalid",
	)
	ErrExternalAccessTokenInvalid = NewAppError(
		"ETOKENNOTVALID",
		http.StatusUnauthorized,
		KindAuth,
		AuditSecurity,
		"NAO FOI POSSIVEL VALIDAR O ACESSO EXTERNO.",
		"external_token_invalid",
	)
	ErrAppNotFound = NewAppError(
		"EAPPNOTFOUND",
		http.StatusNotFound,
		KindNotFound,
		AuditInfo,
		"APLICATIVO NAO ENCONTRADO.",
		"external_app_not_found",
	)
	ErrDependencyUnavailable = NewAppError(
		"EDEPENDENCY",
		http.StatusBadGateway,
		KindDependency,
		AuditWarning,
		"SERVICO NECESSARIO NAO RESPONDEU COMO ESPERADO.",
		"dependency_unavailable",
	)
	ErrDatabaseUnavailable = NewAppError(
		"EDATABASE",
		http.StatusServiceUnavailable,
		KindDependency,
		AuditCritical,
		"FONTE DE DADOS TEMPORARIAMENTE INDISPONIVEL.",
		"database_unavailable",
	)
	ErrModelNotConfigured = NewAppError(
		"EMODELNOTCONFIGURED",
		http.StatusServiceUnavailable,
		KindConfiguration,
		AuditCritical,
		"FONTE DE DADOS NAO CONFIGURADA PARA ESTA CONSULTA.",
		"model_not_configured",
	)
	ErrNotMigrated = NewAppError(
		"ENOTMIGRATED",
		http.StatusNotImplemented,
		KindNotMigrated,
		AuditInfo,
		"CONSULTA AINDA NAO DISPONIVEL NESTE SERVICO.",
		"route_not_migrated",
	)
)
