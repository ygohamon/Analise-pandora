import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from '../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoFiliacaoService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaTabela (dados) {
    const headerTabela = [['Partido', 'Município', 'Data Filiação', 'Data Desfiliação', 'Data Cancelamento', 'Situação']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.siglaPartido)     ? dado.siglaPartido : '',
        (dado.municipio)        ? dado.municipio : '',
        (dado.dataFiliacao)     ? this.utils.formataData(dado.dataFiliacao) : '',
        (dado.dataDesfiliacao)  ? this.utils.formataData(dado.dataDesfiliacao) : '',
        (dado.dataCancelamento) ? this.utils.formataData(dado.dataCancelamento) : '',
        (dado.situacaoRegistro) ? dado.situacaoRegistro : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoFiliacao (dados) {
    if (!dados || dados.length === 0) { return null; }

    return [{ text: 'Filiação Partidária', style: 'secao' },
    {
      style: 'tabela',
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: this.criaTabela(dados)
      },
      layout: this.relatorio.layout
    }];
  }
}
