package types

import "time"

type AuditLog struct {
	IP        string    `json:"ip,omitempty"`
	Usuario   string    `json:"usuario,omitempty"`
	UsuarioID string    `json:"usuario_id,omitempty"`
	Secao     string    `json:"secao,omitempty"`
	Item      string    `json:"item,omitempty"`
	Chave     string    `json:"chave,omitempty"`
	Valor     string    `json:"valor,omitempty"`
	Tipo      string    `json:"tipo,omitempty"`
	Code      string    `json:"code,omitempty"`
	Mensagem  string    `json:"mensagem,omitempty"`
	DataHora  time.Time `json:"data_hora"`
	UserAgent string    `json:"user_agent,omitempty"`
	URL       string    `json:"url,omitempty"`
	OS        string    `json:"os,omitempty"`
	Browser   string    `json:"browser,omitempty"`
	Device    string    `json:"device,omitempty"`
	Processo  string    `json:"processo,omitempty"`
}

type SecurityAudit struct {
	RequestID     string        `json:"request_id,omitempty"`
	Code          string        `json:"code"`
	Kind          ErrorKind     `json:"kind"`
	Severity      AuditSeverity `json:"severity"`
	Reason        string        `json:"reason"`
	UsuarioID     string        `json:"usuario_id,omitempty"`
	IP            string        `json:"ip,omitempty"`
	Method        string        `json:"method,omitempty"`
	Path          string        `json:"path,omitempty"`
	Processo      string        `json:"processo,omitempty"`
	CorrelationID string        `json:"correlation_id,omitempty"`
	OccurredAt    time.Time     `json:"occurred_at"`
}
