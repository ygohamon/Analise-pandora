package pessoa

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

func normalizeAddressPart(value any) string {
	text := strings.ToUpper(strings.TrimSpace(fmt.Sprint(value)))
	replacer := strings.NewReplacer(".", "", "-", "", "/", "", ",", "", "  ", " ")
	return replacer.Replace(text)
}

// pessoaMapSourceResult guarda o resultado all-settled de cada fonte local.
type pessoaMapSourceResult struct {
	index  int
	source pessoaMapSource
	rows   []map[string]any
	err    error
}

func (m pessoaIntegradoLocalModel) queryLocalSources(ctx context.Context, cpf string, sources []pessoaMapSource) []pessoaMapSourceResult {
	results := make([]pessoaMapSourceResult, len(sources))
	if len(sources) == 0 {
		return results
	}

	var wg sync.WaitGroup
	sem := make(chan struct{}, 8)
	for index, source := range sources {
		index, source := index, source
		results[index] = pessoaMapSourceResult{index: index, source: source}
		wg.Add(1)
		go func() {
			defer wg.Done()
			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				results[index].err = ctx.Err()
				return
			}

			timeout := source.timeout
			if timeout <= 0 {
				timeout = 8 * time.Second
			}
			sourceCtx, cancel := context.WithTimeout(ctx, timeout)
			defer cancel()
			var rows []map[string]any
			var err error
			if source.run != nil {
				rows, err = source.run(sourceCtx, cpf)
			} else {
				rows, err = m.queryMaps(sourceCtx, source.query, source.args(cpf)...)
			}
			if err == nil && source.normalize != nil {
				rows = source.normalize(rows)
			}
			results[index].rows = rows
			results[index].err = err
		}()
	}
	wg.Wait()

	sort.SliceStable(results, func(i, j int) bool {
		return results[i].index < results[j].index
	})
	return results
}

func (m pessoaIntegradoLocalModel) queryLocalSourceResults(ctx context.Context, cpf string, sources []pessoaMapSource) []SourceResult {
	results := m.queryLocalSources(ctx, cpf, sources)
	out := make([]SourceResult, 0, len(results))
	for _, result := range results {
		out = append(out, sourceResultFromLocal(result))
	}
	return out
}
