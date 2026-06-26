package pessoa

import "testing"

func TestCleanTextFormatsNumericIDsWithoutScientificNotation(t *testing.T) {
	got := cleanText(float64(2226540))
	if got != "2226540" {
		t.Fatalf("cleanText(float64 id) = %q, want %q", got, "2226540")
	}
}
