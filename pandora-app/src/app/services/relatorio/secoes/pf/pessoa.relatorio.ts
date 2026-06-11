import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../../relatorio.utils';
import { UtilsService } from './../../../common/utils.service';

@Injectable()
export class RelatorioSecaoPessoaService {

    constructor(
      private utils: UtilsService,
      private relatorio: RelatorioUtilsService
    ) { }

    private linhaTabelaAgrupado(dadoPessoaAgrupado, atributo) {
      return (atributo === 'linha_vazia') ? [['   ', '   ']]
        : dadoPessoaAgrupado[atributo].map((dado, idx) => this.utils.formataLinha(atributo, dado, dadoPessoaAgrupado, idx));
    }

    private criaTabelaAgrupado(dadoPessoaAgrupado) {
        const ordemAtributos = [
            'foto', 'nome', 'dataNascimento', 'naturalidade', 'ufNaturalidade',
            'sexo', 'cpf', 'situacaoCadastral', 'rg', 'dataExpedicao', 'tituloEleitor',
            'estadoCivil', 'escolaridade',
            'nomeMae', 'nomePai', 'anoObito',
            'linha_vazia',
            'naturezaOcupacao', 'anoExercicioOcupacao', 'tipoOcupacaoPrincipal', 'ocupacaoPrincipal',
            'linha_vazia',
            'estrangeiro', 'residenteExterior', 'nomePaisExterior',
            'linha_vazia',
            'cnh', 'renach', 'dtPsicotecnico', 'dtMedico', 'dataAtualizacao', 'fonte'
        ];

        return ordemAtributos.reduce((acc, atributo) => {
          // Só faz o dado se ele existir em dadoPessoaAgrupado
          if (acc && (dadoPessoaAgrupado[atributo] || atributo === 'linha_vazia')) {
              return acc.concat(this.linhaTabelaAgrupado(dadoPessoaAgrupado, atributo));
          } else {
              return acc;
          }
      }, []);
    }

    criaSecaoPessoa(registros) {
        if (!registros || registros.length === 0) { return null; }

        const ordemAtributos = [
            'nome', 'dataNascimento', 'naturalidade', 'ufNaturalidade',
            'cpf', 'situacaoCadastral', 'tituloEleitor', 'estadoCivil', 'escolaridade', 'sexo', 'nomeMae',
            'nomePai', 'estrangeiro', 'residenteExterior', 'nomePaisExterior',
            'naturezaOcupacao', 'anoExercicioOcupacao', 'tipoOcupacaoPrincipal',
            'ocupacaoPrincipal', 'anoObito', 'rg', 'orgEmissorRg', 'ufOrgEmissorRG',
            'dataExpedicao', 'renach', 'cnh', 'catAtual', 'dtPsicotecnico',
            'resPsicotecnico', 'dtMedico', 'resMedico', 'dataAtualizacao', 'fonte'
        ];

        return [
            { text: 'Registros Encontrados de Pessoa', style: 'secao' },
            this.relatorio.criaPainel(registros, ordemAtributos)
        ];
    }

    criaSecaoPessoaAgrupado(agrupadoPessoa) {
        if (!agrupadoPessoa || Object.keys(agrupadoPessoa).length === 0) { return null; }

        return [{ text: 'Dados Pessoais', style: 'secao' },
        {
            style: 'painel',
            table: {
                widths: [130, '*'],
                body: this.relatorio.formataPainel(this.criaTabelaAgrupado(agrupadoPessoa))
            },
            layout: this.relatorio.layout
        }];
    }
}
