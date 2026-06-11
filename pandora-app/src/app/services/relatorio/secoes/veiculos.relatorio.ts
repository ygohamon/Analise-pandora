import { Injectable, Inject, forwardRef } from '@angular/core';

import {uniq} from 'lodash-es';

import { RelatorioUtilsService } from './../relatorio.utils';
import { UtilsService } from './../../common/utils.service';

@Injectable()
export class RelatorioSecaoVeiculosService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaSecaoVeiculos(registros) {
        if (!registros || registros.length === 0) { return null; }
        registros = registros.filter(d => d.tipoDado === 'completo');

        const ordemAtributos = [
            'placa', 'tipoChassi', 'chassi', 'anoFab', 'anoMod',
            'renavam', 'tipo', 'cor', 'marcaModelo', 'especie', 'combustivel',
            'procedencia', 'combustivel', 'situacao', 'observacao',
            'restricao_1', 'restricao_2', 'dataInicioPosse', 'dataAtualizacao', 'anoRegistro',
        ];

        return [
            { text: 'Registros Encontrados de Veículos', style: 'secao' },
            this.relatorio.criaPainel(registros, ordemAtributos)
        ];
    }

    criaSecaoResumidaVeiculos(veiculos) {
        if (!veiculos || veiculos.length === 0) { return null; }
        veiculos = veiculos.filter(d => d.tipoDado === 'historico');

        return [{ text: 'Veículos', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
                body: this.criaTabelaResumidaVeiculos(veiculos)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaResumidaVeiculos(veiculos) {
        const headerTabela = [['Placa', 'Renavam', 'Chassi', 'Ano Fab/Mod', 'Marca/Modelo', 'Período']];
        const corpoTabela = veiculos.map(veiculo => {
            return [
                (veiculo.placa)                     ? veiculo.placa : '',
                (veiculo.renavam)                   ? veiculo.renavam : '',
                (veiculo.chassi)                    ? veiculo.chassi : '',
                (veiculo.anoFab || veiculo.anoMod)  ? `${(veiculo.anoFab) ? veiculo.anoFab : ''} / ${(veiculo.anoMod) ? veiculo.anoMod : ''}` : '',
                (veiculo.marcaModelo)               ? veiculo.marcaModelo : '',
                (veiculo.periodo)                   ? uniq(veiculo.periodo.split('-')).sort().join('-') : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }
}
