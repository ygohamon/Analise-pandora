import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';


@Component({
    selector: 'app-empresa-atividadeeconomica-table',
    template: `
      <pandora-table
        caption="Atidade Econômica da Empresa"
        exportFilename="atividadeeconomica"
        [value]="dados"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class EmpresaAtividadeEconomicaTableComponent {

    @Input() dados;

    dicionarioDados = {
      cnae:      {nome: 'CNAE'},
      descricao: {nome: 'Descrição'},
      fonte:     {nome: 'Fonte'},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
