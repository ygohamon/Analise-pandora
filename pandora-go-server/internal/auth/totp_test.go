package auth

import (
	"testing"
	"time"
)

func TestVerifyTOTP(t *testing.T) {
	secret := "JBSWY3DPEHPK3PXP"
	now := time.Unix(1700000000, 0)
	counter := uint64(now.Unix() / totpPeriod)
	code, err := totpCode(secret, counter)
	if err != nil {
		t.Fatalf("totpCode returned error: %v", err)
	}
	if !VerifyTOTP(secret, code, now, 0) {
		t.Fatal("expected code to verify")
	}
	if VerifyTOTP(secret, "000000", now, 0) {
		t.Fatal("unexpected invalid code verification")
	}
}
