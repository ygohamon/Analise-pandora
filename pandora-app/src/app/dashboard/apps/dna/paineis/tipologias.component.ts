import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-tipologias',
  template: `
    <div class="ui-g-12">
      <p-panel
        header="TCU"
        [toggleable]="true">

        <div class="ui-g">
            <div class="ui-g-12" style="background-color: #eaeeef;" *ngIf="tipologiasPJEncontradas.length">
                <div class="ui-g-2 fw-bold text-center">ID</div>
                <div class="ui-g-10 fw-bold text-center">DESCRIÇÃO</div>
            </div>

            <div class="ui-g-12" *ngFor="let tipologia of tipologiasPJEncontradas; let i = index" [style.background-color]="pintaLinha(i)">
                <div class="ui-g-2 fw-bold">
                    {{tipologia.toUpperCase()}}
                </div>
                <div class="ui-g-10">
                    {{utils.mapeamentoTipologiaPJ[tipologia]}}
                </div>
            </div>

            <div class="ui-g-12" *ngIf="!tipologiasPJEncontradas.length">
              <div class="ui-g-12 ui-sm-12 fw-bold text-center">{{utils.registroNaoEncontrado}}</div>
            </div>
        </div>
      </p-panel>
    </div>

    <div class="ui-g-12">
      <p-panel
        header="TCE"
        [toggleable]="true">

        <div class="ui-g">
          <div class="ui-g-12" style="background-color: #eaeeef;" *ngIf="tipologiasTCE.length">
            <div class="ui-g-12 fw-bold text-center">DESCRIÇÃO</div>
          </div>

          <div class="ui-g-12" *ngFor="let tce of tipologiasTCE; let i = index" [style.background-color]="pintaLinha(i)">
            <div class="ui-g-12">
              {{tce.tipologia.toUpperCase()}}
            </div>
          </div>

          <div class="ui-g-12" *ngIf="!tipologiasTCE.length">
            <div class="ui-g-12 ui-sm-12 fw-bold text-center">
              {{utils.registroNaoEncontrado}}
            </div>
          </div>
        </div>


      </p-panel>
    </div>

    <div class="ui-g-12">
      <pandora-table
        caption="TCE - LICITAÇÕES"
        exportFilename="tipologias_licitacao_tce"
        dataKey="id"
        [value]="tipologiasLicitacaoTCE"
        [mostraEspacamentoExpand]="true"
        [dicionarioDadosExpand]="dicionarioDadosLicitacoesExpandCompleto"
        [dicionarioDados]="dicionarioDadosTipologiaTCE">
      </pandora-table>
    </div>
  `,
})
export class DNATipologiasComponent implements OnInit {

  @Input() dados;

  tipologiasPJ;
  tipologiasPJEncontradas;
  dnaInformacoesTipologias;

  tipologiasTCE;
  tipologiasLicitacaoTCE;

  // Colunas da tabela de resultado
  dicionarioDados = {
    cpf        : {nome: 'CPF' },
    nome       : {nome: 'Nome' },
    percCapital: {nome: 'Participação' },
  }

  dicionarioDadosTipologiaTCE = {
    codigoTipologia          : { nome: 'Código da Tipologia' },
    tipologia                : { nome: 'Descrição da Tipologia' },
    numeroProtocoloLicitacao : { nome: 'Protocolo da Licitação' }
  }

  dicionarioDadosLicitacoesExpandCompleto = {
    detalhamentoTipologia    : { nome: 'Detalhamento' },
    numeroProtocoloLicitacao : { nome: 'Número do Protocolo da Licitação' },
    numeroProtocoloContrato  : { nome: 'Número do Protocolo do Contrato' },
    numeroProtocoloAditivo   : { nome: 'Número do Protocolo do Aditivo' }
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.tipologiasPJ = Object.keys(this.utils.mapeamentoTipologiaPJ);

    let temp = this.dados.filter(r => Object.keys(r)[0] === 'tipologia_pj');

    this.dnaInformacoesTipologias = (temp.length) ? temp[0].tipologia_pj[0] : temp;
    this.tipologiasPJEncontradas = this.tipologiasPJ.filter(t => !!this.dnaInformacoesTipologias[t]);

    this.tipologiasTCE = (temp.length) ? temp[0].tipologia_pj.filter(tipologia => tipologia.fonte.startsWith('TCE')) : [];
    this.tipologiasLicitacaoTCE = (temp.length) ?
        temp[0].tipologia_pj.filter(tipologia => tipologia.fonte.startsWith('LIC')).map((dado, idx) => Object.assign(dado, {id: idx})) :
        [];
  }


  pintaLinha(indice) {
    if (indice % 2) {
        return '#f9fbfc';
    }
    return '';
  }
}
