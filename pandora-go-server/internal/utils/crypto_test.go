package utils

import "testing"

func TestEncryptDecryptAESGCM(t *testing.T) {
	encrypted, err := EncryptAESGCM("JBSWY3DPEHPK3PXP", "server-secret")
	if err != nil {
		t.Fatalf("EncryptAESGCM returned error: %v", err)
	}
	if encrypted == "JBSWY3DPEHPK3PXP" {
		t.Fatal("expected encrypted value to differ from plain text")
	}
	decrypted, err := DecryptAESGCM(encrypted, "server-secret")
	if err != nil {
		t.Fatalf("DecryptAESGCM returned error: %v", err)
	}
	if decrypted != "JBSWY3DPEHPK3PXP" {
		t.Fatalf("unexpected decrypted value: %q", decrypted)
	}
}
