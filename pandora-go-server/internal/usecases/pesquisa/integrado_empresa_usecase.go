package usecases

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"pandora-go-server/internal/audit"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/types"
)

// IntegradoEmpresaUseCase orquestra as abas do integrado por CNPJ.
type IntegradoEmpresaUseCase struct {
	empresas integradoEmpresaPorts
	crawler  CrawlerSearchPort
}

// NewIntegradoEmpresaUseCase cria o orquestrador de empresa sem acoplar com pessoa.
func NewIntegradoEmpresaUseCase(empresas integradoEmpresaPorts, crawler ...CrawlerSearchPort) IntegradoEmpresaUseCase {
	var crawlerPort CrawlerSearchPort
	if len(crawler) > 0 {
		crawlerPort = crawler[0]
	}
	return IntegradoEmpresaUseCase{empresas: empresas, crawler: crawlerPort}
}

// IntegradoCNPJ decide local/externo/crawlers e agrega categorias do integrado empresa.
func (u IntegradoEmpresaUseCase) IntegradoCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) (any, error) {
	if strings.TrimSpace(options.Funcao) == "" {
		options.Funcao = "externo"
	}
	switch strings.ToLower(strings.TrimSpace(options.Funcao)) {
	case "local":
		return u.integradoLocalCNPJ(ctx, cnpj, options), nil
	case "externo":
		return u.integradoExternoCNPJ(ctx, cnpj, options), nil
	case "crawlers":
		return u.integradoCrawlersCNPJ(ctx, cnpj, options), nil
	default:
		return []map[string]any{}, nil
	}
}

func (u IntegradoEmpresaUseCase) integradoLocalCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) []map[string]any {
	started := time.Now()
	out := []map[string]any{}
	defer func() {
		u.logEmpresaIntegratedSummary(ctx, "empresa.local", cnpj, options.Funcao, started, out)
	}()
	out = appendEmpresaCategoria(ctx, out, "empresa", cnpj, u.empresas.LocalEmpresaCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "filial", cnpj, "local.filial", u.empresas.LocalFilialCNPJ)
	out = appendEmpresaCategoria(ctx, out, "atividadeeconomica", cnpj, u.empresas.LocalAtividadeEconomicaCNPJ)
	out = appendEmpresaCategoria(ctx, out, "endereco", cnpj, u.empresas.LocalEnderecoCNPJ)
	out = appendEmpresaCategoria(ctx, out, "telefone", cnpj, u.empresas.LocalTelefoneCNPJ)
	out = appendEmpresaCategoria(ctx, out, "contador", cnpj, u.empresas.LocalContadorCNPJ)
	out = appendEmpresaCategoria(ctx, out, "socio_pf", cnpj, u.empresas.LocalSocioPFCNPJ)
	out = appendEmpresaCategoria(ctx, out, "socio_pj", cnpj, u.empresas.LocalSocioPJCNPJ)
	out = appendEmpresaCategoria(ctx, out, "historico_quadro_societario", cnpj, u.empresas.LocalHistoricoQuadroSocietarioCNPJ)
	out = appendEmpresaCategoria(ctx, out, "virtual", cnpj, u.empresas.LocalVirtualCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "empenho", cnpj, "local.empenho", u.empresas.LocalEmpenhoCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "empregador", cnpj, "local.empregador", u.empresas.LocalEmpregadorCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "tipologia", cnpj, "local.tipologia", u.empresas.LocalTipologiaCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "operacao", cnpj, "local.operacao", u.empresas.LocalOperacaoCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "processo", cnpj, "local.processo", u.empresas.LocalProcessoCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "imovel", cnpj, "local.imovel", u.empresas.LocalImovelCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "eleitoral", cnpj, "local.eleitoral", u.empresas.LocalEleitoralCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "ajunta", cnpj, "local.ajunta", u.empresas.LocalAjuntaCNPJ)
	out = u.appendAuditEmpresaCategoria(ctx, out, "cartorio", cnpj, "local.cartorio", u.empresas.LocalCartorioCNPJ)
	out = appendEmpresaCategoria(ctx, out, "veiculo", cnpj, u.empresas.LocalVeiculoCNPJ)
	out = appendEmpresaCategoria(ctx, out, "aeronave", cnpj, u.empresas.LocalAeronaveCNPJ)
	out = appendEmpresaCategoria(ctx, out, "embarcacao", cnpj, u.empresas.LocalEmbarcacaoCNPJ)
	if options.RIF {
		out = u.appendAuditEmpresaCategoria(ctx, out, "rif", cnpj, "local.rif", u.empresas.LocalRIFCNPJ)
	} else {
		u.auditEmpresaSource(ctx, "empresa.local", "local.rif", "rif", cnpj, false, 0, 0, nil)
	}
	return out
}

