import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../../relatorio.utils';
import { UtilsService } from './../../../common/utils.service';

@Injectable()
export class RelatorioSecaoEmpresasPessoaService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  private criaTabelaSocio(registros) {
      const headerTabela = [['Razão Social', 'CNPJ', 'Início Atividade', 'Percentual Participação', 'Responsável', 'CPF']];
      const corpoTabela = registros.map(registro => {
          return [
              (registro.razaoSocial)          ? registro.razaoSocial : '',
              (registro.cnpj)                 ? this.utils.formataDado(registro.cnpj, '##.###.###/####-##') : '',
              (registro.dataInicioAtividade)  ? this.utils.formataData(registro.dataInicioAtividade) : '',
              (registro.socio_percCapital)    ? registro.socio_percCapital + ' %' : '',
              (registro.nomeResponsavel)      ? registro.nomeResponsavel : '',
              (registro.cpfResponsavel)       ? this.utils.formataDado(registro.cpfResponsavel, '###.###.###-##') : '',
          ];
      });

      return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  private criaTabelaResponsável(registros) {
      const headerTabela = [['Razão Social', 'CNPJ', 'Nome Fantasia', 'Data Início Atividade', 'Fonte']];
      const corpoTabela = registros.map(registro => {
          return [
              (registro.razaoSocial)          ? registro.razaoSocial : '',
              (registro.cnpj)                 ? this.utils.formataDado(registro.cnpj, '##.###.###/####-##') : '',
              (registro.nomeFantasia)         ? registro.nomeFantasia : '',
              (registro.dataInicioAtividade)  ? this.utils.formataData(registro.dataInicioAtividade) : '',
              (registro.fonte)                ? registro.fonte : '',
          ];
      });

      return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }


  criaSecaoEmpresasPessoa(registros) {
      if (!registros || registros.length === 0) { return null; }

      const responsavel = registros.filter(dado => dado.vinculo === 'responsavel');
      const socio = registros.filter(dado => dado.vinculo === 'socio');

      let ret = [];
        if (socio.length) {
            ret = ret.concat({ text: 'Empresas que é sócio - Fonte: RF', style: 'secao' });
            ret = ret.concat({
                style: 'tabela',
                table: {
                    widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaSocio(socio)
                },
                layout: this.relatorio.layout
            });
        }

        if (responsavel.length) {
            ret = ret.concat({ text: 'Empresas que é responsável - Fonte: RF', style: 'secao' });
            ret = ret.concat({
                style: 'tabela',
                table: {
                    widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaResponsável(responsavel)
                },
                layout: this.relatorio.layout
            });
        }

      return ret;
  }
}
