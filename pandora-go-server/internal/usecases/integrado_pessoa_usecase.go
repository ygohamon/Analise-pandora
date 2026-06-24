package usecases

import (
	"context"
	"log/slog"
	"sort"
	"strings"
	"sync"
	"time"

	"pandora-go-server/internal/audit"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/repositories"
	"pandora-go-server/internal/types"
)

type integradoPessoaSourceTask struct {
	name     string
	category string
	run      func(context.Context) ([]map[string]any, error)
}

type integradoPessoaLocalTask struct {
	name string
	run  func(context.Context) ([]repositories.SourceResult, error)
}

// integradoLocalCPF orquestra fontes locais de pessoa e monta as abas esperadas pelo front.
func (u IntegradoCPFUseCase) integradoLocalCPF(ctx context.Context, cpf string, options types.SearchOptions) (any, error) {
	started := time.Now()
	pessoas, err := u.pessoas.IntegradoLocalPessoasCPF(ctx, cpf)
	if err != nil {
		return nil, err
	}
	grouped := map[string][]any{}
	order := []string{}
	if len(pessoas) > 0 {
		grouped["pessoa"] = append(grouped["pessoa"], pessoasToAny(pessoas)...)
		order = append(order, "pessoa")
	}
	results := u.runLocalPessoaTasks(ctx, cpf, options)
	for _, result := range results {
		u.auditSource(ctx, "pessoa.local", result.Name, result.Category, cpf, true, len(result.Rows), 0, result.Err)
		if result.Err == nil && len(result.Rows) > 0 {
			if _, exists := grouped[result.Category]; !exists {
				order = append(order, result.Category)
			}
			grouped[result.Category] = append(grouped[result.Category], mapsToAny(result.Rows)...)
			continue
		}
		if result.Err != nil {
			slog.WarnContext(ctx, "integrado local source failed",
				"category", result.Category,
				"source", result.Name,
				"cpf", mappers.MaskCPF(cpf),
				"error", result.Err,
			)
		}
	}
	mappers.PostProcessIntegratedGrouped(grouped)
	sort.SliceStable(order, func(i, j int) bool {
		return localCategoryPriority(order[i]) < localCategoryPriority(order[j])
	})
	out := make([]map[string]any, 0, len(order))
	for _, category := range order {
		out = append(out, map[string]any{category: grouped[category]})
	}
	u.logIntegratedSummary(ctx, "pessoa.local", cpf, options.Funcao, started, out)
	return out, nil
}

func (u IntegradoCPFUseCase) runLocalPessoaTasks(ctx context.Context, cpf string, options types.SearchOptions) []repositories.SourceResult {
	tasks := []integradoPessoaLocalTask{
		{name: "local.pessoa_extra", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalPessoaExtraCPF(ctx, cpf)
		}},
		{name: "local.receita", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalReceitaCPF(ctx, cpf)
		}},
		{name: "local.endereco", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalEnderecoCPF(ctx, cpf)
		}},
		{name: "local.telefone", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalTelefoneCPF(ctx, cpf)
		}},
		{name: "local.parentesco", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalParentescoCPF(ctx, cpf)
		}},
		{name: "local.vizinho", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalVizinhoCPF(ctx, cpf)
		}},
		{name: "local.veiculo", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalVeiculoCPF(ctx, cpf)
		}},
		{name: "local.patrimonio", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalPatrimonioCPF(ctx, cpf)
		}},
		{name: "local.itbi", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalITBICPF(ctx, cpf)
		}},
		{name: "local.sisdepen", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalSISDEPENCPF(ctx, cpf)
		}},
		{name: "local.beneficio", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalBeneficioCPF(ctx, cpf)
		}},
		{name: "local.tipologia", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalTipologiaCPF(ctx, cpf)
		}},
		{name: "local.condenacao", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalCondenacaoCPF(ctx, cpf)
		}},
		{name: "local.eleitoral", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalEleitoralCPF(ctx, cpf)
		}},
		{name: "local.empresa", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalEmpresaCPF(ctx, cpf)
		}},
		{name: "local.registro_civil", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalRegistroCivilCPF(ctx, cpf)
		}},
		{name: "local.sasp", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalSASPCPF(ctx, cpf)
		}},
		{name: "local.ficha_suja", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalFichaSujaCPF(ctx, cpf)
		}},
		{name: "local.cartorio", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalCartorioCPF(ctx, cpf)
		}},
		{name: "local.candidato", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalCandidatoCPF(ctx, cpf)
		}},
		{name: "local.virtual", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalVirtualCPF(ctx, cpf)
		}},
	}
	if options.PEP {
		tasks = append(tasks, integradoPessoaLocalTask{name: "local.pep", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalPEPCPF(ctx, cpf)
		}})
	}
	if options.RIF {
		tasks = append(tasks, integradoPessoaLocalTask{name: "local.rif", run: func(ctx context.Context) ([]repositories.SourceResult, error) {
			return u.pessoas.LocalRIFCPF(ctx, cpf)
		}})
	}
	results := []repositories.SourceResult{}
	for _, task := range tasks {
		rows, err := task.run(ctx)
		if err != nil {
			results = append(results, repositories.SourceResult{Name: task.name, Err: err})
			continue
		}
		results = append(results, rows...)
	}
	return results
}

