package pessoa

// SourceResult representa uma fonte isolada usada pelo usecase integrado.
// Repositories preenchem linhas/erro; o usecase decide agrupamento e resposta final.
type SourceResult struct {
	Name     string
	Category string
	Rows     []map[string]any
	Err      error
}

func sourceResultFromLocal(result pessoaMapSourceResult) SourceResult {
	return SourceResult{
		Name:     result.source.name(),
		Category: result.source.category,
		Rows:     result.rows,
		Err:      result.err,
	}
}

func (s pessoaMapSource) name() string {
	if s.sourceName != "" {
		return s.sourceName
	}
	return s.category
}
