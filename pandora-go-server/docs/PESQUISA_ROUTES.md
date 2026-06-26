# Matriz da secao Pesquisa

Este documento e o mapa operacional das telas de Pesquisa do `pandora-app`
para o backend Go. A regra adotada e **Facade Pesquisa**: a tela deve ser
facil de localizar a partir da secao Pesquisa, mas a consulta real continua no
dominio correto para evitar repository gigante e SQL duplicado.

Fluxo esperado:

```text
Tela Pesquisa -> rota /server -> handler fino -> usecase/facade -> repository de dominio/fonte -> resposta
```

## Regras de manutencao

- Handler de pesquisa so le HTTP e chama usecase.
- Usecase valida, normaliza e orquestra.
- Repository executa consulta especifica por dominio/fonte.
- Integrado e sempre usecase orquestrador.
- Pix continua dominio/fonte propria via BCCCS.
- SQL nao deve entrar em handler.
- Permissao/perfil nao deve entrar em repository.
- O integrado deve reaproveitar consultas especificas quando houver.
- Consultas exclusivas de telas novas podem ficar em `internal/repositories/pesquisa`.
- Consultas reaproveitaveis devem ficar em repository de dominio e serem chamadas pelo facade.

## Status das telas

| Tela do app | Endpoints Go | Handler/facade | Usecase chamado | Repository/fonte real | Status |
|---|---|---|---|---|---|
| `/dashboard/pesquisa/pessoa` | `GET /pessoas/simplificado/{cpf,nome,rg,cnh,titulo,nomepai,nomemae,telefone,email,endereco}/{valor}` | `pessoa_handler.go` | `PessoaUseCase` | `repositories/pessoa/repository` | Testado |
| `/dashboard/pesquisa/integrado/pessoa` | `GET /pessoas/integrado/{cpf,rg,nome}/{valor}` | `pessoa_handler.go` | `PessoaUseCase` -> `IntegradoCPFUseCase` | ports/repositories especificos de pessoa, endereco, telefone, veiculo, processo etc.; `funcao=crawlers` usa `integrations/crawlers` | Testado |
| `/dashboard/pesquisa/empresa` | `GET /empresas/simplificado/{cnpj,razaosocial,nomefantasia,endereco,telefone,email,sociopf_cpf,sociopf_nome,sociopj_cnpj}/{valor}` | `empresa_handler.go` | `EmpresaUseCase` | `repositories/empresa/repository` e ports de empresa | Testado |
| `/dashboard/pesquisa/integrado/empresa` | `GET /empresas/integrado/cnpj/{cnpj}` | `empresa_handler.go` | `EmpresaUseCase` -> `IntegradoEmpresaUseCase` | repositories especificos de empresa, socio, telefone, patrimonio, processo etc.; `funcao=crawlers` usa `integrations/crawlers` | Testado |
| `/dashboard/pesquisa/endereco` | `GET /enderecos/simplificado/{cpf,cnpj,nome,logradouro,razaosocial}/{valor}` | `pesquisa_operacional_handler.go` | `EnderecoUseCase` | `EnderecoRepository` + dominio pessoa/empresa quando necessario | Testado |
| `/dashboard/pesquisa/pix` | `POST /bcccs/pix/{cpf,cnpj,chave}/{valor}` | `bcccs_handler.go` | `BCCCSUseCase` | `BCCCSRepository` + `integrations/bcccs` | Testado |
| `/dashboard/pesquisa/telefone` | `GET /telefones/simplificado/{cpf,cnpj,nome,razaosocial,nomefantasia,telefone,buscaprofunda/telefone}/{valor}` | `pesquisa_operacional_handler.go` | `TelefoneUseCase` | `TelefoneRepository` + repositories pessoa/empresa | Testado |
| `/dashboard/pesquisa/veiculo` | `GET /veiculos/detalhado/{cpf,cnpj,nome,chassi,renavam,placa}/{valor}` | `pesquisa_operacional_handler.go` | `VeiculoConsultaUseCase` | `VeiculoRepository` e fontes Cortex/locais quando configuradas | Testado |
| `/dashboard/pesquisa/embarcacao` | `GET /embarcacoes/{cpf,cnpj,embarcacao,inscricao}/{valor}` | `pesquisa_operacional_handler.go` | `EmbarcacaoUseCase` | `EmbarcacaoRepository` e fontes Cortex/locais quando configuradas | Testado |
| `/dashboard/pesquisa/aeronaves` | `GET /aeronaves/{cpf,cnpj,nome,matricula}/{valor}` | `pesquisa_operacional_handler.go` | `AeronaveUseCase` | `AeronaveRepository` | Testado |
| `/dashboard/pesquisa/obito` | `GET /obitos/simplificado/{cpf,nome}/{valor}` | `pesquisa_operacional_handler.go` | `ObitoUseCase` | `ObitoRepository` e fontes externas quando configuradas | Testado |
| `/dashboard/pesquisa/orcrim` | `GET /orcrins/`, `GET /orcrins/orcrim/{orcrim}` | `pesquisa_operacional_handler.go` | `OrcrimUseCase` | `OrcrimRepository` | Testado |
| `/dashboard/pesquisa/beneficios` | `POST /beneficios/cpf/{cpf}` | `pesquisa_operacional_handler.go` | `BeneficioUseCase` | `BeneficioRepository` + transparencia quando permitido | Testado |
| `/dashboard/pesquisa/gpu` | `GET /gpu/{cpf,nome,rg,oab}/{valor}`, `GET /gpu/detalhado/{cpf}`, `GET /gpu/advogado/consultar-atendimentos` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` + `integrations/gpu` | Testado |
| `/dashboard/pesquisa/preso` | `GET /presos/simplificado/{cpf,nome,vulgo,cnc,nomemae}/{valor}`, `GET /presos/detalhado/{cpf,cnc}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` com fontes SISDEPEN/SDS quando configuradas | Implementado sem massa |
| `/dashboard/pesquisa/arma` | `GET /armas/simplificado/{serie,sinarm}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` + INFOSEG quando configurado | Implementado sem massa |
| `/dashboard/pesquisa/folhapagamento` | `GET /utils/orgao`, `GET /folhapagamento/{municipal,estadual}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` + BD_SAGRES/TCEPB | Implementado sem massa |
| `/dashboard/pesquisa/imovel` | `GET /imoveis/{cpf,cnpj}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` reaproveitando DOI/ITBI quando configurado | Implementado sem massa |
| `/dashboard/pesquisa/investigado` | `GET /investigados/{cpf,cnpj,nome,razaosocial,operacao,alcunha}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` com BD_GAECO quando configurado | Implementado sem massa |
| `/dashboard/pesquisa/prontuario` | `GET /prontuarios/{cpf,nome,rg,alcunha}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` com LINCE/PRONTUARIO quando configurado | Implementado sem massa |
| `/dashboard/pesquisa/fichasuja` | `GET /fichasuja/{cpf,rg,nome,nomemae,titulo}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` com BD_FICHA_SUJA | Implementado sem massa |
| `/dashboard/pesquisa/processo` | `GET /processo/processos/{processo}`, `GET /processo/{cpf,cnpj}/{valor}` | `pesquisa_novas_handler.go` | `pesquisa.UseCases` | `repositories/pesquisa` + CAEX/TJSP quando configurado | Implementado sem massa |

## Onde procurar codigo

- Entrada HTTP das telas ja consolidadas: `internal/http/handlers/pesquisa/pesquisa_operacional_handler.go`.
- Entrada HTTP das telas novas: `internal/http/handlers/pesquisa/pesquisa_novas_handler.go`.
- Rotas registradas: `internal/http/handlers/pesquisa/routes.go`.
- Usecase das telas novas: `internal/usecases/pesquisa`.
- Repository das consultas exclusivas das telas novas: `internal/repositories/pesquisa`.
- A secao Pesquisa usa subpastas proprias apenas para handlers, usecases e repositories. Mappers compartilhados ficam em `internal/mappers`, como `gpu_mapper.go`, para evitar bagunca dentro de repository.
- O crawler dos integrados fica em `internal/integrations/crawlers` e so roda quando `funcao=crawlers` e `fontesAbertas` permitir.

## Como decidir onde colocar uma nova consulta

- Se a consulta tambem serve integrado ou outra tela, crie/mande para repository de dominio.
- Se a consulta e exclusiva de uma tela nova de Pesquisa, use `internal/repositories/pesquisa`.
- Se virar reaproveitavel depois, extraia para um repository de dominio e deixe o facade chamando esse dominio.
- Se for API externa, encapsule em `internal/integrations/{fonte}` e chame pelo repository.
