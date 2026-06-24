package dto

import "pandora-go-server/internal/types"

// PessoaSimplificadaDTO e o shape enviado ao front nas consultas simplificadas.
type PessoaSimplificadaDTO = types.PessoaSimplificada

// SearchOptionsDTO concentra flags de perfil e query params do integrado.
type SearchOptionsDTO = types.SearchOptions
