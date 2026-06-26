// Package usecases contem validacao, normalizacao e orquestracao de fluxo.
//
// Handlers extraem dados HTTP e chamam usecases. Usecases normalizam/validam
// parametros, aplicam regras de perfil/permissao e delegam consultas para
// repositories especificos.
package usecases
