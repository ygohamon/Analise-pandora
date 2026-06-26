// Package pessoa implementa repositories SQL e fontes externas do dominio
// Pessoa/CPF.
//
// Arquivos *_repository contem consultas especificas por dominio ou fonte.
// Arquivos *_methods expoem metodos publicos chamados por ports/usecases. O
// integrado de pessoa deve orquestrar no usecase e reaproveitar essas consultas.
package pessoa
