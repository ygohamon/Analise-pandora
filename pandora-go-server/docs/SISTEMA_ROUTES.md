# Sistema Routes

Este documento mapeia as rotas administrativas e de perfil do usuario atendidas
pelo `pandora-go-server`.

Fluxo padrao:

`Handler sistema -> AuthService/SistemaUseCase -> Repository sistema -> Response`

Handlers nao executam SQL. Repositories nao decidem permissao. Rotas de
self-service usam `protected`; rotas administrativas usam `admin`.

| Area | Endpoints Go | Responsabilidade | Status |
|---|---|---|---|
| Meu Perfil | `GET /usuarios/me`, `POST /usuarios/validar-senha`, `PATCH /usuarios/{id}/trocasenha`, `PATCH /usuarios/{id}`, `PATCH /preusuarios/{id}/termo` | Dados do usuario logado, validacao/troca de senha, tema `temaEscuro`, modo `espa` e termo | Implementado |
| Meu Historico | `GET /historico/me/{id}?quantidade=&offset=` | Historico resumido do usuario: `data_hora`, `consulta`, `valor`, `processo` | Implementado |
| Gerenciar Usuarios | `GET /usuarios`, `GET /usuarios/{id}`, `GET /usuarios/parcial/{busca}`, `GET /usuarios/{id}/permissao`, `PATCH /usuarios/{id}/redefinirsenha`, `PATCH /usuarios/reset-geral`, `POST /usuarios/resetTfa`, `GET /usuarios/falsos`, `POST /usuarios/falsos/remover`, `POST /usuarios/lista-negra/{bloquear|ativar}` | Listagem, consulta, permissao, reset de senha/TFA e lista negra | Implementado com repositories administrativos |
| Gerenciar Perfis | `GET /sistema/perfis`, `GET /sistema/perfil`, `POST /sistema/perfil`, `DELETE /sistema/perfil/{id}`, `GET/PATCH /sistema/perfil/{id}/permissao`, `GET/PATCH /sistema/perfil/{id}/horario`, `PATCH /sistema/perfil/{id}/processo`, `PATCH /sistema/perfil/{id}/sessao`, `PATCH /sistema/perfil/{id}/{flag}` | Cadastro de perfil, flags de fonte, permissoes, horario, processo e sessao | Implementado |
| Sistema tecnico | `/sistema/mail/*`, `/sistema/db/info`, `/sistema/apicache/*`, `/sistema/modelcache/*`, `/sistema/limitesacesso/*` | Operacao tecnica, cache, email e limites | Implementado |
| Logs e Auditoria | `/logs/*` | Logs, rankings, auditoria PIX, alertas e estatisticas | Implementado |

## Regras De Seguranca

- Usuario comum so pode alterar/consultar o proprio `{id}` em Meu Perfil e Meu
  Historico.
- Admin pode operar outros usuarios e perfis.
- Updates de usuario aceitam somente campos allowlisted de preferencia:
  `temaEscuro`, `tema_escuro` e `espa`.
- Updates de perfil aceitam somente flags conhecidas; payload livre nao e
  repassado ao banco.
- Senhas sao gravadas usando o mesmo hash local do login Go.

## Observacoes

- `temaEscuro` e `espa` sao gravados em `USUARIO` e retornam no token/userData no
  proximo login.
- `PATCH /sistema/perfil/{id}/permissao` aceita lista de permissoes com IDs ou o
  formato agrupado usado pelo front: `{ "secao": ["item"] }`.
- Faccoes ainda usa middleware `admin` para mutacoes ate existir no Go um
  middleware equivalente ao perfil `inteligencia` do Node.
