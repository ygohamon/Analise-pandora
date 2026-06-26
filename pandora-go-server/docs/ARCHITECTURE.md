# Arquitetura do pandora-go-server

Este documento orienta a manutencao diaria do `pandora-go-server`.
Ele descreve a arquitetura esperada para novas consultas, novas fontes e
refatoracoes incrementais sem quebrar contratos existentes.

O `pandora-server` em Node continua sendo uma referencia funcional para regras,
fontes e formatos de resposta. O Go, porem, deve manter uma arquitetura propria,
mais explicita e facil de evoluir.

## Fluxo padrao

O fluxo esperado para uma rota comum e:

```text
Handler
  -> UseCase
    -> Port/Interface
      -> Repository concreto
        -> Mapper/DTO
  -> Response
```

Responsabilidades:

- Handler: recebe HTTP, extrai path/query/body/claims e escreve a resposta.
- UseCase: valida, normaliza, aplica autorizacao/perfil e orquestra o fluxo.
- Port/Interface: define o contrato que o usecase precisa.
- Repository: executa uma consulta especifica por dominio ou fonte.
- Integration: encapsula chamada externa, autenticacao, timeout e erro tecnico.
- Mapper/DTO: converte dados brutos para o formato esperado pelo front.
- Response: preserva o envelope atual, como `status`, `msg` e `dados`.

Handlers nao devem acessar SQL, clients externos ou regras de permissao
diretamente. Repositories nao devem decidir autorizacao, perfil ou fluxo de tela.

## Contextos principais

O sistema tem dois contextos grandes. Eles podem compartilhar infraestrutura, mas
nao devem misturar responsabilidades sem necessidade.

### Consultas Operacionais

Consultas Operacionais sao as pesquisas usadas nas telas e nos integrados:

- pessoa;
- empresa;
- Pix/BCCCS;
- veiculo;
- endereco;
- telefone;
- mandado;
- processo;
- antecedentes;
- integrado pessoa;
- integrado empresa;
- integrado CPF/CNPJ.
- analise operacional, como empenhos, licitacoes, aditivos, contratos e TCE.
- apps operacionais, como Integra, DNA, Painel Covid, Faccoes, SADEP e SefazML.

Esse contexto vive principalmente em handlers de pesquisa, usecases de consulta,
ports de repositorio, repositories especificos, integrations externas, mappers e
DTOs de resposta.

As secoes do app podem ter pastas de entrada para facilitar manutencao diaria,
como `internal/usecases/pesquisa`, `internal/repositories/pesquisa`,
`internal/usecases/analise`, `internal/repositories/analise`,
`internal/usecases/apps` e `internal/repositories/apps`. A camada de
mapper continua compartilhada em `internal/mappers` neste momento; nao crie
`mappers/pesquisa`, `mappers/analise` ou `mappers/apps` sem necessidade real.

### Sistema Administrativo

Sistema Administrativo cobre recursos internos da aplicacao:

- auth;
- usuario;
- perfil;
- permissoes;
- logs;
- auditoria;
- sistema;
- cache;
- metricas;
- rate limit;
- gerenciamento interno.

Esse contexto nao deve depender de detalhes de pessoa, empresa ou integrado,
exceto quando for um relatorio administrativo claramente definido.

### Infraestrutura Compartilhada

Infraestrutura Compartilhada inclui:

- bootstrap do servidor;
- middlewares;
- JWT/TFA;
- cache;
- config;
- database;
- modelconfig;
- HTTP response helpers;
- erros padronizados;
- validators;
- utils;
- auditoria tecnica por fonte.

Infraestrutura deve ser reutilizavel pelos dois contextos, sem carregar regra de
negocio especifica de tela.

## Regra dos integrados

Consulta integrada sempre e um usecase orquestrador.

Fluxo esperado:

```text
Integrated Handler
  -> Integrated UseCase
    -> varios repositories especificos
    -> mapper/post-process integrado
    -> DTO/envelope compativel
  -> Response
```

O integrado nao deve duplicar SQL. Ele deve reaproveitar as mesmas consultas
especificas usadas por rotas isoladas sempre que possivel.

Exemplo:

- rota isolada de veiculo chama `VeiculoUseCase`;
- integrado de pessoa tambem precisa de veiculos;
- ambos devem chamar um port/repository especifico de veiculo;
- o integrado apenas agrega o resultado na aba correta.

Quando uma fonte externa alimenta varias abas, o usecase integrado deve
reaproveitar o resultado dentro da mesma execucao para evitar chamadas
redundantes.

## Regra dos repositories

Repository representa uma consulta especifica por dominio ou por fonte.

