import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-tcu-condenacao-table',
  template: `
    <pandora-table
      caption="Condenações - Fonte: TCU"
      exportFilename="condenacoes_tcu"
      dataKey="key"
      [value]="dados"
      [dicionarioDadosExpand]="dicionarioDadosCondenacaoTCUExpand"
      [dicionarioDados]="dicionarioDadosCondenacaoTCU">

      <ng-template pTemplate="header" let-columns>
        <tr>
          <th style="width: 3.25em"></th>
          <th *ngFor="let col of columns" [pandoraSortableColumn]="col.field">
            {{col.header}}
            <p-sortIcon [field]="col.field"></p-sortIcon>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-rowData let-columns="columns" let-expanded="expanded">
        <tr>
          <td>
            <span href="#" [pandoraRowToggler]="rowData">
              <i class="pointer" [ngClass]="expanded ? 'fa fa-chevron-circle-down' : 'fa fa-chevron-circle-right'"></i>
            </span>
          </td>

          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'titulo'">
              <a href="{{rowData.link}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
            </span>
            <span *ngSwitchCase="'dataDecisao'">{{utils.formataData(rowData.dataDecisao)}}</span>
            <span *ngSwitchCase="'dataInicioRestricao'">{{utils.formataData(rowData.dataInicioRestricao)}}</span>
            <span *ngSwitchCase="'tipo'">
              <span style="font-weight: bold">{{rowData.tipo}}</span>
            </span>
            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class TCUCondenacaoTableComponent {

  @Input() dados;

  dicionarioDadosCondenacaoTCU = {
    cadastro                : { nome: 'Cadastro'},
    condenacao              : { nome: 'Condenação'},
    orgaoResponsavel        : { nome: 'Órgão Responsável'},
    dataDecisao             : { nome: 'Data Decisão'},
    dataInicioRestricao     : { nome: 'Data Início Restrição'},
    lei                     : { nome: 'Lei'},
    artigo                  : { nome: 'Artigo'},
    processo                : { nome: 'Processo'},
    descricaoIdentificacao  : { nome: 'Acórdão'},
    tipoCondenacao          : { nome: 'Tipo Condenação'},
    inelegivel              : { nome: 'Inelegível'},
    // valorDano               : { nome: 'Dano'},
    // valorMulta              : { nome: 'Multa'},
  }

  dicionarioDadosCondenacaoTCUExpand = {
    alinea:                    { nome: 'Alínea'},
    artigo:                    { nome: 'Artigo'},
    inciso:                    { nome: 'Inciso'},
    lei:                       { nome: 'Lei'},
    autoridadeCompetente:      { nome: 'Autoridade Competente'},
    cadastro:                  { nome: 'Cadastro'},
    condenacao:                { nome: 'Condenação'},
    dataCalculoCorrecaoDano:   { nome: 'Data Cálculo Correção Dano'},
    dataCalculoCorrecaoMulta:  { nome: 'Data Cálculo Correção Multa'},
    dataDecisao:               { nome: 'Data Decisão'},
    dataDiario:                { nome: 'Data Diário'},
    dataInicioRestricao:       { nome: 'Data Início Restrição'},
    dataTJ:                    { nome: 'Data TJ'},
    demissaoPerdaCargo:        { nome: 'Demissão Perda Cargo'},
    descricaoIdentificacao:    { nome: 'Descrição Identificação'},
    diario:                    { nome: 'Diário'},
    municipal:                 { nome: 'Municipal'},
    estadual:                  { nome: 'Estadual'},
    federal:                   { nome: 'Federal'},
    inelegivel:                { nome: 'Inelegível'},
    jurosDano:                 { nome: 'Juros Dano'},
    jurosMulta:                { nome: 'Juros Multa'},
    linkDecisao:               { nome: 'Link Decisão'},
    multaSN:                   { nome: 'Tem Multa'},
    orgaoResponsavel:          { nome: 'Órgão Responsável'},
    pagina:                    { nome: 'Página'},
    paragrafo:                 { nome: 'Parágrafo'},
    perdaBensValores:          { nome: 'Perda Bens Valores'},
    perdaFuncao:               { nome: 'Perda Função'},
    prazoRestricao:            { nome: 'Prazo Restrição'},
    processo:                  { nome: 'Processo'},
    proibicaoCargoPublico:     { nome: 'Proibição Cargo Público'},
    proibicaoContratacao:      { nome: 'Proibição Contratação'},
    proibicaoLicitacoes:       { nome: 'Proibição Licitações'},
    proibicaoNomeacao:         { nome: 'Proibição Nomeações'},
    proibicaoReceberBeneficios: { nome: 'Proibição Receber Benefícios'},
    redacao:                    { nome: 'Redação'},
    ressarcirDano:              { nome: 'Ressarcir Dano'},
    secao:                      { nome: 'Seção'},
    suspensaoDireitosPoliticos: { nome: 'Suspensão Direitos Políticos'},
    suspensaoTempCargoFuncao:   { nome: 'Suspensão Temporária Cargo e Função'},
    tipoCondenacao:             { nome: 'Tipo Condenação'},
    valorDano:                  { nome: 'Valor Dano'},
    valorMulta:                 { nome: 'Valor Multa'},
    valorPerda:                 { nome: 'Valor Perda'},
  }

  constructor(
    public utils: UtilsService
  ) {}
}
