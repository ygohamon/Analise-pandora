import { Component,Input, OnChanges} from '@angular/core';
import { uniq, uniqBy } from 'lodash-es';
import { UtilsService } from '../../services/common/utils.service';

@Component({
  selector: 'app-embarcacao-datatable',
  templateUrl: './embarcacao.datatable.component.html',
})
export class EmbarcacaoDatatableComponent implements OnChanges {

  @Input() embarcacoes;

  dadosCompleto;
  dadosHistorico;

  // Colunas da tabela de resultado
  dicionarioDadosCompleto = {
    embarcacao    : {nome : 'Nome Embarcação'},
    anoConstrucao : {nome : 'Ano'},
    descricao     : {nome : 'Descrição'},
    localAquisicao: {nome : 'Local'},
    valor         : {nome : 'Valor', fn: this.utils.converteEmDinheiroFormatoBrasileiro},
    dataAquisicao : {nome : 'Dt Aquisição', fn: this.utils.formataData },
    dataValidade  : {nome : 'Dt Validade', fn: this.utils.formataData },
    fonte         : {nome : 'Fonte'}
  }

  dicionarioDadosExpandCompleto = {
    embarcacao    : {nome: 'Nome Embarcação'},
    tipoPessoa    : {nome: 'Tipo'},
    inscricao     : {nome: 'Número de Inscrição'},
    dataInscricao : {nome: 'Data de Inscrição', fn: this.utils.formataData },
    orgaoInscricao: {nome: 'Órgão de Inscrição'},
    cidadeOrgao   : {nome: 'Cidade de Inscrição'},
    situacao      : {nome: 'Situação'},
    anoConstrucao : {nome: 'Ano'},
    constCasco    : {nome: 'Casco'},
    descricao     : {nome: 'Descrição'},
    comprimento   : {nome: 'Comprimento'},
    localAquisicao: {nome: 'Local'},
    valor         : {nome: 'Valor', fn: this.utils.converteEmDinheiroFormatoBrasileiro },
    dataAquisicao : {nome: 'Data de Aquisição', fn: this.utils.formataData },
    dataValidade  : {nome: 'Data de Validade', fn: this.utils.formataData },
    fonte         : {nome: 'Fonte'}
  }
  
  
  
  completoEmbarcacao;
  completoAnoConstrucao;
  completoDescricao;
  completoLocalAquisicao;
  completoValor;
  completoDataAquisicao;
  completoDataValidade;
  completoFonte;

  
  constructor(public utils: UtilsService) {}

    ngOnChanges() {
      this.dadosCompleto = this.embarcacoes
        .map((dado, idx) => Object.assign(dado, {id: idx}))
      // Para o filtro
      this.completoEmbarcacao       = uniqBy(this.dadosCompleto.map(d => { return { label: d.embarcacao,     value: d.embarcacao } }),     'value');
      this.completoAnoConstrucao    = uniqBy(this.dadosCompleto.map(d => { return { label: d.anoConstrucao,  value: d.anoConstrucao } }),  'value');
      this.completoDescricao        = uniqBy(this.dadosCompleto.map(d => { return { label: d.descricao,      value: d.descricao } }),      'value');
      this.completoLocalAquisicao   = uniqBy(this.dadosCompleto.map(d => { return { label: d.localAquisicao, value: d.localAquisicao } }), 'value');
      this.completoValor            = uniqBy(this.dadosCompleto.map(d => { return { label: d.valor,          value: d.valor } }),          'value');
      this.completoDataAquisicao    = uniqBy(this.dadosCompleto.map(d => { return { label: d.dataAquisicao,  value: d.dataAquisicao } }),  'value');
      this.completoDataValidade     = uniqBy(this.dadosCompleto.map(d => { return { label: d.dataValidade,   value: d.dataValidade } }),   'value');
      this.completoFonte            = uniqBy(this.dadosCompleto.map(d => { return { label: d.fonte,          value: d.fonte } }),          'value');
    }

    fixPeriodo(periodo) {
      return uniq(periodo.split('-')).sort().join('-');
    }

}
