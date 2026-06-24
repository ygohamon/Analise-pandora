package services

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"pandora-go-server/internal/types"
)

type RecaptchaVerifier interface {
	Verify(context.Context, string, string) error
}

type GoogleRecaptchaVerifier struct {
	Secret string
	Client *http.Client
}

func (v GoogleRecaptchaVerifier) Verify(ctx context.Context, token string, remoteIP string) error {
	if strings.TrimSpace(token) == "" {
		return types.ErrRecaptchaNotFound
	}
	if strings.TrimSpace(v.Secret) == "" {
		return types.ErrRecaptchaInvalid.WithCause(types.ErrModelNotConfigured)
	}
	client := v.Client
	if client == nil {
		client = &http.Client{Timeout: 5 * time.Second}
	}
	form := url.Values{}
	form.Set("secret", v.Secret)
	form.Set("response", token)
	if remoteIP != "" {
		form.Set("remoteip", remoteIP)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://www.google.com/recaptcha/api/siteverify", strings.NewReader(form.Encode()))
	if err != nil {
		return types.ErrRecaptchaInvalid.WithCause(err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res, err := client.Do(req)
	if err != nil {
		return types.ErrDependencyUnavailable.WithCause(err)
	}
	defer res.Body.Close()
	var payload struct {
		Success bool `json:"success"`
	}
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return types.ErrRecaptchaInvalid.WithCause(err)
	}
	if !payload.Success {
		return types.ErrRecaptchaInvalid
	}
	return nil
}
