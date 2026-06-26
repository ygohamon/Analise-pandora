package sistema

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
	"pandora-go-server/internal/http/handlers/shared"
	"strings"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) mailInfo(w http.ResponseWriter, _ *http.Request) {
	host := strings.TrimSpace(os.Getenv("MAIL_HOST"))
	service := strings.TrimSpace(os.Getenv("MAIL_SERVICE"))
	enabled := shared.EnvBool("MAIL_ENABLED", false)
	port := shared.EnvInt("MAIL_PORT", 25)
	data := map[string]any{
		"connected": enabled && (host != "" || service != ""),
		"enabled":   enabled,
		"debug":     shared.EnvBool("MAIL_DEBUG", false),
		"method":    shared.FirstNonEmpty(service, host, "smtp"),
		"config": map[string]any{
			"user": os.Getenv("MAIL_USER"),
			"host": host,
			"port": port,
		},
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: data})
}

func (h Handler) enviarEmail(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Email struct {
			To      []map[string]any `json:"to"`
			Subject string           `json:"subject"`
			Content string           `json:"content"`
			All     bool             `json:"all"`
		} `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	recipients := shared.EmailRecipients(payload.Email.To)
	if payload.Email.All || shared.HasBroadcastRecipient(payload.Email.To) {
		users, err := h.auth.ActiveMailerUsers(r.Context())
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		recipients = append(recipients, shared.EmailRecipients(users)...)
	}
	recipients = shared.UniqueStrings(recipients)
	if !shared.EnvBool("MAIL_ENABLED", false) {
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: nil})
		return
	}
	if len(recipients) == 0 || strings.TrimSpace(payload.Email.Subject) == "" {
		httpx.ErrorFrom(w, types.ErrInvalidParam)
		return
	}
	host := strings.TrimSpace(os.Getenv("MAIL_HOST"))
	port := shared.EnvInt("MAIL_PORT", 25)
	if host == "" {
		httpx.ErrorFrom(w, types.ErrInvalidParam)
		return
	}
	from := shared.FirstNonEmpty(os.Getenv("MAIL_FROM"), os.Getenv("MAIL_USER"), "pandora@mpsp.mp.br")
	user := strings.TrimSpace(os.Getenv("MAIL_USER"))
	pass := os.Getenv("MAIL_PW")
	var auth smtp.Auth
	if user != "" || pass != "" {
		auth = smtp.PlainAuth("", user, pass, host)
	}
	body := shared.BuildMailMessage(from, recipients, payload.Email.Subject, payload.Email.Content)
	if err := smtp.SendMail(fmt.Sprintf("%s:%d", host, port), auth, from, recipients, []byte(body)); err != nil {
		httpx.ErrorFrom(w, types.ErrInternal.WithCause(err))
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: map[string]any{"accepted": recipients}})
}

func (h Handler) dbInfo(w http.ResponseWriter, r *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: h.sistema.DBInfo(r.Context())})
}

func (h Handler) apiCacheInfo(w http.ResponseWriter, _ *http.Request) {
	count := 0
	if h.cache != nil {
		count = h.cache.Count()
	}
	data := map[string]any{
		"connected": true,
		"enabled":   h.cfg.CacheTTL > 0,
		"debug":     false,
		"method":    "mem",
		"duration":  h.cfg.CacheTTL.String(),
		"keysCount": count,
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: data})
}

func (h Handler) apiCacheIndex(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []string{}})
}

func (h Handler) clearAPICache(w http.ResponseWriter, _ *http.Request) {
	cleared := 0
	if h.cache != nil {
		cleared = h.cache.Clear()
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: map[string]any{"cleared": cleared}})
}

func (h Handler) modelCacheInfo(w http.ResponseWriter, _ *http.Request) {
	data := map[string]any{
		"connected": true,
		"enabled":   false,
		"debug":     false,
		"method":    "bypass",
		"duration":  "0s",
		"keysCount": 0,
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: data})
}

func (h Handler) modelCacheIndex(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []string{}})
}

func (h Handler) clearModelCache(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: map[string]any{"cleared": 0}})
}

func (h Handler) limiteAcessoIPInfo(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.AccessLimitIPCurrent(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) limiteAcessoIPHistorico(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.AccessLimitIPHistory(r.Context(), false)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) limiteAcessoIPBlacklist(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.AccessLimitIPHistory(r.Context(), true)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) clearLimiteAcessoIP(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []bool{true}})
}

func (h Handler) limiteAcessoUsuarioInfo(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.AccessLimitUserCurrent(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) limiteAcessoUsuarioHistorico(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.AccessLimitUserHistory(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) clearLimiteAcessoUsuario(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []bool{true, true, true}})
}
