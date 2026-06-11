import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from '../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';


@Injectable()
export class RelatorioSecaoInformacoesVirtuaisService {

  constructor(private utils: UtilsService,
              private relatorio: RelatorioUtilsService) { }

  private criaTabelaEmail (dados) {
    const headerTabela = [['Email', 'Fonte']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.email) ? dado.email : '',
        (dado.fonte) ? dado.fonte : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoInformacoesVirtuais (dados) {
    if (!dados || dados.length === 0) { return null; }

    const email  = dados.filter(dado => dado.tipo === 'email');

    let ret = [];
    if (email.length) {
      ret = ret.concat({ text: 'Emails', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['*', 'auto'],
          body: this.criaTabelaEmail(email)
        },
        layout: this.relatorio.layout
      });
    }

    return ret;
  }
}
