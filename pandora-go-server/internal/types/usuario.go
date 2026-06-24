package types

type LoginRequest struct {
	Login     string `json:"login"`
	Senha     string `json:"senha"`
	Recaptcha string `json:"recaptcha,omitempty"`
	TokenApp  string `json:"tokenApp,omitempty"`
	QuerTFA   *bool  `json:"querTFA,omitempty"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type SetupTFARequest struct {
	Login string `json:"login,omitempty"`
	Senha string `json:"senha"`
}

type SetupTFAResponse struct {
	TempSecret string `json:"tempSecret,omitempty"`
	SetupToken string `json:"setupToken"`
	DataURL    string `json:"dataURL,omitempty"`
	TFAURL     string `json:"tfaURL"`
}

type VerifyTFARequest struct {
	Login      string `json:"login,omitempty"`
	Senha      string `json:"senha,omitempty"`
	Token      string `json:"token"`
	SetupToken string `json:"setupToken,omitempty"`
}

type Usuario struct {
	ID                         int64    `json:"id"`
	IDPessoa                   *int64   `json:"idPessoa,omitempty"`
	IDAtivador                 *int64   `json:"idAtivador,omitempty"`
	Login                      string   `json:"login"`
	Nome                       *string  `json:"nome,omitempty"`
	Email                      *string  `json:"email,omitempty"`
	CPF                        *string  `json:"cpf,omitempty"`
	Perfil                     string   `json:"perfil"`
	Ativo                      bool     `json:"ativo"`
	Acesso                     string   `json:"acesso,omitempty"`
	ProximoLogon               bool     `json:"proximoLogon,omitempty"`
	NecessitaProcesso          bool     `json:"necessitaProcesso,omitempty"`
	LimiteConsultasPorProcesso *int64   `json:"limiteConsultasPorProcesso,omitempty"`
	Recadastramento            bool     `json:"recadastramento,omitempty"`
	SetupTFA                   bool     `json:"setupTFA,omitempty"`
	KeyTFA                     *string  `json:"-"`
	Grupos                     []string `json:"grupos"`
	PEP                        bool     `json:"pep,omitempty"`
	RIF                        bool     `json:"rif,omitempty"`
	JusBrasil                  bool     `json:"jusbrasil,omitempty"`
	Cortex                     bool     `json:"cortex,omitempty"`
	SEEU                       bool     `json:"seeu,omitempty"`
	Transparencia              bool     `json:"transparencia"`
	FontesAbertas              bool     `json:"fontesAbertas"`
}

type UsuarioAdmin struct {
	ID                int64    `json:"id"`
	Nome              *string  `json:"nome,omitempty"`
	Login             string   `json:"login"`
	Email             *string  `json:"email,omitempty"`
	Ativo             bool     `json:"ativo"`
	Acesso            string   `json:"acesso,omitempty"`
	Perfil            string   `json:"perfil"`
	Grupos            []string `json:"grupos"`
	ProximoLogon      bool     `json:"proximoLogon"`
	NecessitaProcesso bool     `json:"necessitaProcesso"`
	Recadastramento   bool     `json:"recadastramento"`
	Cadastrador       *string  `json:"cadastrador,omitempty"`
	DataCriacao       *string  `json:"dataCriacao,omitempty"`
	DataAtualizacao   *string  `json:"dataAtualizacao,omitempty"`
	Lotacao           *string  `json:"lotacao,omitempty"`
	Titularidade      *string  `json:"titularidade,omitempty"`
	CPF               *string  `json:"cpf,omitempty"`
	Telefone          *string  `json:"telefone,omitempty"`
	Validado          *bool    `json:"validado,omitempty"`
}

type PerfilAdmin struct {
	ID                         int64  `json:"id"`
	Perfil                     string `json:"perfil"`
	PEP                        *bool  `json:"pep"`
	RIF                        *bool  `json:"rif"`
	JusBrasil                  bool   `json:"jusbrasil"`
	Cortex                     bool   `json:"cortex"`
	SEEU                       bool   `json:"seeu"`
	Atencao                    bool   `json:"atencao"`
	Risco                      bool   `json:"risco"`
	ServidorEstadual           bool   `json:"servidorEstadual"`
	MostrarFontesDados         bool   `json:"mostrarFontesDados"`
	Transparencia              bool   `json:"transparencia"`
	FontesAbertas              bool   `json:"fontesAbertas"`
	PesquisaEndereco           bool   `json:"pesquisaEndereco"`
	HorarioAtivo               bool   `json:"horarioAtivo"`
	HoraInicio                 int64  `json:"horaInicio"`
	HoraFim                    int64  `json:"horaFim"`
	NecessitaProcesso          bool   `json:"necessitaProcesso"`
	LimiteConsultasPorProcesso *int64 `json:"limiteConsultasPorProcesso,omitempty"`
	TempoSessaoMinutos         int64  `json:"tempoSessaoMinutos"`
}

type UsuarioFalso struct {
	Nome      *string `json:"nome,omitempty"`
	Email     *string `json:"email,omitempty"`
	CPF       *string `json:"cpf,omitempty"`
	Matricula *string `json:"matricula,omitempty"`
	Telefone  *string `json:"telefone,omitempty"`
}

type ListaNegraUsuario struct {
	Situacao       string  `json:"situacao"`
	Login          string  `json:"login"`
	Nome           *string `json:"nome,omitempty"`
	Email          *string `json:"email,omitempty"`
	CPF            *string `json:"cpf,omitempty"`
	Matricula      *string `json:"matricula,omitempty"`
	Telefone       *string `json:"telefone,omitempty"`
	Perfil         *string `json:"perfil,omitempty"`
	DataSituacao   *string `json:"dataSituacao,omitempty"`
	QtdLogs        int64   `json:"qtdLogs"`
	UltimoRegistro *string `json:"ultimoRegistro,omitempty"`
}

type APIResumoMensal struct {
	Servico      string `json:"servico"`
	Quantidade   int64  `json:"quantidade"`
	LimiteAlerta *int64 `json:"limiteAlerta,omitempty"`
	Ano          *int64 `json:"ano,omitempty"`
	Mes          *int64 `json:"mes,omitempty"`
}

type PerfilHorario struct {
	IDPerfil   int64 `json:"idPerfil"`
	Ativo      bool  `json:"ativo"`
	HoraInicio int64 `json:"horaInicio"`
	HoraFim    int64 `json:"horaFim"`
}

type PerfilUsuario struct {
	ID    int64  `json:"id"`
	Login string `json:"login"`
	Nome  string `json:"nome"`
}

type LogAcessoUsuario struct {
	Usuario   *string `json:"usuario,omitempty"`
	IP        *string `json:"ip,omitempty"`
	Secao     *string `json:"secao,omitempty"`
	Item      *string `json:"item,omitempty"`
	Chave     *string `json:"chave,omitempty"`
	Valor     *string `json:"valor,omitempty"`
	Mensagem  *string `json:"mensagem,omitempty"`
	Processo  *string `json:"processo,omitempty"`
	UserAgent *string `json:"userAgent,omitempty"`
	OS        *string `json:"os,omitempty"`
	DataHora  *string `json:"dataHora,omitempty"`
}

type LogSistema struct {
	IP           *string `json:"ip,omitempty"`
	Usuario      *string `json:"usuario,omitempty"`
	Secao        *string `json:"secao,omitempty"`
	Item         *string `json:"item,omitempty"`
	Chave        *string `json:"chave,omitempty"`
	Valor        *string `json:"valor,omitempty"`
	Tipo         *string `json:"tipo,omitempty"`
	Code         *string `json:"code,omitempty"`
	Mensagem     *string `json:"mensagem,omitempty"`
	URL          *string `json:"url,omitempty"`
	UserAgent    *string `json:"userAgent,omitempty"`
	OS           *string `json:"os,omitempty"`
	Browser      *string `json:"browser,omitempty"`
	Device       *string `json:"device,omitempty"`
	Processo     *string `json:"processo,omitempty"`
	TipoProcesso *string `json:"tipoProcesso,omitempty"`
	DataHora     *string `json:"dataHora,omitempty"`
}

type APIConsultaMensal struct {
	ID              int64   `json:"id"`
	Servico         string  `json:"servico"`
	Ano             int64   `json:"ano"`
	Mes             int64   `json:"mes"`
	Quantidade      int64   `json:"quantidade"`
	LimiteAlerta    *int64  `json:"limiteAlerta,omitempty"`
	DataCriacao     *string `json:"dataCriacao,omitempty"`
	DataAtualizacao *string `json:"dataAtualizacao,omitempty"`
}

type Permissao struct {
	IDSecao int64  `json:"id_secao"`
	Secao   string `json:"secao"`
	IDItem  int64  `json:"id_item"`
	Item    string `json:"item"`
}

type PermissoesPorSecao map[string][]string

type UsuarioToken struct {
	ID                         int64    `json:"id"`
	CPF                        string   `json:"cpf,omitempty"`
	Perfil                     string   `json:"perfil"`
	Grupos                     []string `json:"grupos"`
	NecessitaProcesso          bool     `json:"necessita_processo,omitempty"`
	LimiteConsultasPorProcesso *int64   `json:"limite_consultas_por_processo,omitempty"`
	Recadastramento            bool     `json:"recadastramento,omitempty"`
	Membro                     bool     `json:"membro,omitempty"`
	Operacoes                  bool     `json:"operacoes,omitempty"`
	TrocaSenha                 bool     `json:"troca_senha,omitempty"`
	SetupTFA                   bool     `json:"setupTFA,omitempty"`
	PEP                        bool     `json:"pep,omitempty"`
	RIF                        bool     `json:"rif,omitempty"`
	JusBrasil                  bool     `json:"jusbrasil,omitempty"`
	Cortex                     bool     `json:"cortex"`
	SEEU                       bool     `json:"seeu,omitempty"`
	Transparencia              bool     `json:"transparencia"`
	FontesAbertas              bool     `json:"fontesAbertas"`
}

func (u Usuario) IsAdmin() bool {
	for _, grupo := range u.Grupos {
		if grupo == "admin" {
			return true
		}
	}
	return u.Perfil == "admin"
}

func (u Usuario) HasGroup(group string) bool {
	for _, item := range u.Grupos {
		if item == group {
			return true
		}
	}
	return false
}

func (u Usuario) ToToken() UsuarioToken {
	grupos := u.Grupos
	if grupos == nil {
		grupos = []string{}
	}
	token := UsuarioToken{
		ID:            u.ID,
		CPF:           stringValue(u.CPF),
		Perfil:        u.Perfil,
		Grupos:        grupos,
		Membro:        u.HasGroup("membro"),
		Operacoes:     u.HasGroup("operacoes"),
		PEP:           u.PEP,
		RIF:           u.RIF,
		JusBrasil:     u.JusBrasil,
		Cortex:        u.Cortex,
		SEEU:          u.SEEU,
		Transparencia: u.Transparencia,
		FontesAbertas: u.FontesAbertas,
	}
	if u.NecessitaProcesso {
		token.NecessitaProcesso = !u.IsAdmin()
	}
	if u.LimiteConsultasPorProcesso != nil {
		token.LimiteConsultasPorProcesso = u.LimiteConsultasPorProcesso
	}
	if u.Recadastramento {
		token.Recadastramento = true
	}
	if u.ProximoLogon && u.Acesso == "LOCAL" {
		token.TrocaSenha = true
	}
	if u.SetupTFA {
		token.SetupTFA = true
	}
	return token
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

type PessoaUsuarioCadastro struct {
	ID              int64   `json:"id,omitempty"`
	Nome            string  `json:"nome"`
	CPF             string  `json:"cpf"`
	Identidade      string  `json:"identidade,omitempty"`
	OrgEmissor      string  `json:"orgEmissor,omitempty"`
	UFOrgEmissor    string  `json:"ufOrgEmissor,omitempty"`
	Matricula       string  `json:"matricula,omitempty"`
	Titularidade    string  `json:"titularidade,omitempty"`
	Lotacao         string  `json:"lotacao,omitempty"`
	Email           string  `json:"email"`
	Telefone        string  `json:"telefone,omitempty"`
	Ativado         bool    `json:"ativado,omitempty"`
	Origem          string  `json:"origem,omitempty"`
	Login           string  `json:"login,omitempty"`
	Acesso          string  `json:"acesso,omitempty"`
	Perfil          string  `json:"perfil,omitempty"`
	Senha           string  `json:"senha,omitempty"`
	IDCadastrador   int64   `json:"idCadastrador,omitempty"`
	Recaptcha       string  `json:"recaptcha,omitempty"`
	DataCadastro    *string `json:"dataCadastro,omitempty"`
	DataAtualizacao *string `json:"dataAtualizacao,omitempty"`
	Termo           *string `json:"termo,omitempty"`
}
