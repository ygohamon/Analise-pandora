import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-filiacao',
    template: `
      <pandora-table
        caption="Filiação Partidária - TSE"
        exportFilename="filiacao"
        [value]="data"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class FiliacaoTableComponent {

    @Input() data;
    @Output() dataChange = new EventEmitter();

    dicionarioDados = {
        siglaPartido      : {nome: 'Partido'},
        municipio         : {nome: 'Município' },
        dataFiliacao      : {nome: 'Filiação', fn: this.utils.formataData },
        dataProcessamento : {nome: 'Processamento', fn: this.utils.formataData},
        dataDesfiliacao   : {nome: 'Desfiliação', fn  : this.utils.formataData },
        dataCancelamento  : {nome: 'Cancelamento', fn : this.utils.formataData },
        dataRegularizacao : {nome: 'Regularização', fn: this.utils.formataData },
        situacaoRegistro  : {nome: 'Situação' },
        motivoCancelamento: {nome: 'Motivo Cancelamento' },
    }

    constructor(
      public utils: UtilsService
    ) {}
}
