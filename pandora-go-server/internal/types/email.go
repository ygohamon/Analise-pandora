package types

type EmailMessage struct {
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Content string   `json:"content"`
}

type EmailContato struct {
	CPF   *string `json:"cpf,omitempty"`
	CNPJ  *string `json:"cnpj,omitempty"`
	Email *string `json:"email,omitempty"`
	Fonte string  `json:"fonte,omitempty"`
}
