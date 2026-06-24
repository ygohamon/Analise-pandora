package types

type Veiculo struct {
	Placa        *string `json:"placa,omitempty"`
	Chassi       *string `json:"chassi,omitempty"`
	TipoChassi   *string `json:"tipoChassi,omitempty"`
	Renavam      *string `json:"renavam,omitempty"`
	AnoFab       *string `json:"anoFab,omitempty"`
	AnoMod       *string `json:"anoMod,omitempty"`
	Tipo         *string `json:"tipo,omitempty"`
	MarcaModelo  *string `json:"marcaModelo,omitempty"`
	Especie      *string `json:"especie,omitempty"`
	Procedencia  *string `json:"procedencia,omitempty"`
	Combustivel  *string `json:"combustivel,omitempty"`
	CPF          *string `json:"cpf,omitempty"`
	CNPJ         *string `json:"cnpj,omitempty"`
	Nome         *string `json:"nome,omitempty"`
	Situacao     *string `json:"situacao,omitempty"`
	Observacao   *string `json:"observacao,omitempty"`
	Restricao    *string `json:"restricao,omitempty"`
	RestricaoRaw *string `json:"restricao_,omitempty"`
	DataCadastro *string `json:"dataCadastro,omitempty"`
	TipoPessoa   *string `json:"tipoPessoa,omitempty"`
	Proprietario *string `json:"proprietario,omitempty"`
	Possuidor    *string `json:"possuidor,omitempty"`
	Fonte        string  `json:"fonte,omitempty"`
}