Exemplos bons:

- pessoa por CPF em Receita local;
- endereco por CPF em Receita local;
- veiculo por placa em Detran/Renavam;
- mandado por CPF no Cortex;
- empresa por CNPJ em Receita;
- Pix/BCCCS auditoria e registros locais.

Evite repositories gigantes por fornecedor ou por tela. Um arquivo chamado
`cortex_repository.go` que consulta pessoa, empresa, veiculo, mandado e endereco
vira ponto unico de manutencao dificil. Prefira nomes por dominio/fonte, como
`veiculo_cortex`, `endereco_cortex`, `empresa_receita` ou `pessoa_sismp`.

Repositories podem conhecer SQL, tabelas de modelconfig e clients de integration
quando forem a camada concreta da consulta. Repositories nao devem conhecer regra
de permissao, perfil de usuario, envelope HTTP ou layout de tela.

## Como adicionar uma nova fonte de consulta

1. Identifique o dominio da fonte: pessoa, empresa, veiculo, endereco, processo,
   Pix, logs etc.
2. Verifique se ja existe um port/interface pequeno para esse dominio.
3. Se nao existir, crie um port pequeno com o minimo que o usecase precisa.
4. Implemente o repository concreto com uma consulta especifica.
5. Se for API externa, crie ou reutilize um client em `internal/integrations`.
6. Crie mapper quando o payload bruto nao estiver no formato esperado pelo front.
7. Chame a fonte pelo usecase, aplicando permissao, flags e auditoria antes/depois.
8. Se a fonte tambem for usada no integrado, reaproveite o mesmo port/repository.

Checklist rapido:

- A fonte tem timeout e erro tecnico controlado?
- O log nao grava payload sensivel?
- A auditoria registra fonte, documento mascarado, status, duracao e quantidade?
- O retorno vazio e tratado como vazio quando a fonte estiver ausente/desativada?
- O contrato JSON existente foi preservado?

## Como adicionar uma nova tela ou rota especifica

1. Crie ou atualize o handler do contexto correto.
2. O handler deve apenas ler path/query/body/claims e chamar o usecase.
3. Crie um usecase especifico quando houver validacao, normalizacao ou
   orquestracao propria.
4. Defina ports pequenos para as consultas necessarias.
5. Implemente repositories especificos por dominio/fonte.
6. Use mapper/DTO quando a resposta precisar de shape estavel para o front.
7. Registre logs/auditoria e respeite middlewares de seguranca.
8. Registre a rota sem alterar rotas existentes.

Exemplo de consulta especifica:

```text
GET /server/veiculos/detalhado/placa/{placa}
  -> VeiculoHandler
  -> VeiculoUseCase
  -> VeiculoRepository.BuscaPorPlaca
  -> mapper de veiculo, se necessario
  -> {"status":"OK","dados":[...]}
```

## Como adicionar uma nova consulta integrada

1. Crie ou evolua o usecase integrado do dominio: pessoa ou empresa.
2. Liste as abas esperadas e as fontes que alimentam cada aba.
3. Para cada fonte, use ports/repositories especificos.
4. Aplique flags de perfil no usecase, nao no repository.
5. Reaproveite resultados compartilhados por execucao.
6. Agregue as abas em mapper/post-process integrado.
7. Omita abas vazias apenas quando esse ja for o contrato esperado.
8. Preserve nomes de abas, campos e envelope JSON.

Exemplo:

```text
GET /server/pessoas/integrado/cpf/{cpf}?funcao=externo
  -> PessoaHandler
  -> IntegradoPessoaUseCase
  -> PessoaRepository, EnderecoRepository, VeiculoRepository, MandadoRepository
  -> integrations externas quando necessario
  -> mapper integrado
  -> {"status":"OK","dados":[{"pessoa":[...]},{"veiculo":[...]}]}
```

## Pix/BCCCS

Pix e dominio/fonte propria. Nao deve ser tratado como detalhe de pessoa ou
empresa.

Fluxo esperado:

```text
Pix Handler
  -> BCCCSUseCase
    -> valida CPF/CNPJ/chave e dados de processo
    -> grava auditoria
    -> chama integration BCCCS
    -> atualiza auditoria
  -> Response
```

Erros de dependencia externa devem ser separados de retorno vazio. Corpo vazio,
`null` ou resposta sem vinculos pode ser sucesso sem dados, desde que esse seja o
comportamento esperado pela tela.

## Logs, auditoria e seguranca

Seguranca e auditoria sao transversais, mas a decisao de permissao deve acontecer
antes do repository.

Regras:

- Middlewares cuidam de JWT, hash de requisicao, CORS, timeout, rate limit,
  recovery, cache e logging HTTP.
