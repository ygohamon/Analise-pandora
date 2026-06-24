package auth

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"
)

type JWTService struct {
	secret []byte
	ttl    time.Duration
}

type Claims map[string]any

func NewJWTService(secret string, ttl time.Duration) JWTService {
	return JWTService{secret: []byte(secret), ttl: ttl}
}

func NewJWTVerifier(secret string) JWTService {
	return NewJWTService(secret, 6*time.Hour)
}

func (v JWTService) Sign(payload any) (string, error) {
	return v.SignWithTTL(payload, v.ttl)
}

func (v JWTService) SignApp(app any) (string, error) {
	if len(v.secret) == 0 {
		return "", errors.New("jwt secret not configured")
	}
	now := time.Now()
	claims := map[string]any{
		"app": app,
		"ts":  now.UnixMilli(),
		"iat": now.Unix(),
	}
	header := map[string]string{"alg": "HS512", "typ": "JWT"}
	headerPart, err := encodeJWTPart(header)
	if err != nil {
		return "", err
	}
	payloadPart, err := encodeJWTPart(claims)
	if err != nil {
		return "", err
	}
	signed := headerPart + "." + payloadPart
	mac := hmac.New(sha512.New, v.secret)
	_, _ = mac.Write([]byte(signed))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return signed + "." + signature, nil
}

func (v JWTService) SignWithTTL(payload any, ttl time.Duration) (string, error) {
	if len(v.secret) == 0 {
		return "", errors.New("jwt secret not configured")
	}
	if ttl <= 0 {
		ttl = v.ttl
	}
	now := time.Now()
	claims := map[string]any{
		"user": payload,
		"ts":   now.UnixMilli(),
		"iat":  now.Unix(),
		"exp":  now.Add(ttl).Unix(),
	}
	header := map[string]string{"alg": "HS512", "typ": "JWT"}
	headerPart, err := encodeJWTPart(header)
	if err != nil {
		return "", err
	}
	payloadPart, err := encodeJWTPart(claims)
	if err != nil {
		return "", err
	}
	signed := headerPart + "." + payloadPart
	mac := hmac.New(sha512.New, v.secret)
	_, _ = mac.Write([]byte(signed))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return signed + "." + signature, nil
}

func (v JWTService) Verify(headerValue string) (Claims, error) {
	token := bearerToken(headerValue)
	if token == "" {
		return nil, errors.New("token not found")
	}
	if len(v.secret) == 0 {
		return nil, errors.New("jwt secret not configured")
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid jwt format")
	}

	signed := parts[0] + "." + parts[1]
	expected := hmac.New(sha512.New, v.secret)
	_, _ = expected.Write([]byte(signed))
	signature := base64.RawURLEncoding.EncodeToString(expected.Sum(nil))
	if !hmac.Equal([]byte(signature), []byte(parts[2])) {
		return nil, errors.New("invalid jwt signature")
	}

	var header struct {
		Alg string `json:"alg"`
	}
	if err := decodeJWTPart(parts[0], &header); err != nil {
		return nil, err
	}
	if header.Alg != "HS512" {
		return nil, errors.New("unsupported jwt algorithm")
	}

	var claims Claims
	if err := decodeJWTPart(parts[1], &claims); err != nil {
		return nil, err
	}
	if exp, ok := numericClaim(claims["exp"]); ok && time.Now().Unix() > exp {
		return nil, errors.New("jwt expired")
	}
	return claims, nil
}

func UserFromClaims(claims Claims) map[string]any {
	user, _ := claims["user"].(map[string]any)
	return user
}

func UserIDFromClaims(claims Claims) string {
	user := UserFromClaims(claims)
	switch id := user["id"].(type) {
	case string:
		return id
	case float64:
		return strconv.FormatInt(int64(id), 10)
	case int64:
		return strconv.FormatInt(id, 10)
	case int:
		return strconv.Itoa(id)
	default:
		raw, _ := json.Marshal(id)
		return strings.Trim(string(raw), `"`)
	}
}

func bearerToken(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	fields := strings.Fields(value)
	if len(fields) == 2 && strings.EqualFold(fields[0], "Bearer") {
		return fields[1]
	}
	return value
}

func decodeJWTPart(part string, target any) error {
	raw, err := base64.RawURLEncoding.DecodeString(part)
	if err != nil {
		return err
	}
	return json.Unmarshal(raw, target)
}

func encodeJWTPart(value any) (string, error) {
	raw, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

func numericClaim(value any) (int64, bool) {
	switch v := value.(type) {
	case float64:
		return int64(v), true
	case int64:
		return v, true
	case int:
		return int64(v), true
	default:
		return 0, false
	}
}
