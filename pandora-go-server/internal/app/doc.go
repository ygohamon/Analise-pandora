// Package app monta o servidor HTTP e conecta infraestrutura, repositories,
// usecases e handlers.
//
// Este pacote e o composition root da aplicacao. Ele pode conhecer as pecas
// concretas, mas nao deve concentrar regra de negocio de consultas ou de
// administracao.
package app