// integradoExternoCPF orquestra APIs externas de pessoa e monta as abas esperadas pelo front.
func (u IntegradoCPFUseCase) integradoExternoCPF(ctx context.Context, cpf string, options types.SearchOptions) (any, error) {
	started := time.Now()
	grouped := map[string][]any{}
	add := func(category string, rows []map[string]any) {
		if len(rows) == 0 {
			return
		}
		grouped[category] = append(grouped[category], mapsToAny(rows)...)
	}

	if options.Cortex {
		for _, result := range u.pessoas.CortexPessoaBaseCPF(ctx, cpf, options) {
			u.addSourceResult(ctx, grouped, cpf, result)
		}
		for _, result := range u.runCortexPessoaTasks(ctx, cpf, options) {
			u.addSourceResult(ctx, grouped, cpf, result)
		}
	} else {
		slog.InfoContext(ctx, "integrado externo cortex disabled by profile", "cpf", mappers.MaskCPF(cpf))
	}

	if rows, err := u.pessoas.IntegradoReceitaFederalCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "receita_federal", "pessoa", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "receita_federal", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		u.auditSource(ctx, "pessoa.externo", "receita_federal", "pessoa", cpf, true, len(rows), 0, nil)
		add("pessoa", rows)
	}
	if results, err := u.pessoas.IntegradoSISMPCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "sismp.pessoas_agregadas", "pessoa", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "sismp.pessoas_agregadas", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		for _, result := range results {
			u.addSourceResult(ctx, grouped, cpf, result)
		}
	}

	credlink, err := u.pessoas.IntegradoCredlinkCompletoCPF(ctx, cpf)
	if err != nil {
		u.auditSource(ctx, "pessoa.externo", "credlink.completo", "integrado", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "credlink", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else if credlink != nil {
		add("pessoa", mappers.CredlinkPessoa(credlink))
		add("endereco", mappers.CredlinkEnderecos(credlink))
		add("telefone", mappers.CredlinkTelefones(credlink))
		add("parentesco", mappers.CredlinkParentesco(credlink))
		add("vizinho", mappers.CredlinkVizinhos(credlink))
		add("empresa", mappers.CredlinkEmpresas(credlink))
		add("veiculo", mappers.CredlinkVeiculos(credlink))
		add("virtual", mappers.CredlinkEmails(credlink))
		add("obito", mappers.CredlinkObitos(credlink))
	}
	if !options.JusBrasil {
		u.auditSource(ctx, "pessoa.externo", "jusbrasil", "processo", cpf, false, 0, 0, nil)
		slog.InfoContext(ctx, "integrado externo jusbrasil disabled by profile", "cpf", mappers.MaskCPF(cpf))
	} else if results, err := u.pessoas.ExternoJusbrasilCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "jusbrasil", "processo", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "jusbrasil", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		for _, result := range results {
			u.addSourceResult(ctx, grouped, cpf, result)
		}
	}
	if !options.SEEU {
		u.auditSource(ctx, "pessoa.externo", "seeu", "sentenciado", cpf, false, 0, 0, nil)
		slog.InfoContext(ctx, "integrado externo seeu disabled by profile", "cpf", mappers.MaskCPF(cpf))
	} else if results, err := u.pessoas.ExternoSEEUCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "seeu", "sentenciado", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "seeu", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		for _, result := range results {
			u.addSourceResult(ctx, grouped, cpf, result)
		}
	}
	if rows, err := u.pessoas.ExternoTJSPCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "tjsp", "processo", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "tjsp", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		u.auditSource(ctx, "pessoa.externo", "tjsp", "processo", cpf, true, len(rows), 0, nil)
		add("processo", rows)
	}
	if !options.Transparencia {
		u.auditSource(ctx, "pessoa.externo", "transparencia", "integrado", cpf, false, 0, 0, nil)
		slog.InfoContext(ctx, "integrado externo transparencia disabled by profile", "cpf", mappers.MaskCPF(cpf))
	} else if results, err := u.pessoas.ExternoTransparenciaCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "transparencia", "integrado", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "transparencia", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		for _, result := range results {
			u.addSourceResult(ctx, grouped, cpf, result)
		}
	}
	if !options.Transparencia {
		// O bloqueio por perfil ja foi auditado no grupo transparencia acima.
	} else if rows, err := u.pessoas.ExternoTransparenciaServidorCPF(ctx, cpf); err != nil {
		u.auditSource(ctx, "pessoa.externo", "transparencia.servidor", "servidor", cpf, true, 0, 0, err)
		slog.WarnContext(ctx, "external api source failed", "api", "transparencia.servidor", "cpf", mappers.MaskCPF(cpf), "error", err)
	} else {
		u.auditSource(ctx, "pessoa.externo", "transparencia.servidor", "servidor", cpf, true, len(rows), 0, nil)
		add("servidor_federal", rows)
	}
	mappers.PostProcessIntegratedGrouped(grouped)

	order := []string{"pessoa", "endereco", "telefone", "parentesco", "vizinho", "empresa", "historico_quadro_societario", "veiculo", "embarcacao", "condutor", "virtual", "mandado", "amador", "obito", "antecedente", "servidor_federal", "processo", "contrato", "viagem", "cartao_governo_federal", "beneficio", "pep", "sentenciado"}
	out := make([]map[string]any, 0, len(order))
	for _, category := range order {
		if rows := grouped[category]; len(rows) > 0 {
			out = append(out, map[string]any{category: rows})
		}
	}
	u.logIntegratedSummary(ctx, "pessoa.externo", cpf, options.Funcao, started, out)
	return out, nil
}

