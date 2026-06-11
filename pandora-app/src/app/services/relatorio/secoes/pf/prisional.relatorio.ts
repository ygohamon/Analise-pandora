import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../../relatorio.utils';
import { UtilsService } from './../../../common/utils.service';

@Injectable()
export class RelatorioSecaoPrisionalService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaSecaoPrisional(registros) {
        if (!registros || registros.length === 0) { return null; }

        const ordemAtributosSispesquisaPrisional = [
            'cpf', 'nome', 'vulgo',
            'dataEntrada', 'prontuario', 'status', 'fonte'
        ];

        const ordemAtributosSDS = [
            'cpf', 'nome', 'vulgo', 'comparsas', 'faccao',
            'principalAtividade', 'cabelo', 'olhos', 'cutis',
            'barba', 'cicatriz', 'tatuagem', 'infoAdicional',
            'infoAdicional2', 'fonte'
        ];

        const ordemAtributosSISDEPEN = [
            'cnc', 'cadeia', 'cadeiaUF', 'cadeiaAmbito',
            'situacao', 'tipoRecolhimento', 'regimePrisional',
            'cpf', 'nome', 'nomeApresentacao', 'nomeSocial', 'vulgo',
            'sexo', 'nacionalidade', 'naturalidade', 'naturalidadeUF',
            'escolaridade', 'dataInformacao', 'fonte'
        ];

        const registrosSispesquisaPrisional = registros.filter(r => r.fonte === 'PRS');
        const registrosSDS                  = registros.filter(r => r.fonte === 'SDS');
        const registrosSISDEPEN             = registros.filter(r => r.fonte === 'DEP');

        return [
            { text: 'Registros Encontrados de Dados Prisionais', alignment: 'center', bold: true },
            (registrosSispesquisaPrisional.length) ?
              this.relatorio.criaPainel(registrosSispesquisaPrisional, ordemAtributosSispesquisaPrisional) :
              null,
            (registrosSDS.length) ? this.relatorio.criaPainel(registrosSDS, ordemAtributosSDS) : null,
            (registrosSISDEPEN.length) ? this.relatorio.criaPainel(registrosSISDEPEN, ordemAtributosSISDEPEN) : null,
        ].filter(r => r !== null);
    }

    criaSecaoResumidaPrisional(registros) {
        if (!registros || registros.length === 0) { return null; }

        const registrosSispesquisaPrisional = registros.filter(r => r.fonte === 'PRS');
        const registrosSDS                  = registros.filter(r => r.fonte === 'SDS');
        const registrosSISDEPEN             = registros.filter(r => r.fonte === 'DEP');

        return [{ text: 'Dados prisionais', style: 'secao' },
            (registrosSispesquisaPrisional.length) ?
            {
                style: 'tabela',
                table: {
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaResumidaSispesquisaPrisional(registros)
                },
                layout: this.relatorio.layout
            } : null,
            (registrosSDS.length) ?
            {
                style: 'tabela',
                table: {
                    widths: ['*', 'auto', 'auto'],
                    body: this.criaTabelaResumidaSDS(registros)
                },
                layout: this.relatorio.layout
            } : null,
            (registrosSISDEPEN.length) ?
            {
                style: 'tabela',
                table: {
                    widths: ['auto', '*', 'auto', 'auto', 'auto'],
                    body: this.criaTabelaResumidaSISDEPEN(registros)
                },
                layout: this.relatorio.layout
            } : null,
        ].filter(r => r !== null);
    }

    criaTabelaResumidaSispesquisaPrisional(registros) {
        const headerTabela = [['Vulgo', 'Data de Entrada', 'Prontuário', 'Status']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.vulgo)        ? registro.vulgo : '',
                (registro.dataEntrada)  ? this.utils.formataData(registro.dataEntrada) : '',
                (registro.prontuario)   ? registro.prontuario : '',
                (registro.status)       ? registro.status : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaTabelaResumidaSDS(registros) {
        const headerTabela = [['Atividade', 'Vulgo', 'Facção']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.principalAtividade)   ? registro.principalAtividade : '',
                (registro.vulgo)                ? registro.vulgo : '',
                (registro.faccao)               ? registro.faccao : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaTabelaResumidaSISDEPEN(registros) {
        const headerTabela = [['CNC', 'Unidade', 'Situação', 'Recolhimento', 'Regime']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.cnc)              ? this.utils.formataDado(registro.cnc, '############-##') : '',
                (registro.cadeia)           ? registro.cadeia : '',
                (registro.situacao)         ? registro.situacao : '',
                (registro.tipoRecolhimento) ? registro.tipoRecolhimento : '',
                (registro.regimePrisional)  ? registro.regimePrisional : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }
}
