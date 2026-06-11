import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from './../../../relatorio/relatorio.utils';

@Injectable()
export class RelatorioSecaoEmpregadosService {

    constructor(
      private utils: UtilsService,
      private relatorio: RelatorioUtilsService
    ) { }

    criaSecaoEmpregados(dados) {
        if (!dados || dados.length === 0) { return null; }

        const dadosRAIS = dados.filter(dado => dado.fonte === 'RAIS');
        let secaoRAIS = [];

        if (dadosRAIS.length) {
            secaoRAIS = [{ text: 'Empregados - Fonte: RAIS', style: 'secao' },
            {
                style: 'tabela',
                table: {
                    widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaEmpregadosRAIS(dadosRAIS)
                },
                layout: this.relatorio.layout
            }];
        }

        return secaoRAIS;
    }

    criaTabelaEmpregadosRAIS(empregados){
        const headerTabela = [['Ano', 'Vínculos', 'Folha Anual', 'Média Meses Trabalhados', 'Média Salarial', 'Menor Média Salarial', 'Maior Média Salarial']];
        const corpoTabela = empregados.map(dado => {
            return [
                (dado.ano) ? dado.ano : '',
                (dado.qtdVinculos) ? dado.qtdVinculos : '',
                (dado.folhaAnual) ? `R$ ${this.utils.converteEmDinheiro(dado.folhaAnual)}` : '',
                (dado.mediaMesesTrabalhados) ? dado.mediaMesesTrabalhados : 0,
                (dado.mediaSalarial) ? `R$ ${this.utils.converteEmDinheiro(dado.mediaSalarial)}` : '',
                (dado.menorMediaSalarial) ? `R$ ${this.utils.converteEmDinheiro(dado.menorMediaSalarial)}` : '',
                (dado.maiorMediaSalarial) ? `R$ ${this.utils.converteEmDinheiro(dado.maiorMediaSalarial)}` : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }
}
