# pandora-go-server

Backend Go separado para migracao incremental do `pandora-server`.

Handoff detalhado para outros agentes/IA: `../docs/HANDOFF_REFACTOR_BACKEND_GO.md`.

O objetivo inicial e manter o servidor Node atual funcionando enquanto consultas de alto volume migram para Go por dominio, com foco em:

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

Os integrados suportam `funcao=local`, `funcao=externo` e `funcao=crawlers`. Crawlers ainda retornam vazio resiliente ate a migracao das fontes abertas, sem alterar o envelope legado.

## Padrao de migracao

- `internal/http/handlers`: controllers HTTP finos; leem path/query/header e chamam usecases.
- `internal/usecases`: regras de orquestracao, defaults de parametros, validacao de entrada e escolha de modo.
- `internal/repositories`: consultas SQL/API por fonte, equivalentes aos antigos `models`.
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
