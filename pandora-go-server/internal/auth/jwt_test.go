package auth

import (
	"testing"
	"time"
)

func TestJWTServiceSignAndVerify(t *testing.T) {
	t.Parallel()

	service := NewJWTService("secret", time.Hour)
	token, err := service.Sign(map[string]any{"id": 123, "perfil": "admin"})
	if err != nil {
		t.Fatal(err)
	}

	claims, err := service.Verify("Bearer " + token)
	if err != nil {
		t.Fatal(err)
	}

	user := UserFromClaims(claims)
	if got := UserIDFromClaims(claims); got != "123" {
		t.Fatalf("user id = %q, want 123", got)
	}
	if user["perfil"] != "admin" {
		t.Fatalf("perfil = %v, want admin", user["perfil"])
	}
}

func TestJWTServiceExpired(t *testing.T) {
	t.Parallel()

	service := NewJWTService("secret", -time.Second)
	token, err := service.Sign(map[string]any{"id": 123})
	if err != nil {
		t.Fatal(err)
	}

	if _, err := service.Verify(token); err == nil {
		t.Fatal("expected expired token error")
	}
}