func (u IntegradoCPFUseCase) integradoCrawlersCPF(ctx context.Context, cpf string, options types.SearchOptions) (any, error) {
	started := time.Now()
	u.auditSource(ctx, "pessoa.crawlers", "crawlers", "integrado", cpf, options.FontesAbertas, 0, 0, nil)
	// Crawlers ficam isolados de local/externo para evitar misturar fontes abertas com APIs autenticadas.
	out := []map[string]any{}
	u.logIntegratedSummary(ctx, "pessoa.crawlers", cpf, options.Funcao, started, out)
	return out, nil
}

func (u IntegradoCPFUseCase) integradoPessoasSimplificadas(ctx context.Context, domain, documentKind, document string, options types.SearchOptions, rows []types.PessoaSimplificada) []map[string]any {
	started := time.Now()
	out := []map[string]any{}
	if len(rows) > 0 {
		out = append(out, map[string]any{"pessoa": pessoasToAny(rows)})
	}
	u.logIntegratedDocumentSummary(ctx, domain, documentKind, document, options.Funcao, started, out)
	return out
}

func (u IntegradoCPFUseCase) integradoDocumentoNaoCPF(ctx context.Context, domain, documentKind, document string, options types.SearchOptions) []map[string]any {
	started := time.Now()
	// Fontes externas/crawlers por RG ou nome ainda dependem de migrations dedicadas do Node.
	out := []map[string]any{}
	u.logIntegratedDocumentSummary(ctx, domain, documentKind, document, options.Funcao, started, out)
	return out
}

func (u IntegradoCPFUseCase) addSourceResult(ctx context.Context, grouped map[string][]any, cpf string, result repositories.SourceResult) {
	u.auditSource(ctx, "pessoa.integrado", result.Name, result.Category, cpf, true, len(result.Rows), 0, result.Err)
	if result.Err != nil {
		slog.WarnContext(ctx, "external api source failed", "api", result.Name, "cpf", mappers.MaskCPF(cpf), "error", result.Err)
		return
	}
	if len(result.Rows) > 0 {
		grouped[result.Category] = append(grouped[result.Category], mapsToAny(result.Rows)...)
	}
}

func (u IntegradoCPFUseCase) auditSource(ctx context.Context, domain, source, category, document string, allowed bool, rows int, duration time.Duration, err error) {
	audit.LogSource(ctx, audit.SourceEvent{
		Domain:   domain,
		Source:   source,
		Category: category,
		Document: mappers.MaskCPF(document),
		Allowed:  allowed,
		Rows:     rows,
		Duration: duration,
		Err:      err,
	})
}

