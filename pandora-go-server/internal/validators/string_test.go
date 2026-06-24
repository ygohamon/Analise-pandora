package validators

import "testing"

func TestStringValidators(t *testing.T) {
	t.Parallel()

	if !Required(" valor ") {
		t.Fatal("Required should accept non-empty trimmed strings")
	}
	if Required("   ") {
		t.Fatal("Required should reject blank strings")
	}
	if !MinWords("maria da silva", 2) {
		t.Fatal("MinWords should count words")
	}
	if MinWords("maria", 2) {
		t.Fatal("MinWords should reject too few words")
	}
	if !ValidEmail("teste@example.com") {
		t.Fatal("ValidEmail should accept valid addresses")
	}
	if ValidEmail("sem-email") {
		t.Fatal("ValidEmail should reject invalid addresses")
	}
}