- Usecases aplicam regras de perfil, flags como `pep`, `rif`, `cortex`,
  `jusbrasil`, `seeu`, `fontesAbertas`, e validacoes de processo quando
  aplicavel.
- Repositories nao devem decidir se usuario pode ou nao consultar uma fonte.
- Auditoria por fonte deve registrar documento mascarado, dominio, fonte,
  permissao aplicada, inicio/fim, duracao, status, quantidade e erro resumido.
- Logs tecnicos devem mostrar `source`, `method`, `path`, `status`,
  `duration_ms`, `rows` e erro resumido quando houver.
- Nunca gravar payload sensivel completo no terminal.

Rate limit e cache devem permanecer em middleware ou infraestrutura dedicada.
Nao implemente rate limit dentro de repository.

## Observabilidade e compose

Em producao, o servidor escreve logs estruturados no stdout para consumo por
Docker/Loki/Grafana. Nao e necessario gerar arquivo `.log` dentro do container:
a coleta deve acontecer pela saida padrao. O endpoint `/metrics` fica disponivel
para Prometheus/Grafana e deve ser expandido sem expor dados sensiveis.

Os arquivos `dev.yml` e `prod.yml` declaram timeouts, cache, rate limit e URL
interna do `pandora-crawlers`. O ambiente de desenvolvimento pode usar
`SERVER_ENV=ratification` para simular regras de producao sem bloquear
`/loginDev`, que so e bloqueado quando `SERVER_ENV=production`.

O fluxo `funcao=crawlers` do integrado usa a integration
`internal/integrations/crawlers`. Essa chamada e resiliente: timeout, 404 ou
falha da fonte aberta nao derruba o integrado; o usecase audita e retorna apenas
as abas que tiverem registros.

## Modulo administrativo

Auth, usuario, perfil, permissoes, logs, auditoria, sistema, cache e metricas sao
Sistema Administrativo.

Fluxo esperado:

```text
Admin Handler
  -> Admin/Auth/Logs/Sistema UseCase ou Service
  -> Port administrativo
  -> Repository administrativo
  -> Response
```

Esse contexto pode ler logs e auditorias das consultas, mas nao deve importar
repositories operacionais para executar pesquisas de pessoa/empresa sem uma regra
explicita.

## O que nao deve ser feito

Nao faca:

- repository gigante concentrando CPF, CNPJ, veiculo, pessoa, endereco, mandado,
  empresa e fontes externas;
- SQL dentro de handler;
- regra de permissao dentro de repository;
- handler chamando integration externa diretamente;
- integrado duplicando SQL de consulta especifica;
- integrado chamando endpoint externo varias vezes quando uma chamada alimenta
  varias abas;
- misturar usuario, logs, sistema e perfil com consulta operacional;
- colocar payload sensivel completo em logs;
- mudar envelope JSON para "melhorar" arquitetura;
- mudar rota existente sem migracao explicita;
- remover auditoria ou logs para simplificar fluxo;
- criar DTO novo em massa sem necessidade concreta;
- mover arquivos em lote sem testes e validacao de contrato.

## Criterio para refatoracao incremental

Refatore somente quando houver beneficio claro:

- reduzir duplicacao real;
- permitir reuso pelo integrado e pela rota especifica;
- separar regra de permissao de SQL;
- isolar API externa;
- facilitar teste ou manutencao de uma fonte.

Cada etapa deve preservar:

- rotas;
- contratos JSON;
- autenticacao;
- permissoes;
- logs;
- auditoria;
- comportamento de negocio.

## Estado atual da organizacao

Esta documentacao acompanha uma refatoracao incremental. O estado atual e:

- handlers continuam estaveis e responsaveis apenas pela borda HTTP;
- usecases integrados de pessoa e empresa seguem como orquestradores;
- ports operacionais foram quebrados em interfaces menores sem remover os agregados antigos;
- `AuthService` continua como facade administrativa compativel, mas internamente usa ports menores para auth, aplicativos, usuario, permissoes, perfil, logs, auditoria, integra, sistema e pre-usuario;
- rotas de Meu Perfil, Meu Historico, tema da interface e administracao de usuarios/perfis ficam documentadas em `docs/SISTEMA_ROUTES.md`;
- repositories concretos ainda nao foram movidos em massa;
- SQL, rotas, JSON, autenticacao, permissoes, logs e auditoria permanecem preservados.

Proximas refatoracoes devem preferir migracoes pequenas: primeiro ajustar um usecase para depender de um port menor, depois mover ou renomear arquivos de repository somente quando houver teste e comparacao de contrato.
