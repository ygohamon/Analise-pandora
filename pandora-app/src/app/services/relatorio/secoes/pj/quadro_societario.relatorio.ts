import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoPJQuadroSocietarioService {

    constructor(
      private utils: UtilsService,
      private relatorio: RelatorioUtilsService
    ) { }

    private criaTabelaResumidaQuadroSocietarioPFCNE(registros) {
        const headerTabela = [['Sócio', 'CPF', 'Origem', 'Ação', 'Data', 'Vínculo', 'Participação']];
        const corpoTabela = registros.map(r => {
            return [
                (r.SOCIO) ? r.SOCIO : '',
                (r.DOCUMENTO_SOCIO) ? { text: this.utils.formataDado(r.DOCUMENTO_SOCIO, '###.###.###-##') } : '',
                (r.ORIGEM_INFORMACAO) ? r.ORIGEM_INFORMACAO : '',
                (r.ACAO)             ? r.ACAO + ' - ' + this.utils.formataData(r.DATA_ACAO) : '',
                (r.DATA_ACAO) ? this.utils.formataData(r.DATA_ACAO) : '',
                (r.VINCULO)          ? r.VINCULO : '',
                (r.VL_PARTICIPACAO)  ? r.MOEDA + ' ' + r.VL_PARTICIPACAO : '',
                //(r.CARGO_DIRECAO)    ? r.CARGO_DIRECAO : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    private criaTabelaResumidaQuadroSocietarioPFRF(registros) {
        const headerTabela = [['Sócio', 'CPF', 'Entrada', 'Saída', 'Participação', 'Vínculo', 'Fonte']];
        const corpoTabela = registros.map(r => {
            return [
                (r.nome)                 ? r.nome : '',
                (r.cpf)                  ? { text: this.utils.formataDado(r.cpf, '###.###.###-##') } : '',
                (r.dataEntradaSociedade) ? this.utils.formataData(r.dataEntradaSociedade) : '',
                (r.dataSaidaSociedade)   ? this.utils.formataData(r.dataSaidaSociedade) : '',
                (r.percCapital)          ? r.percCapital + ' %' : '',
                (r.vinculo)              ? r.vinculo : '',
                (r.fonte)                ? r.fonte : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    private criaTabelaResumidaQuadroSocietarioPJCNE(registros) {
        const headerTabela = [['Sócio', 'CNPJ', 'Origem', 'Ação', 'Data', 'Vínculo', 'Participação']];
        const corpoTabela = registros.map(r => {
            return [
                (r.SOCIO)               ? r.SOCIO : '',
                (r.DOCUMENTO_SOCIO)     ? { text: this.utils.formataDado(r.DOCUMENTO_SOCIO, '##.###.###/####-##') } : '',
                (r.ORIGEM_INFORMACAO)   ? r.ORIGEM_INFORMACAO : '',
                (r.ACAO)                ? r.ACAO + ' - ' + this.utils.formataData(r.DATA_ACAO) : '',
                (r.DATA_ACAO)           ? this.utils.formataData(r.DATA_ACAO) : '',
                (r.VINCULO)             ? r.VINCULO : '',
                (r.VL_PARTICIPACAO)     ? r.MOEDA + ' ' + r.VL_PARTICIPACAO : '',
                //(r.CARGO_DIRECAO)    ? r.CARGO_DIRECAO : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    private criaTabelaResumidaQuadroSocietarioPJRF(registros) {
        const headerTabela = [['Sócio', 'CNPJ', 'Entrada', 'Saída', 'Participação', 'Vínculo', 'Fonte']];
        const corpoTabela = registros.map(r => {
            return [
                (r.razaoSocial)         ? r.razaoSocial : '',
                (r.cnpj)                ? { text: this.utils.formataDado(r.cnpj, '##.###.###/####-##') } : '',
                (r.dataEntradaSociedade)? this.utils.formataData(r.dataEntradaSociedade) : '',
                (r.dataSaidaSociedade)  ? this.utils.formataData(r.dataSaidaSociedade) : '',
                (r.percCapital)         ? r.percCapital + ' %' : '',
                (r.vinculo)             ? r.vinculo : '',
                (r.fonte)               ? r.fonte : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoPJQuadroSocietario(registros) {
        if (!registros || registros.length === 0) { return null; }

        const dadosPF = registros.filter(dado => dado.tipo === 'pj-pf');
        const dadosPJ = registros.filter(dado => dado.tipo === 'pj-pj');

        let ret = [];

        if (dadosPF.length) {
            let dataRF  = dadosPF.filter(dado => dado.fonte.startsWith('RF') || dado.fonte.startsWith('CTX'));
            let dataCNE = dadosPF.filter(dado => dado.fonte === 'CNE');

            if (dataRF.length) {
                ret = ret.concat({ text: 'Histórico de PF do Quadro Societário - Fonte: RF', style: 'secao' });
                ret = ret.concat({
                    style: 'tabela',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: this.criaTabelaResumidaQuadroSocietarioPFRF(dataRF)
                    },
                    layout: this.relatorio.layout
                });
            }

            if (dataCNE.length) {
                ret = ret.concat({ text: 'Histórico de PF do Quadro Societário - Fonte: CNE', style: 'secao' });
                ret = ret.concat({
                    style: 'tabela',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: this.criaTabelaResumidaQuadroSocietarioPFCNE(dataCNE)
                    },
                    layout: this.relatorio.layout
                });
            }

        }

        if (dadosPJ.length) {
            let dataRF  = dadosPF.filter(dado => dado.fonte.startsWith('RF') || dado.fonte.startsWith('CTX'));
            let dataCNE = dadosPF.filter(dado => dado.fonte === 'CNE');

            if (dataRF.length) {
              ret = ret.concat({ text: 'Histórico de PJ do Quadro Societário - Fonte: RF', style: 'secao' });
              ret = ret.concat({
                  style: 'tabela',
                  table: {
                      widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                      body: this.criaTabelaResumidaQuadroSocietarioPJRF(dataRF)
                  },
                  layout: this.relatorio.layout
              });
            }

            if (dataCNE.length) {
              ret = ret.concat({ text: 'Histórico de PJ do Quadro Societário - Fonte: CNE', style: 'secao' });
              ret = ret.concat({
                  style: 'tabela',
                  table: {
                      widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                      body: this.criaTabelaResumidaQuadroSocietarioPJCNE(dataCNE)
                  },
                  layout: this.relatorio.layout
              });
            }

        }

        return ret;
    }
}
