import { Injectable } from '@angular/core';

import { AuthService } from './../../auth/auth.service';
import { UtilsService } from './../../common/utils.service';

import { logo_mp, RelatorioUtilsService } from './../relatorio.utils';
import {sortBy} from 'lodash-es';

@Injectable()
export class RelatorioCacaFantasmasGeralService {

  valorProtocolo;

  constructor(private auth: AuthService,
              private rutils: RelatorioUtilsService,
              private utils: UtilsService) {}

  private criaCabecalho(protocolo, grupo = null) {
    return [
      { image: logo_mp, alignment: 'center', width: 100 },
      { text: 'MINISTÉRIO PÚBLICO DA PARAÍBA', style: 'header' },
      { text: 'PROCURADORIA-GERAL DE JUSTIÇA', style: 'header' },
      { text: 'NÚCLEO DE GESTÃO DO CONHECIMENTO E SEGURANÇA INSTITUCIONAL', style: 'subheader' },

        { text: '\n\nRelatório do Caça Fantasmas\n', style: 'secao' },
        { text: 'Análise Geral', style: 'secao' },
        {
            style: 'painel',
            table: {
                widths: [100, '*'],
                body: this.rutils.formataCabecalhoTabela([
                    ['Solicitante:', (grupo) ? this.auth.getGrupo() : this.auth.getNome()],
                    ['Data:', this.utils.formataData(new Date(), 'DD [de] MMMM [de] YYYY')],
                    (this.utils.getProcesso()) ? ['Processo:', this.utils.getProcesso()] : null,
                    ['Protocolo:', protocolo],
                ].filter(linha => linha !== null))
            },
            layout: this.rutils.layout
        }];
  }

  private criaCorpo(dados) {
      if (!dados || dados.length === 0) { return null; }

      return [
      {
          style: 'tabela',
          table: {
              widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: this.criaTabelaTipologias(dados)
          },
          layout: this.rutils.layout
      }];
  }

  private criaTabelaTipologias(dados) {
      const headerTabela = [['Nome', 'CPF', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'Total']];
      const ordenado = sortBy(dados, ['totalTipologias']).reverse();
      const corpoTabela = ordenado.map(r => {
          return [
              (r.nome) ? r.nome : '',
              (r.cpf) ? this.utils.formataDado(r.cpf, '###.###.###-##') : '',
              (r.t1) ? r.t1 : '',
              (r.t2) ? r.t2 : '',
              (r.t3) ? r.t3 : '',
              (r.t4) ? r.t4 : '',
              (r.t5) ? r.t5 : '',
              (r.t6) ? r.t6 : '',
              (r.t7) ? r.t7 : '',
              (r.t8) ? r.t8 : '',
              (r.t9) ? r.t9 : '',
              (r.totalTipologias) ? r.totalTipologias : '',
          ];
      });

      return this.rutils.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  relatorioAnaliseGeral(dados, grupo = null, filename, url) {
    this.valorProtocolo = btoa(`user:${this.auth.getId()}data:${(new Date()).toISOString()}`);

    const doc = {
        content: [
            this.criaCabecalho(this.valorProtocolo, grupo),
            this.criaCorpo(dados),
            this.rutils.criaRodape(url)
        ],
        styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }
}
