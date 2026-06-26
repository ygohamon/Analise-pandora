# Matriz da secao Analise

Este documento mapeia as telas de Analise do `pandora-app` para o backend Go.
A organizacao segue o mesmo padrao pragmatico da Pesquisa:

```text
Tela Analise -> rota /server -> handler fino -> usecase de analise -> repository de analise -> resposta
```

## Regras de manutencao

- Handler le somente HTTP e chama `analise.UseCase`.
- Usecase valida CPF, CNPJ, data e parametros compostos.
- Repository executa SQL especifico em fontes SAGRES/TCE quando configuradas.
- Fonte ausente em `modelconfig` retorna `OK` com lista vazia.
- SQL nao deve entrar em handler.
- Permissao, auditoria e rate limit continuam nos middlewares/usecases, nao no repository.
- Mappers continuam em `internal/mappers` apenas se a tela precisar de shape especial.

## Status das telas

| Tela do app | Endpoints Go | Handler | Usecase | Repository/fonte | Status |
|---|---|---|---|---|---|
| `/dashboard/analise/empenhos` | `GET /empenhos/{cpf,cnpj}/{valor}` | `analise_handler.go` | `usecases/analise` | `repositories/analise` + `BD_SAGRES` | Implementado resiliente |
| `/dashboard/analise/licitacoes` | `GET /licitacoes/{cpf,cnpj}/{valor}`, `GET /licitacoes/dados` | `analise_handler.go` | `usecases/analise` | `repositories/analise` + `BD_SAGRES` | Implementado resiliente |
| `/dashboard/analise/aditivos` | `GET /aditivos/{cpf,cnpj,nulicitacao}/{valor}` | `analise_handler.go` | `usecases/analise` | `repositories/analise` + `BD_SAGRES` | Implementado resiliente |
| `/dashboard/analise/contratos` | `GET /contratos/{cpf,cnpj,nulicitacao,nucontrato}/{valor}` | `analise_handler.go` | `usecases/analise` | `repositories/analise` + `BD_SAGRES` | Implementado resiliente |
| `/dashboard/analise/tce` | `GET /tce/{tipo}/{data}` | `analise_handler.go` | `usecases/analise` | `repositories/analise` + `WEBSERVICE_TCE` | Implementado resiliente |

## Onde procurar codigo

- Rotas registradas: `internal/http/handlers/analise/routes.go`.
- Entrada HTTP: `internal/http/handlers/analise/handler.go`.
- Marcador da secao: `internal/http/handlers/analise/doc.go`.
- Orquestracao/validacao: `internal/usecases/analise`.
- SQL especifico: `internal/repositories/analise`.
