import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoServidorService {

    constructor(
      private utils: UtilsService,
      private relatorio: RelatorioUtilsService
    ) { }

    criaTabelaServidorMunicipal(registros) {
        const headerTabela = [['Ano Base', 'Matrícula', 'Cargo', 'Vínculo', 'Órgão', 'V. Bruto', 'Meses', 'Média']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.dtAno)     ? registro.dtAno : '',
                (registro.matricula) ? registro.matricula?.replace(/^0+/, '') : '',
                (registro.cargo)     ? registro.cargo : '',
                (registro.vinculo)   ? registro.vinculo : '',
                (registro.orgao)     ? registro.orgao : '',
                (registro.vlBruto)   ?  `R$ ${this.utils.converteEmDinheiro(registro.vlBruto)}` : '',
                (registro.meses)     ? registro.meses : '',
                (registro.media)     ? `R$ ${this.utils.converteEmDinheiro(registro.media)}` : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoServidorMunicipal(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [{ text: 'Servidor Municipal', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                body: this.criaTabelaServidorMunicipal(registros)
            },
            layout: this.relatorio.layout
        }];
    }


    criaTabelaServidorEstadual(registros) {
      const headerTabela = [['Ano Base', 'Matrícula', 'Cargo', 'Vínculo', 'Órgão', 'V. Bruto', 'Meses', 'Média']];
      const corpoTabela = registros.map(registro => {
          return [
              (registro.dtAno)     ? registro.dtAno : '',
              (registro.matricula) ? registro.matricula?.replace(/^0+/, '') : '',
              (registro.cargo)     ? registro.cargo : '',
              (registro.vinculo)   ? registro.vinculo : '',
              (registro.orgao)     ? registro.orgao : '',
              (registro.vlBruto)   ?  `R$ ${this.utils.converteEmDinheiro(registro.vlBruto)}` : '',
              (registro.meses)     ? registro.meses : '',
              (registro.media)     ? `R$ ${this.utils.converteEmDinheiro(registro.media)}` : '',
          ];
      });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoServidorEstadual(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [{ text: 'Servidor Estadual', style: 'secao' },
        {
            style: 'tabela',
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                body: this.criaTabelaServidorEstadual(registros)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaServidorFederal(registros) {
        const headerTabela = [['Descrição', 'Atividade', 'Unidade', 'Lotação', 'Data Ingresso Cargo',
                              'Data Ingresso Orgão', 'UF Exercício']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.descCargo)        ? registro.descCargo : '',
                (registro.atividade)        ? registro.atividade : '',
                (registro.unidOrgLotacao)   ? registro.unidOrgLotacao : '',
                (registro.orgLotacao)       ? registro.orgLotacao : '',
                (registro.dtIngressoCargo)  ? registro.dtIngressoCargo : '',
                (registro.dtIngressoOrgao)  ? registro.dtIngressoOrgao : '',
                (registro.ufExercicio)      ? registro.ufExercicio : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoServidorFederal(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [{ text: 'Servidor Federal', style: 'secao' },
        {
            style: 'tabela',
            table: {
                body: this.criaTabelaServidorFederal(registros)
            },
            layout: this.relatorio.layout
        }];
    }
}
