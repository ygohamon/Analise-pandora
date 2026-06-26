# pandora-go-server

Backend Go principal da rodada atual de refatoracao do Pandora.

Handoff detalhado para outros agentes/IA: `../docs/HANDOFF_REFACTOR_BACKEND_GO.md`.

O objetivo e manter as consultas operacionais e administrativas no Go com
arquitetura simples por dominio/secao, preservando o `pandora-server` apenas
como referencia funcional ate a homologacao final de paridade, com foco em:

- consultas HTTP rapidas e cancelaveis por `context.Context`;
- middleware de seguranca antes das rotas;
- cache em memoria com TTL para consultas GET;
- limites por IP e por usuario/token;
- JWT HS512 compativel com o `pandora-server`;
- conexao SQL com pool configuravel;
- arquitetura em `cmd/` + `internal/`, parecida com `pandora-crawlers`.

## Rodando

```powershell
go run ./cmd/api
```

Variaveis principais:

- `ENV_FILE`: caminho explicito para um `server.env`; se ausente, carrega `.envs/.production/server.env`.
- `SERVER_PORT`: porta HTTP, padrao `7000`.
- `SERVER_ENV`: `production`, `development` ou `test`.
- `CORS_ORIGINS`: lista separada por virgula.
- `JWT_TOKEN_SENHA`: segredo JWT compartilhado com o servidor atual.
- `BD_DRIVER`: nome do driver SQL registrado no binario.
- `BD_DSN`: DSN do banco.
- `BD_USER`, `BD_PW`, `BD_SERVER`, `BD_PORT`, `BD_DATABASE`: usados para montar DSN SQL Server quando `BD_DSN` nao existir.
- `DB_MAX_OPEN_CONNS`, `DB_MAX_IDLE_CONNS`, `DB_CONN_MAX_LIFETIME_SECONDS`.
- `CACHE_TTL_SECONDS`: TTL padrao das consultas GET.
- `RATE_LIMIT_PER_MINUTE`: limite por minuto.
- `PANDORA_CRAWLERS_URL`: URL do `pandora-crawlers` Go, por exemplo `http://crawlers-dev:3123`.
- `CRAWLERS_TIMEOUT_SECONDS`: timeout das chamadas de crawler.

## Rotas principais migradas

- `GET /health`
- `GET /ping`
- `GET /metrics`
- `GET /pessoas/simplificado/{campo}/{valor}`
- `GET /pessoas/integrado/cpf/{cpf}`
- `GET /pessoas/integrado/rg/{rg}`
- `GET /pessoas/integrado/nome/{nome}`
- `GET /empresas/simplificado/{campo}/{valor}`
- `GET /empresas/detalhado/cnpj/{cnpj}`
- `GET /empresas/integrado/cnpj/{cnpj}`
- secoes Pesquisa, Analise, Apps e Sistema documentadas em `docs/*.md`.

Os integrados suportam `funcao=local`, `funcao=externo` e `funcao=crawlers`.
O modo `crawlers` chama `pandora-crawlers` via `/crawl` quando configurado e
faz bypass resiliente em timeout/falha.

## Padrao de migracao

- `internal/http/handlers`: controllers HTTP finos; leem path/query/header e chamam usecases.
- `internal/http/handlers/pesquisa`, `analise`, `apps` e `sistema`: entrada por secao do app.
- `internal/usecases`: regras de orquestracao, defaults de parametros, validacao de entrada e escolha de modo.
- `internal/usecases/pesquisa`, `analise` e `apps`: usecases/facades por secao operacional.
- `internal/repositories`: consultas SQL/API por fonte, equivalentes aos antigos `models`.
- `internal/repositories/pesquisa`, `analise`, `apps` e `sistema`: repositories por dominio/secao.
- `internal/integrations`: clients externos reutilizaveis por fornecedor, como Cortex, Credlink e OAuth JSON.
- `internal/mappers`: conversao de payload local/externo para abas compativeis com o front.
- `internal/audit`: auditoria tecnica por fonte, com documento mascarado e `request_id`.
- `internal/types`: contratos compartilhados de entrada/saida e erros de dominio.
- `internal/validators`: validadores universais como CPF, CNPJ, email, obrigatoriedade e quantidade de palavras.
- `internal/utils`: normalizacao e formatacao reutilizavel, incluindo documentos, datas e valores vindos de SQL.
- `internal/middleware`: middlewares separados por responsabilidade.

## Erros

Erros de dominio ficam centralizados em `internal/types/errors.go`.

Usecases e repositories devem retornar `types.Err...` ou `types.Err....WithCause(err)`. Controllers e middlewares respondem com `httpx.ErrorFrom(w, err)`, preservando o formato legado:

```json
{
  "status": "EPARAMINVALID",
  "msg": "PARAMETRO(S) INVALIDO(S)."
}
```