func (u IntegradoCPFUseCase) logIntegratedSummary(ctx context.Context, domain, cpf, fn string, started time.Time, out []map[string]any) {
	slog.InfoContext(ctx, "integrated query summary",
		"domain", domain,
		"document", mappers.MaskCPF(cpf),
		"funcao", fn,
		"duration_ms", time.Since(started).Milliseconds(),
		"categories", categoryCounts(out),
	)
}

func (u IntegradoCPFUseCase) logIntegratedDocumentSummary(ctx context.Context, domain, documentKind, document, fn string, started time.Time, out []map[string]any) {
	slog.InfoContext(ctx, "integrated query summary",
		"domain", domain,
		"document_kind", documentKind,
		"document", maskSearchValue(document),
		"funcao", fn,
		"duration_ms", time.Since(started).Milliseconds(),
		"categories", categoryCounts(out),
	)
}

func maskSearchValue(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	if len(value) <= 4 {
		return "***"
	}
	return value[:2] + "***" + value[len(value)-2:]
}

func (u IntegradoCPFUseCase) runCortexPessoaTasks(ctx context.Context, cpf string, options types.SearchOptions) []repositories.SourceResult {
	tasks := []integradoPessoaSourceTask{
		{name: "cortex.empresas.responsavel", category: "empresa", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexEmpresasResponsavelCPF(ctx, cpf, options)
		}},
		{name: "cortex.empresas.contador", category: "empresa", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexEmpresasContadorCPF(ctx, cpf, options)
		}},
		{name: "cortex.quadro_societario", category: "historico_quadro_societario", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexQuadroSocietarioCPF(ctx, cpf, options)
		}},
		{name: "cortex.condutor", category: "condutor", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexCondutorCPF(ctx, cpf, options)
		}},
		{name: "cortex.parentesco.casamento", category: "parentesco", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexCasamentoCPF(ctx, cpf, options)
		}},
		{name: "cortex.obito", category: "obito", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexObitoCPF(ctx, cpf, options)
		}},
		{name: "cortex.amador", category: "amador", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexAmadorCPF(ctx, cpf, options)
		}},
		{name: "cortex.mandado", category: "mandado", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexMandadoCPF(ctx, cpf, options)
		}},
		{name: "cortex.veiculo", category: "veiculo", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexVeiculoCPF(ctx, cpf, options)
		}},
		{name: "cortex.embarcacao", category: "embarcacao", run: func(ctx context.Context) ([]map[string]any, error) {
			return u.pessoas.CortexEmbarcacaoCPF(ctx, cpf, options)
		}},
	}
	results := make([]repositories.SourceResult, len(tasks))
	var wg sync.WaitGroup
	for i, task := range tasks {
		wg.Add(1)
		go func(i int, task integradoPessoaSourceTask) {
			defer wg.Done()
			rows, err := task.run(ctx)
			results[i] = repositories.SourceResult{Name: task.name, Category: task.category, Rows: rows, Err: err}
		}(i, task)
	}
	wg.Wait()
	return results
}

func pessoasToAny(rows []types.PessoaSimplificada) []any {
	out := make([]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row)
	}
	return out
}

func mapsToAny(rows []map[string]any) []any {
	out := make([]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row)
	}
	return out
}

func localCategoryPriority(category string) int {
	order := map[string]int{
		"pessoa":                      10,
		"parentesco":                  20,
		"vizinho":                     30,
		"endereco":                    40,
		"telefone":                    50,
		"empresa":                     60,
		"veiculo":                     70,
		"condutor":                    80,
		"foto":                        82,
		"preso":                       84,
		"empregador":                  90,
		"beneficio":                   95,
		"historico_quadro_societario": 100,
		"virtual":                     110,
		"eleitoral":                   120,
		"imovel":                      125,
		"processo":                    130,
		"tipologia":                   135,
		"obito":                       140,
		"servidor_estadual":           145,
		"sasp":                        146,
		"fato":                        147,
		"abordagem":                   148,
		"ocorrencia":                  149,
		"pep":                         150,
		"rif":                         160,
		"ficha_suja":                  170,
		"cartorio":                    180,
		"candidato":                   190,
	}
	if value, ok := order[category]; ok {
		return value
	}
	return 999
}
