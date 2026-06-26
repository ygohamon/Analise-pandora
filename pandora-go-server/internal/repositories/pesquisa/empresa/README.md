# Empresa Repository

Esta pasta agrupa a implementação das consultas de empresa/CNPJ.

## Estrutura

- `repository/`: package Go real com `SQLRepository`, consultas simplificadas, integrado local, externo e helpers que precisam acessar `db` ou `models`.

## Regra importante

Em Go, métodos como `func (m SQLRepository) ...` precisam ficar no mesmo package onde o tipo é declarado. Por isso os arquivos ainda ficam juntos dentro de `repository/`, separados por nome de domínio:

- `simplificado_repository.go`: pesquisa inicial de empresa.
- `integrado_local_repository.go`: consultas base do integrado local.
- `external_repository.go`: chamadas externas por fornecedor reaproveitando payload por execução.
- `*_repository.go`: consultas específicas por aba/domínio.
- `dedupe.go` e `sql_helpers.go`: helpers internos.

Novas consultas devem entrar em arquivos por domínio dentro de `repository/`, sem concentrar pessoa, empresa, veículo e integrações em um único arquivo.
