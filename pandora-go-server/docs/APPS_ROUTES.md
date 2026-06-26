# Apps Routes

Este documento mapeia a secao `dashboard/apps` do Pandora App para as rotas
atendidas pelo `pandora-go-server`.

Fluxo padrao:

`Handler apps -> UseCase apps -> Repository apps/domino existente -> Response`

Handlers nao executam SQL. UseCases validam e orquestram. Repositories consultam
fontes especificas por app/fonte e retornam lista vazia quando a fonte configurada
nao existir no ambiente.

| Tela | Endpoints Go | Fonte Node de referencia | Status |
|---|---|---|---|
| Integra | `POST /integra`, `GET /integra/promotorias/{promotoria}`, `GET /integra/promotorias/`, `POST /integra/demandas/` | `routes/apps/integra.routes.ts` | Parcial: leitura/consulta; anexos/admin ficam em `sistema` |
| Caca Fantasmas | `GET /cacafantasmas/orgao/municipal/{orgao}`, `GET /cacafantasmas/cdugestora/{cdugestora}` | `routes/apps/cacafantasmas.routes.ts` | Implementado resiliente |
| DNA | `GET /dna/cnpj/{cnpj}` | `routes/apps/dna.routes.ts` | Implementado resiliente |
| Painel Covid | `GET /painelcovid/tabelageral/{uf}` | `routes/apps/painelcovid.routes.ts` | Implementado resiliente |
| INP | `GET /nepotismo/orgao`, `GET /nepotismo/cpf` | `routes/apps/nepotismo.routes.ts` | Implementado resiliente |
| Mapa Consumo | `GET /mapaconsumo/` | `routes/apps/mapaconsumo.routes.ts` | Implementado resiliente |
| Relacionamentos | `GET /relacionamentos/lista/{lista}`, `/pessoa`, `/telefone`, `/empresa`, `/orgao`, `/endereco` | `routes/apps/relacionamentos.routes.ts` | Implementado resiliente |
| Faccoes | GETs de consulta, membros, imagens, pendentes de validacao, `POST /faccoes`, `POST /faccoes/faccionado`, `PATCH/DELETE /faccoes/validacao/*` | `routes/apps/faccoes.routes.ts` | Segunda rodada: leitura e mutacoes principais. Mutacoes usam `admin` no Go ate existir middleware equivalente ao perfil inteligencia do Node |
| Relatorio Lote | Reaproveita rotas de pessoa/empresa ja migradas | App client-side | Sem endpoint novo |
| Qualificacao Lote | Reaproveita rotas de qualificacao/pessoa/empresa | App client-side | Sem endpoint novo |
| ERB Tracker | Processamento client-side com mapa | App client-side | Sem endpoint novo |
| TipoRank | `GET /tiporank/uf`, `/tiporank/uf/{uf}`, `/tiporank/uf/{uf}/municipio/{municipio}` | `routes/apps/tiporank.routes.ts` | Implementado resiliente |
| Ariel | `POST /ariel/foto` | `routes/apps/ariel.routes.ts` | Placeholder resiliente ate integrar fonte Ariel |
| SIMBA | `GET /simba/top/cpf/{cpf}`, `GET /simba/top/cnpj/{cnpj}` | `routes/apps/simba.routes.ts` | Implementado resiliente |
| YellowPages | `GET /yellowpages/cnpj/{cnpj}`, `GET /yellowpages/razaosocial/{razaosocial}` | `routes/apps/yellowpages.routes.ts` | Implementado resiliente |
| SefazML / SefazRank | `GET /sefazml/`, `/municipio/{municipio}`, `/item/{idItem}`, `/topfornecedores/{top}`, `/vendasfornecedor/`, `/produto/` | `routes/apps/sefazML.routes.ts` | Implementado resiliente |
| SADEP | `GET /sadep/mandados/uf/{uf}`, `/detalhamento/cpf/{cpf}`, `/relatorio/mandados/uf/{uf}`, `/mandadosporuf/uf/{uf}`, `/mandado/cpf/{cpf}`, `/geocode/endereco/{endereco}`, `/pdfmandado/id/{id}/cookie/{cookie}` | `routes/apps/sadep.routes.ts` | Parcial: PDF real depende de fonte/cookie |
| Relaciona Tipologia PF/PJ | `GET /relacionatipologias/{uf}`, `GET /relacionatipologias/pj/{uf}` | `routes/apps/relacionatipologias.routes.ts` | Implementado resiliente |

## Regras De Manutencao

- Nova tela de Apps deve entrar primeiro em `internal/http/handlers/apps`.
- Consulta nova deve ir para `internal/usecases/apps` e `internal/repositories/apps`,
  salvo quando ja existir dominio reaproveitavel em `pesquisa`, `analise` ou `sistema`.
- Nao colocar SQL no handler.
- Nao colocar permissao no repository.
- Nao registrar rotas mutaveis como stub silencioso; CRUD e validacoes devem ter
  implementacao real ou ficar fora da etapa.
- Mutacoes de Faccoes escrevem em `FACCOES_APP` quando configurado. Tabelas
  auxiliares ausentes sao ignoradas apenas para campos opcionais; tabela
  principal ausente retorna erro de configuracao.