func appendEmpresaCategoria(ctx context.Context, out []map[string]any, categoria string, cnpj string, fn func(context.Context, string) ([]map[string]any, error)) []map[string]any {
	rows, err := fn(ctx, cnpj)
	if err != nil || len(rows) == 0 {
		return out
	}
	return append(out, map[string]any{categoria: rows})
}

func (u IntegradoEmpresaUseCase) integradoExternoCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) []map[string]any {
	started := time.Now()
	grouped := map[string][]map[string]any{}
	if rows, err := runMapGroupsWithTimeout(ctx, integradoExternalSourceTimeout, func(sourceCtx context.Context) (map[string][]map[string]any, error) {
		return u.empresas.CortexExternoCNPJ(sourceCtx, cnpj, options)
	}); err == nil {
		u.auditEmpresaGroups(ctx, "empresa.externo", "cortex", cnpj, options.Cortex, rows, nil)
		mergeEmpresaGroups(grouped, rows)
	} else {
		u.auditEmpresaGroups(ctx, "empresa.externo", "cortex", cnpj, options.Cortex, nil, err)
	}
	if rows, err := runMapGroupsWithTimeout(ctx, integradoExternalSourceTimeout, func(sourceCtx context.Context) (map[string][]map[string]any, error) {
		return u.empresas.CredlinkExternoCNPJ(sourceCtx, cnpj)
	}); err == nil {
		u.auditEmpresaGroups(ctx, "empresa.externo", "credlink", cnpj, true, rows, nil)
		mergeEmpresaGroups(grouped, rows)
	} else {
		u.auditEmpresaGroups(ctx, "empresa.externo", "credlink", cnpj, true, nil, err)
	}
	for _, task := range []struct {
		name    string
		allowed bool
		run     func(context.Context, string) (map[string][]map[string]any, error)
	}{
		{name: "receita_federal", allowed: true, run: u.empresas.ReceitaExternoCNPJ},
		{name: "receita_socio", allowed: true, run: u.empresas.SocioReceitaExternoCNPJ},
		{name: "tjsp", allowed: true, run: u.empresas.TJSPExternoCNPJ},
		{name: "transparencia", allowed: options.Transparencia, run: u.empresas.TransparenciaExternoCNPJ},
		{name: "tcu", allowed: options.FontesAbertas, run: u.empresas.TCUExternoCNPJ},
	} {
		if !task.allowed {
			u.auditEmpresaGroups(ctx, "empresa.externo", task.name, cnpj, false, nil, nil)
			continue
		}
		if rows, err := runMapGroupsWithTimeout(ctx, integradoExternalSourceTimeout, func(sourceCtx context.Context) (map[string][]map[string]any, error) {
			return task.run(sourceCtx, cnpj)
		}); err == nil {
			u.auditEmpresaGroups(ctx, "empresa.externo", task.name, cnpj, true, rows, nil)
			mergeEmpresaGroups(grouped, rows)
		} else {
			u.auditEmpresaGroups(ctx, "empresa.externo", task.name, cnpj, true, nil, err)
			logExternalSourceWarn(ctx, task.name, "CNPJ", mappers.MaskCNPJ(cnpj), err)
		}
	}
	if options.JusBrasil {
		if rows, err := runMapGroupsWithTimeout(ctx, integradoExternalSourceTimeout, func(sourceCtx context.Context) (map[string][]map[string]any, error) {
			return u.empresas.JusbrasilExternoCNPJ(sourceCtx, cnpj)
		}); err == nil {
			u.auditEmpresaGroups(ctx, "empresa.externo", "jusbrasil", cnpj, true, rows, nil)
			mergeEmpresaGroups(grouped, rows)
		} else {
			u.auditEmpresaGroups(ctx, "empresa.externo", "jusbrasil", cnpj, true, nil, err)
			logExternalSourceWarn(ctx, "jusbrasil", "CNPJ", mappers.MaskCNPJ(cnpj), err)
		}
	} else {
		u.auditEmpresaGroups(ctx, "empresa.externo", "jusbrasil", cnpj, false, nil, nil)
	}
	out := empresaGroupsToList(grouped)
	u.logEmpresaIntegratedSummary(ctx, "empresa.externo", cnpj, options.Funcao, started, out)
	return out
}

