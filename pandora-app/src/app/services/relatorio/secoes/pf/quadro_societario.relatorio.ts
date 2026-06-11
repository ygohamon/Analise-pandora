import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoQuadroSocietarioService {

    constructor(
      private utils: UtilsService,
      private relatorio: RelatorioUtilsService
    ) { }

    private criaTabelaCNEResumidaQuadroSocietarioPF(registros) {
        const headerTabela = [['Razão Social', 'CNPJ', 'Origem', 'Ação', 'Data', 'Vínculo', 'Valor']];
        const corpoTabela = registros.map(r => {
            return [
                (r.EMPRESA)          ? r.EMPRESA : '',
                (r.CNPJ_EMPRESA)     ? this.utils.formataDado(r.CNPJ_EMPRESA, '##.###.###/####-##') : '',
                (r.ORIGEM_INFORMACAO)? r.ORIGEM_INFORMACAO : '',
                (r.ACAO)             ? r.ACAO + ' - ' + this.utils.formataData(r.DATA_ACAO) : '',
                (r.DATA_ACAO)        ? this.utils.formataData(r.DATA_ACAO) : '',
                (r.VINCULO)          ? r.VINCULO : '',
                (r.VL_PARTICIPACAO)  ? r.MOEDA + ' ' + r.VL_PARTICIPACAO : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    private criaTabelaRFResumidaQuadroSocietarioPF(registros) {
        const headerTabela = [['Razão Social', 'CNPJ', 'Início', 'Entrada', 'Saída', 'Participação', 'Vínculo']];
        const corpoTabela = registros.map(r => {
            return [
                (r.razaoSocial)          ? r.razaoSocial : '',
                (r.cnpj)                 ? this.utils.formataDado(r.cnpj, '##.###.###/####-##') : '',
                (r.dataInicioAtividade)  ? this.utils.formataData(r.dataInicioAtividade) : '',
                (r.dataEntradaSociedade) ? this.utils.formataData(r.dataEntradaSociedade) : '',
                (r.dataSaidaSociedade)   ? this.utils.formataData(r.dataSaidaSociedade) : '',
                (r.percCapital)          ? r.percCapital + ' %' : '',
                (r.vinculo)              ? r.vinculo : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoQuadroSocietarioPF(registros) {
        if (!registros || registros.length === 0) { return null; }

        const cne = registros.filter(dado => dado.fonte === 'CNE');
        const rf = registros.filter(dado => dado.fonte.startsWith('RF') || dado.fonte.startsWith('CTX'));

        let ret = [];
        if (cne.length) {
            ret = ret.concat({ text: 'Quadro Societário - Fonte: CNE', style: 'secao' });
            ret = ret.concat({
                style: 'tabela',
                table: {
                    widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaCNEResumidaQuadroSocietarioPF(cne)
                },
                layout: this.relatorio.layout
            });
        }

        if (rf.length) {
            ret = ret.concat({ text: 'Quadro Societário - Fonte: RF', style: 'secao' });
            ret = ret.concat({
                style: 'tabela',
                table: {
                    widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaRFResumidaQuadroSocietarioPF(rf)
                },
                layout: this.relatorio.layout
            });
        }

        return ret;
    }
}
