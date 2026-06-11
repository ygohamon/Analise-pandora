import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from './../../../relatorio/relatorio.utils';

@Injectable()
export class RelatorioSecaoEmpresaService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaSecaoEmpresas(registros) {
    if (!registros || registros.length === 0) { return null; }

    const ordemAtributos = [
      'cnpj', 'nomeFantasia', 'razaoSocial', 'dataInicioAtividade',
      'matriz', 'situacaoCadastral', 'dataSituacaoCadastral', 'naturezaJuridica',
      'porte', 'capitalSocial', 'cnaeFiscal', 'cnaeSecundario',
      'cnaeSecao', 'cnaeDivisao', 'cnaeGrupo', 'cnaeClasse', 'cnaeSubClasse',
      'cpfResponsavel', 'nomeResponsavel'
    ];

    return [
      { text: 'Registros Encontrados de Empresa\n', style: 'secao' },
      this.relatorio.criaPainel(registros, ordemAtributos)
    ];
  }


  private criaTabelaAtividadeEconomica (dados) {
    const headerTabela = [['CNAE', 'Descrição', 'Fonte']];
    const corpoTabela = dados.map(d => {
      return [
        (d.cnae)      ? d.cnae : '',
        (d.descricao) ? d.descricao : '',
        (d.fonte)     ? d.fonte : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoAtividadeEconomica (dados) {
    if (!dados || dados.length === 0) { return null; }

    return [{ text: 'Atividade Econômica', style: 'secao' },
    {
        style: 'tabela',
        table: {
            widths: ['auto', '*', 'auto'],
            body: this.criaTabelaAtividadeEconomica(dados)
        },
        layout: this.relatorio.layout
    }];
  }


  private criaTabelaContadores (dados) {
    const headerTabela = [['CPF', 'Nome', 'CRC', 'UF', 'Fonte']];
    const corpoTabela = dados.map(d => {
      return [
        (d.cpf)   ? this.utils.formataDado(d.cpf, '###.###.###-##')  : '',
        (d.nome)  ? d.nome : '',
        (d.crc)   ? d.crc  : '',
        (d.ufCRC) ? d.ufCRC: '',
        (d.fonte) ? d.fonte: '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoContadores (dados) {
    if (!dados || dados.length === 0) { return null; }

    return [{ text: 'Contadores', style: 'secao' },
    {
        style: 'tabela',
        table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: this.criaTabelaContadores(dados)
        },
        layout: this.relatorio.layout
    }];
  }

  private criaTabelaFiliais (dados) {
    const headerTabela = [['Razão Social', 'CNPJ', 'Nome Fantasia', 'Início', 'Município', 'UF', 'Fonte']];
    const corpoTabela = dados.map(d => {
      return [
        (d.razaoSocial)         ? d.razaoSocial  : '',
        (d.cnpj)                ? this.utils.formataDado(d.cnpj, '##.###.###/####-##') : '',
        (d.nomeFantasia)        ? d.nomeFantasia  : '',
        (d.dataInicioAtividade) ? this.utils.formataData(d.dataInicioAtividade) : '',
        (d.municipio)           ? d.municipio  : '',
        (d.uf)                  ? d.uf  : '',
        (d.fonte)               ? d.fonte: '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoFiliais (dados) {
    if (!dados || dados.length === 0) { return null; }

    return [{ text: 'Contadores', style: 'secao' },
    {
        style: 'tabela',
        table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: this.criaTabelaFiliais(dados)
        },
        layout: this.relatorio.layout
    }];
  }
}
