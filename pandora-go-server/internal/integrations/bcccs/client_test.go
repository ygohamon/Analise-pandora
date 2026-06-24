package bcccs

import "testing"

func TestDecodeVinculosPixEmptyBodies(t *testing.T) {
	for name, raw := range map[string][]byte{
		"empty": nil,
		"blank": []byte("  \n\t "),
		"null":  []byte("null"),
		"bom":   append([]byte{0xEF, 0xBB, 0xBF}, []byte(`{"vinculosPix":[]}`)...),
	} {
		t.Run(name, func(t *testing.T) {
			payload, err := decodeVinculosPix(raw)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if payload.VinculosPix == nil || len(payload.VinculosPix) != 0 {
				t.Fatalf("expected empty slice, got %#v", payload.VinculosPix)
			}
		})
	}
}

func TestDecodeVinculosPixMissingFieldIsEmpty(t *testing.T) {
	payload, err := decodeVinculosPix([]byte(`{"mensagem":"sem vinculos"}`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if payload.VinculosPix == nil || len(payload.VinculosPix) != 0 {
		t.Fatalf("expected empty slice, got %#v", payload.VinculosPix)
	}
}

func TestDecodeVinculosPixXMLFallback(t *testing.T) {
	payload, err := decodeVinculosPix([]byte(`
<vinculosPix>
  <vinculoPix>
    <chave>abc</chave>
    <participante>123</participante>
  </vinculoPix>
</vinculosPix>`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(payload.VinculosPix) != 1 {
		t.Fatalf("expected one row, got %#v", payload.VinculosPix)
	}
	if payload.VinculosPix[0]["chave"] != "abc" || payload.VinculosPix[0]["participante"] != "123" {
		t.Fatalf("unexpected row: %#v", payload.VinculosPix[0])
	}
}

func TestDecodeVinculoPixXMLFallback(t *testing.T) {
	payload, err := decodeVinculoPix([]byte(`<vinculoPix><chave>abc</chave><participante>123</participante></vinculoPix>`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if payload["chave"] != "abc" || payload["participante"] != "123" {
		t.Fatalf("unexpected payload: %#v", payload)
	}
}

func TestDecodeVinculoPixEmptyBodies(t *testing.T) {
	for name, raw := range map[string][]byte{
		"empty": nil,
		"blank": []byte("  \n\t "),
		"null":  []byte("null"),
	} {
		t.Run(name, func(t *testing.T) {
			payload, err := decodeVinculoPix(raw)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if len(payload) != 0 {
				t.Fatalf("expected empty map, got %#v", payload)
			}
		})
	}
}

func TestAllValuesNilTreatsNilAndBlankAsEmpty(t *testing.T) {
	if !allValuesNil(map[string]any{"a": nil, "b": " "}) {
		t.Fatal("expected nil and blank values to be empty")
	}
	if allValuesNil(map[string]any{"a": "valor"}) {
		t.Fatal("expected non-blank value to be non-empty")
	}
}
