# Pessoa Repository

Esta pasta agrupa a implementação das consultas de pessoa.

## Estrutura

- `repository/`: package Go real com `SQLRepository`, consultas locais, consultas externas e helpers que precisam acessar `db` ou `models`.

## Regra importante

Em Go, métodos como `func (m SQLRepository) ...` precisam ficar no mesmo package onde o tipo é declarado. Por isso os arquivos ainda ficam juntos dentro de `repository/`, separados por nome de domínio:

- `*_local_methods.go`: métodos públicos chamados pelos usecases/interfaces.
- `*_repository.go`: consultas específicas por domínio/fonte.
- `*_cortex_repository.go`: consultas Cortex já separadas por domínio.
- `*_helpers.go`: helpers internos do repository.

Novas consultas devem entrar em arquivos por domínio dentro de `repository/`, sem criar repository gigante.
