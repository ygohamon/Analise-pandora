import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoEmpregadoresService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaTabelaResumidaEmpregadoresRAIS(registros) {
        const headerTabela = [['Ano', 'CNPJ', 'Razão Social', 'Data Admissão', 'Salário Contrato', 'Carga Horária', 'Meses']];
        const corpoTabela = registros.map(r => {
            return [
                (r.ano)                ? r.ano : '',
                (r.cnpj)               ? this.utils.formataDado(r.cnpj, '##.###.###/####-##') : '',
                (r.razaoSocial)        ? r.razaoSocial : '',
                (r.dtAdmissao)         ? this.utils.formataData(r.dtAdmissao) : '',
                (r.salarioContratado)  ? 'R$ ' + this.utils.converteEmDinheiro(r.salarioContratado) : '',
                (r.cargaHoraria)       ? r.cargaHoraria : '',
                (r.mesesTrabalhados)   ? r.mesesTrabalhados : '0',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoEmpregadores(registros) {
        if (!registros || registros.length === 0) { return null; }

        const rais = registros.filter(dado => dado.fonte === 'RAIS');
        let ret = [];

        if (rais.length) {
            ret = ret.concat({ text: 'Empregadores - Fonte: RAIS', style: 'secao' });
            ret = ret.concat({
                style: 'tabela',
                table: {
                    widths: ['auto', 'auto', '*', 'auto',  'auto', 'auto', 'auto'],
                    body: this.criaTabelaResumidaEmpregadoresRAIS(rais)
                },
                layout: this.relatorio.layout
            });
        }

        return ret;
    }
}
