package types

type SocioPF struct {
	CPF         *string `json:"cpf,omitempty"`
	CNPJ        *string `json:"cnpj,omitempty"`
	Nome        *string `json:"nome,omitempty"`
	Logradouro  *string `json:"logradouro,omitempty"`
	Numero      *string `json:"numero,omitempty"`
	Complemento *string `json:"complemento,omitempty"`
	Bairro      *string `json:"bairro,omitempty"`
	Municipio   *string `json:"municipio,omitempty"`
	UF          *string `json:"uf,omitempty"`
	CEP         *string `json:"cep,omitempty"`
	Fonte       string  `json:"fonte,omitempty"`
}
