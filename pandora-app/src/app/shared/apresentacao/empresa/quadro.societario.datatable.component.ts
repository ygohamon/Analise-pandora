import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-quadro-societario-datatable',
    templateUrl: 'quadro.societario.datatable.component.html'
})
export class QuadroSocietarioPJDatatableComponent implements OnChanges {

    @Input() data;
    @Output() dataChange = new EventEmitter();

    dataPFCNE;
    dataPJCNE;

    dataPFRF;
    dataPJRF;

    dicionarioDadosPFRF = {
      nome                : {nome: 'Sócio' },
      cpf                 : {nome: 'CPF' },
      dataEntradaSociedade: {nome: 'Data Entrada' },
      dataSaidaSociedade  : {nome: 'Data Saída' },
      percCapital         : {nome: 'Participação' },
      vinculo             : {nome: 'Vínculo' },
    }

    dicionarioDadosPJRF = {
      razaoSocial         : {nome: 'Razão Social' },
      cnpj                : {nome: 'CNPJ' },
      dataEntradaSociedade: {nome: 'Data Entrada' },
      dataSaidaSociedade  : {nome: 'Data Saída' },
      percCapital         : {nome: 'Participação' },
      vinculo             : {nome: 'Vínculo' },
    }

    dicionarioDadosPFCNE = {
      SOCIO            : {nome: 'Sócio' },
      DOCUMENTO_SOCIO  : {nome: 'CPF' },
      ORIGEM_INFORMACAO: {nome: 'Origem Informação' },
      ACAO             : {nome: 'Ação' },
      DATA_ACAO        : {nome: 'Data' },
      VINCULO          : {nome: 'Vínculo' },
      VL_PARTICIPACAO  : {nome: 'Valor Participação' },
    }

    dicionarioDadosPJCNE = {
      SOCIO            : {nome: 'Sócio' },
      DOCUMENTO_SOCIO  : {nome: 'CPF' },
      ORIGEM_INFORMACAO: {nome: 'Origem Informação' },
      ACAO             : {nome: 'Ação' },
      DATA_ACAO        : {nome: 'Data' },
      VINCULO          : {nome: 'Vínculo' },
      VL_PARTICIPACAO  : {nome: 'Valor Participação' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
      this.dataPFCNE = this.data.filter(dado => dado.tipo === 'pj-pf' && dado.fonte === 'CNE');
      this.dataPJCNE = this.data.filter(dado => dado.tipo === 'pj-pj' && dado.fonte === 'CNE');

      this.dataPFRF = this.data.filter(dado => dado.tipo === 'pj-pf' && (dado.fonte.startsWith('RF') || dado.fonte.startsWith('CTX') ));
      this.dataPJRF = this.data.filter(dado => dado.tipo === 'pj-pj' && (dado.fonte.startsWith('RF') || dado.fonte.startsWith('CTX') ));
    }
}
