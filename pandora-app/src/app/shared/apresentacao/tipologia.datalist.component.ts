import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { uniqBy } from 'lodash-es';

import { UtilsService } from '../../services/common/utils.service';

@Component({
    selector: 'app-tipologia-datalist',
    templateUrl: 'tipologia.datalist.component.html'
})
export class TipologiaDatalistComponent implements OnInit, OnChanges {

    @Input() tipo;
    @Input() tipologias;
    @Output() tipologiasChange = new EventEmitter();

    tipologiasTCU;
    tipologiasTCE;
    tipologiasLicitacoesTCE;

    completoCodigoTipologias;
    completoTipologias;
    completoNumeroProtocolo;

    tipologiaSelecionada;
    msgRegistroNaoEncontrado: string;

    indices;

    dicionarioDadosTCE = {
      tipologia          : { nome: 'DESCRIÇÃO' }
    };

    dicionarioDadosLicitacoesTCE = {
      codigoTipologia          : { nome: 'Código' },
      tipologia                : { nome: 'Descrição' },
      numeroProtocoloLicitacao : { nome: 'Protocolo Licitação'}
    };

    dicionarioDadosLicitacoesExpandCompleto = {
      detalhamentoTipologia    : { nome: 'Detalhamento' },
      numeroProtocoloLicitacao : { nome: 'Número do Protocolo da Licitação' },
      numeroProtocoloContrato  : { nome: 'Número do Protocolo do Contrato' },
      numeroProtocoloAditivo   : { nome: 'Número do Protocolo do Aditivo' }
    }

    constructor(public utils: UtilsService) {}

    ngOnChanges() {
      this.tipologiasTCU           = this.tipologias.filter(d => d.fonte.startsWith('TCU'));
      this.tipologiasTCE           = this.tipologias.filter(d => d.fonte.startsWith('TCE'));
      this.tipologiasLicitacoesTCE = this.tipologias.filter(d => d.fonte.startsWith('LIC')).map((dado, idx) => Object.assign(dado, {id: idx}));

      this.indices = this.tipologiasTCU.map((tipo) => {
        return Array(54).fill(0).map((x, i) => (!!tipo['t' + i]) ? i : null).filter(x => x !== null);
      });

      this.completoCodigoTipologias = uniqBy(this.tipologiasLicitacoesTCE.map(d => { return { label: d.codigoTipologia,          value: d.codigoTipologia } }),          'value');
      this.completoTipologias       = uniqBy(this.tipologiasLicitacoesTCE.map(d => { return { label: d.tipologia,                value: d.tipologia }} ),                'value');
      this.completoNumeroProtocolo  = uniqBy(this.tipologiasLicitacoesTCE.map(d => { return { label: d.numeroProtocoloLicitacao, value: d.numeroProtocoloLicitacao } }), 'value');
    }

    ngOnInit() {
        this.msgRegistroNaoEncontrado = this.msgRegistroNaoEncontrado;
    }

    toNumber(valor){
        return Number(valor);
    }

    pintaLinha(indice) {
        if (indice % 2) {
            return '#f9fbfc';
        }
        return '';
    }

    onRemoverPessoa(index) {
        this.tipologias = this.tipologias.filter((registro, i, array) => i !== index);
        this.tipologias = this.tipologias.map((registro, i) => {
            registro['index'] = i;
            return registro;
        });
        this.tipologiasChange.emit(this.tipologias);
    }

    calculaTaxaDoacao(taxaDoacao) {
        return `${(Number(taxaDoacao)).toFixed(2)} %`;
    }
}
