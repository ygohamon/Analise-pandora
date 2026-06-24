package validators

import "testing"

func TestValidCPF(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name string
		cpf  string
		want bool
	}{
		{name: "valid plain", cpf: "52998224725", want: true},
		{name: "valid formatted", cpf: "529.982.247-25", want: true},
		{name: "invalid check digit", cpf: "52998224726", want: false},
		{name: "invalid repeated", cpf: "11111111111", want: false},
		{name: "invalid short", cpf: "123", want: false},
	}

	for _, tc := range cases {
		got := ValidCPF(tc.cpf)
		if got != tc.want {
			t.Fatalf("%s: ValidCPF(%q) = %v, want %v", tc.name, tc.cpf, got, tc.want)
		}
	}
}

func TestValidCNPJ(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name string
		cnpj string
		want bool
	}{
		{name: "valid plain", cnpj: "11222333000181", want: true},
		{name: "valid formatted", cnpj: "11.222.333/0001-81", want: true},
		{name: "invalid check digit", cnpj: "11222333000182", want: false},
		{name: "invalid repeated", cnpj: "00000000000000", want: false},
		{name: "invalid short", cnpj: "123", want: false},
	}

	for _, tc := range cases {
		got := ValidCNPJ(tc.cnpj)
		if got != tc.want {
			t.Fatalf("%s: ValidCNPJ(%q) = %v, want %v", tc.name, tc.cnpj, got, tc.want)
		}
	}
}
