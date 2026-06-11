import { Injectable, Inject, forwardRef } from '@angular/core';

import {uniq} from 'lodash-es';

import { RelatorioUtilsService } from './../relatorio.utils';
import { UtilsService } from './../../common/utils.service';

@Injectable()
export class RelatorioSecaoAeronaveService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  private criaTabelaAeronaveProprietario (dados) {
    const headerTabela = [['Operador', 'CPF', 'Marca', 'Matrícula', 'Modelo', 'Fabricante', 'Ano Fabricação', 'Dt. Inspeção', 'Fonte']];
    const corpoTabela = dados.map(d => {
      return [
        (d.operador)   ? d.operador : '',
        (d.cpf_cnpj2)  ? this.utils.formataDado(d.cpf_cnpj2, '###.###.###-##') : '',
        (d.marca)      ? d.marca : '',
        (d.matricula)  ? d.matricula : '',
        (d.modelo)     ? d.modelo : '',
        (d.fabricante) ? d.fabricante : '',
        (d.ano_fab)    ? d.ano_fab : '',
        (d.dt_iam)     ? d.dt_iam : '',
        (d.fonte)      ? d.fonte : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  private criaTabelaAeronaveOperador (dados) {
    const headerTabela = [['Proprietário', 'CPF/CNPJ', 'Marca', 'Matrícula', 'Modelo', 'Fabricante', 'Ano Fabricação', 'Dt. Inspeção', 'Fonte']];
    const corpoTabela = dados.map(d => {
      return [
        (d.proprietario) ? d.proprietario : '',
        (d.cpf_cnpj)     ? ((d.cpf_cnpj.length === 11) ?
          this.utils.formataDado(d.cpf_cnpj, '###.###.###-##') :
          this.utils.formataDado(d.cpf_cnpj, '##.###.###/####-##') ) : '',
        (d.marca)        ? d.marca : '',
        (d.matricula)    ? d.matricula : '',
        (d.modelo)       ? d.modelo : '',
        (d.fabricante)   ? d.fabricante : '',
        (d.ano_fab)      ? d.ano_fab : '',
        (d.dt_iam)       ? d.dt_iam : '',
        (d.fonte)        ? d.fonte : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoAeronaves(registros) {
    if (!registros || registros.length === 0) { return null; }

    let ret = [];

    const proprietario = registros.filter(d => d.tipo === 'proprietario');
    if (proprietario.length) {
      ret = ret.concat({ text: 'Aeronaves - Proprietário', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
          body: this.criaTabelaAeronaveProprietario(proprietario)
        },
        layout: this.relatorio.layout
      });
    }

    const operador = registros.filter(d => d.tipo === 'operador');
    if (operador.length) {
      ret = ret.concat({ text: 'Aeronaves - Operador', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
          body: this.criaTabelaAeronaveOperador(operador)
        },
        layout: this.relatorio.layout
      });
    }

    return ret;
  }
}