func (u IntegradoEmpresaUseCase) integradoCrawlersCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) []map[string]any {
	started := time.Now()
	out := []map[string]any{}
	if !options.FontesAbertas || u.crawler == nil {
		u.auditEmpresaSource(ctx, "empresa.crawlers", "crawlers", "crawler", cnpj, false, 0, 0, nil)
		u.logEmpresaIntegratedSummary(ctx, "empresa.crawlers", cnpj, options.Funcao, started, out)
		return out
	}
	query := u.crawlerQueryEmpresa(ctx, cnpj)
	rows, err := runWithTimeout(ctx, integradoExternalSourceTimeout, func(sourceCtx context.Context) ([]map[string]any, error) {
		return u.crawler.Search(sourceCtx, query)
	})
	u.auditEmpresaSource(ctx, "empresa.crawlers", "crawlers", "crawler", cnpj, true, len(rows), time.Since(started), err)
	if err != nil {
		logExternalSourceWarn(ctx, "crawlers", "CNPJ", mappers.MaskCNPJ(cnpj), err)
		u.logEmpresaIntegratedSummary(ctx, "empresa.crawlers", cnpj, options.Funcao, started, out)
		return out
	}
	if len(rows) > 0 {
		out = append(out, map[string]any{"crawler": rows})
	}
	u.logEmpresaIntegratedSummary(ctx, "empresa.crawlers", cnpj, options.Funcao, started, out)
	return out
}

func (u IntegradoEmpresaUseCase) crawlerQueryEmpresa(ctx context.Context, cnpj string) string {
	rows, err := u.empresas.LocalEmpresaCNPJ(ctx, cnpj)
	if err != nil || len(rows) == 0 {
		return cnpj
	}
	for _, key := range []string{"razaoSocial", "nomeFantasia", "nome"} {
		text := strings.TrimSpace(fmt.Sprint(rows[0][key]))
		if text != "" && text != "<nil>" {
			return text
		}
	}
	return cnpj
}

func (u IntegradoEmpresaUseCase) appendAuditEmpresaCategoria(ctx context.Context, out []map[string]any, categoria string, cnpj string, source string, fn func(context.Context, string) ([]map[string]any, error)) []map[string]any {
	started := time.Now()
	rows, err := fn(ctx, cnpj)
	u.auditEmpresaSource(ctx, "empresa.local", source, categoria, cnpj, true, len(rows), time.Since(started), err)
	if err != nil || len(rows) == 0 {
		return out
	}
	return append(out, map[string]any{categoria: rows})
}

func (u IntegradoEmpresaUseCase) auditEmpresaGroups(ctx context.Context, domain, source, cnpj string, allowed bool, groups map[string][]map[string]any, err error) {
	rows := 0
	category := "integrado"
	for key, values := range groups {
		if category == "integrado" {
			category = key
		}
		rows += len(values)
	}
	u.auditEmpresaSource(ctx, domain, source, category, cnpj, allowed, rows, 0, err)
}

