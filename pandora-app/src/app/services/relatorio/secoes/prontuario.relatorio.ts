import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../relatorio.utils';
import { UtilsService } from './../../common/utils.service';

@Injectable()
export class RelatorioSecaoProntuarioService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaSecaoProntuarios(registros) {
        if (!registros || registros.length === 0) { return null; }

        const ordemAtributos = [
            'cpf', 'nome', 'vulgo',
            'sexo', 'dataNascimento', 'rg',
            'naturalidade', 'nacionalidade',
            'nomePai', 'nomeMae',
            'profissao', 'numeroMandado',
            'dataMandado', 'orgao', 'situacao'
        ];

        return [
            { text: 'Registros Encontrados de Mandados', style: 'secao' },
            this.relatorio.criaPainel(registros, ordemAtributos)
        ];
    }

    criaSecaoResumidaProntuarios(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [{ text: 'Mandados', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                body: this.criaTabelaResumidaProntuarios(registros)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaResumidaProntuarios(registros) {
        const headerTabela = [['Nome', 'Número do Mandado', 'Órgão', 'Data', 'Situação']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.nome)             ? registro.nome : '',
                (registro.numeroMandado)    ? '0'.repeat((30 - registro.numeroMandado.length)) + (registro.numeroMandado) : '',
                (registro.orgao)            ? registro.orgao : '',
                (registro.dataMandado)      ? this.utils.formataData(registro.dataMandado) : '',
                (registro.situacao)         ? registro.situacao : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }
}