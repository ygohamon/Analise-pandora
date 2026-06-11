import { Injectable, Inject, forwardRef } from '@angular/core';

import { sortBy } from 'lodash-es';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';

@Injectable()
export class RelatorioSecaoEmpenhosService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaTabelaEmpenho(registros) {
    registros = sortBy(registros, d => d.dtAno).reverse()

    const headerTabela = [['Ano Base', 'Unidade Gestora', 'Valor Empenhado', ' Valor Pago', 'Quantidade']];
    const corpoTabela = registros.map(registro => {
      return [
        (registro.dtAno)          ? registro.dtAno : '',
        (registro.unidadeGestora) ? registro.unidadeGestora : '',
        (registro.vEmpenho)       ? `R$ ${this.utils.converteEmDinheiro(registro.vEmpenho)}` : '',
        (registro.vPagto)         ? `R$ ${this.utils.converteEmDinheiro(registro.vPagto)}` : '',
        (registro.qtd)            ? registro.qtd : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoEmpenhoMunicipal(registros) {
    if (!registros || registros.length === 0) { return null; }

    return [{ text: 'Empenhos - Municipal', style: 'secao' },
    {
      style: 'tabela',
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        body: this.criaTabelaEmpenho(registros)
      },
      layout: this.relatorio.layout
    }];
  }

  criaSecaoEmpenhoEstadual(registros) {
    if (!registros || registros.length === 0) { return null; }

    return [{ text: 'Empenhos - Estadual', style: 'secao' },
    {
      style: 'tabela',
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        body: this.criaTabelaEmpenho(registros)
      },
      layout: this.relatorio.layout
    }];
  }
}
