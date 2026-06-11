import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-servidor-municipal-table',
    template: `
      <pandora-table
        caption="Folha de Pagamento - Fonte: SAGRES"
        exportFilename="servidor_municipal"
        [value]="data"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class ServidorMunicipalTableComponent {

    @Input() data;

    dicionarioDados = {
        dtAno    : {nome: 'Ano' },
        matricula: {nome: 'Matrícula' },
        cargo    : {nome: 'Cargo' },
        vinculo  : {nome: 'Vínculo' },
        orgao    : {nome: 'Órgão' },
        vlBruto  : {nome: 'V. Bruto' , fn: v => `R$ ${this.utils.converteEmDinheiro(v)}`},
        meses    : {nome: 'Meses'},
        media    : {nome: 'Média', fn: v => `R$ ${this.utils.converteEmDinheiro(v)}`},
    };

    constructor(
      public utils: UtilsService
    ) {}
}