func (u IntegradoEmpresaUseCase) auditEmpresaSource(ctx context.Context, domain, source, category, cnpj string, allowed bool, rows int, duration time.Duration, err error) {
	audit.LogSource(ctx, audit.SourceEvent{
		Domain:   domain,
		Source:   source,
		Category: category,
		Document: mappers.MaskCNPJ(cnpj),
		Allowed:  allowed,
		Rows:     rows,
		Duration: duration,
		Err:      err,
	})
}

func (u IntegradoEmpresaUseCase) logEmpresaIntegratedSummary(ctx context.Context, domain, cnpj, fn string, started time.Time, out []map[string]any) {
	if os.Getenv("SERVER_ENV") != "production" {
		printIntegratedSummary(domain, "CNPJ", mappers.MaskCNPJ(cnpj), fn, time.Since(started), categoryCounts(out))
		return
	}
	slog.InfoContext(ctx, "integrated query summary",
		"domain", domain,
		"document", mappers.MaskCNPJ(cnpj),
		"funcao", fn,
		"duration_ms", time.Since(started).Milliseconds(),
		"categories", categoryCounts(out),
	)
}

func categoryCounts(out []map[string]any) map[string]int {
	counts := map[string]int{}
	for _, group := range out {
		for category, raw := range group {
			switch rows := raw.(type) {
			case []any:
				counts[category] = len(rows)
			case []map[string]any:
				counts[category] = len(rows)
			default:
				counts[category] = 1
			}
		}
	}
	return counts
}

func mergeEmpresaGroups(dst map[string][]map[string]any, src map[string][]map[string]any) {
	for category, rows := range src {
		if len(rows) == 0 {
			continue
		}
		dst[category] = append(dst[category], rows...)
	}
}

func runMapGroupsWithTimeout(ctx context.Context, timeout time.Duration, fn func(context.Context) (map[string][]map[string]any, error)) (map[string][]map[string]any, error) {
	sourceCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	rows, err := fn(sourceCtx)
	if sourceCtx.Err() == context.DeadlineExceeded {
		return nil, context.DeadlineExceeded
	}
	return rows, err
}

func empresaGroupsToList(grouped map[string][]map[string]any) []map[string]any {
	order := []string{
		"empresa",
		"filial",
		"telefone",
		"virtual",
		"endereco",
		"veiculo",
		"aeronave",
		"embarcacao",
		"empenho",
		"empregador",
		"tipologia",
		"operacao",
		"contrato",
		"cartao_governo_federal",
		"nota_fiscal",
		"renuncia_fiscal",
		"processo",
		"imovel",
		"eleitoral",
		"ajunta",
		"cartorio",
		"rif",
		"historico_quadro_societario",
		"contador",
		"atividadeeconomica",
	}
	out := []map[string]any{}
	seen := map[string]struct{}{}
	for _, category := range order {
		seen[category] = struct{}{}
		out = appendEmpresaGroup(out, category, grouped[category])
	}
	for category, rows := range grouped {
		if _, ok := seen[category]; ok {
			continue
		}
		out = appendEmpresaGroup(out, category, rows)
	}
	return out
}

func appendEmpresaGroup(out []map[string]any, category string, rows []map[string]any) []map[string]any {
	rows = dedupeEmpresaUsecaseRows(rows)
	if len(rows) == 0 {
		return out
	}
	return append(out, map[string]any{category: rows})
}

func dedupeEmpresaUsecaseRows(rows []map[string]any) []map[string]any {
	items := make([]any, 0, len(rows))
	for _, row := range rows {
		items = append(items, row)
	}
	deduped := mappers.DedupeAnyRows(items)
	out := make([]map[string]any, 0, len(deduped))
	for _, item := range deduped {
		if row, ok := item.(map[string]any); ok {
			out = append(out, row)
		}
	}
	return out
}
