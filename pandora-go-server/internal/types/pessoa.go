package types

type PessoaSimplificada struct {
	CPF                  *string `json:"cpf"`
	Nome                 *string `json:"nome"`
	NomeMae              *string `json:"nomeMae,omitempty"`
	Municipio            *string `json:"municipio,omitempty"`
	UF                   *string `json:"uf,omitempty"`
	DataNascimento       *string `json:"dataNascimento,omitempty"`
	Sexo                 *string `json:"sexo,omitempty"`
	SituacaoCadastral    *string `json:"situacaoCadastral,omitempty"`
	NaturezaOcupacao     *string `json:"naturezaOcupacao,omitempty"`
	OcupacaoPrincipal    *string `json:"ocupacaoPrincipal,omitempty"`
	AnoObito             *string `json:"anoObito,omitempty"`
	AnoExercicioOcupacao *string `json:"anoExercicioOcupacao,omitempty"`
	Fonte                string  `json:"fonte"`
}
