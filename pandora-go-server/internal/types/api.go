package types

type SearchOptions struct {
	Funcao        string
	CPFUsuario    string
	EmailUsuario  string
	Processo      string
	PEP           bool
	RIF           bool
	JusBrasil     bool
	Cortex        bool
	SEEU          bool
	Transparencia bool
	FontesAbertas bool
}

type IntegraAttachment struct {
	Arquivo     []byte
	NomeArquivo string
	Tamanho     int64
	MIME        string
}

type AplicativoAutorizado struct {
	ID               int64  `json:"id"`
	Nome             string `json:"nome"`
	Ativo            bool   `json:"ativo"`
	DataInicio       string `json:"dataInicio"`
	DataExpiracao    string `json:"dataExpiracao,omitempty"`
	DataInicioRaw    string `json:"-"`
	DataExpiracaoRaw string `json:"-"`
}

type AplicativoPayload struct {
	ID            int64  `json:"id"`
	Nome          string `json:"nome"`
	Ativo         bool   `json:"ativo"`
	DataInicio    string `json:"dataInicio"`
	DataExpiracao string `json:"dataExpiracao"`
}

type ErrorLogPayload struct {
	Tipo     string `json:"tipo"`
	Arquivo  string `json:"arquivo,omitempty"`
	Linha    int64  `json:"linha,omitempty"`
	Coluna   int64  `json:"coluna,omitempty"`
	Mensagem string `json:"mensagem"`
	Stack    string `json:"stack,omitempty"`
	URL      string `json:"url,omitempty"`
	Usuario  string `json:"usuario,omitempty"`
	App      string `json:"app,omitempty"`
	DataHora string `json:"dataHora,omitempty"`
}
