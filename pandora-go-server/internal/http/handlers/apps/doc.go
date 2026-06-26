// Package apps registra as rotas HTTP da secao dashboard/apps.
//
// Handlers apenas extraem parametros HTTP, chamam o AppsUseCase e escrevem o
// envelope padrao; SQL e regras de fonte ficam fora desta camada.
package apps
