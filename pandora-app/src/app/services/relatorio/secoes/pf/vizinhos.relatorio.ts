import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from '../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoVizinhosService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  private criaTabela (vizinhos) {
    const headerTabela = [['Nome', 'CPF', 'Data Nascimento', 'Logradouro', 'Número', 'Complemento']];
    const corpoTabela = vizinhos.map(vizinho => {
      return [
        (vizinho.nome)           ? vizinho.nome : '',
        (vizinho.cpf)            ? this.utils.formataDado(vizinho.cpf, '###.###.###-##') : '',
        (vizinho.dataNascimento) ? this.utils.formataData(vizinho.dataNascimento) : '',
        (vizinho.logradouro)     ? vizinho.logradouro : '',
        (vizinho.numero)         ? vizinho.numero : '',
        (vizinho.complemento)    ? vizinho.complemento : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoVizinhos (vizinhos) {
    if (!vizinhos || vizinhos.length === 0) { return null; }

    return [{ text: 'Vizinhos', style: 'secao' },
    {
      style: 'tabela',
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: this.criaTabela(vizinhos)
      },
      layout: this.relatorio.layout
    }];
  }
}
