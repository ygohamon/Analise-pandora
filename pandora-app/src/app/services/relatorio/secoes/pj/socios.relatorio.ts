import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoSociosService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaSecaoSociosPF (socios) {
        if (!socios || socios.length === 0) { return null; }

        return [{ text: 'Sócios - Pessoa Física', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto', 'auto'],
                body: this.criaTabelaSocioPF(socios)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaSocioPF (socios) {
        const headerTabela = [['Nome', 'CPF', 'Percentual Capital']];
        const corpoTabela = socios.map(socio => {
            return [
                (socio.nome)        ? socio.nome : '',
                (socio.cpf)         ? this.utils.formataDado(socio.cpf, '###.###.###-##') : '',
                (socio.percCapital) ? socio.percCapital + ' %' : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoSociosPJ (socios) {
        if (!socios || socios.length === 0) { return null; }

        return [{ text: 'Sócios - Pessoa Jurídica', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto', 'auto'],
                body: this.criaTabelaSocioPJ(socios)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaSocioPJ = function (socios) {
        const headerTabela = [['Razão Social', 'CNPJ', 'Percentual Capital']];
        const corpoTabela = socios.map(socio => {
            return [
                (socio.razaoSocial) ? socio.razaoSocial : '',
                (socio.cnpj)        ? this.utils.formataDado(socio.cnpj, '##.###.###/####-##') : '',
                (socio.percCapital) ? socio.percCapital + ' %' : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoSociosEstrangeiro = function (socios) {
        if (!socios || socios.length === 0) { return null; }

        return [{ text: 'Sócios Estrangeiros - Pessoa Jurídica', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto', 'auto'],
                body: this.criaTabelaSocioEstrangeiro(socios)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaSocioEstrangeiro = function (socios) {
        const headerTabela = [['Nome', 'País', 'Percentual Capital']];
        const corpoTabela = socios.map(socio => {
            return [
                (socio.nome)        ? socio.nome : '',
                (socio.nomePais)    ? socio.nomePais : '',
                (socio.percCapital) ? socio.percCapital + ' %' : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }
}
