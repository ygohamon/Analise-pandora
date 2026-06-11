import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-candidatos',
    template: `
    <div class="ui-g">
      <div class="ui-g-12">
        <pandora-table
          caption="Informação de Candidato"
          exportFilename="candidatos"
          [value]="data"
          [dicionarioDados]="dicionarioDados">
        </pandora-table>
      </div>
    </div>
    `
})
export class CandidatoTableComponent {

    @Input() data;

    dicionarioDados = {
      ano                : {nome: 'Ano' },
      turno              : {nome: 'Turno' },
      situacao           : {nome: 'Situação' },
      uf                 : {nome: 'UF' },
      ue                 : {nome: 'UE' },
      cargo              : {nome: 'Cargo' },
      partido            : {nome: 'Partido' },
      numCandidato       : {nome: 'Número' },
      nomeUrna           : {nome: 'Nome na Urna' },
      situacaoCandidatura: {nome: 'Situação' },
      coligacao          : {nome: 'Coligação' },
      nomeColigacao      : {nome: 'Nome Coligação' },
      fonte              : {nome: 'Fonte' },
    };

    constructor(
      public utils: UtilsService
    ) {}
}
