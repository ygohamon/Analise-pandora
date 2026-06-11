import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-empresa-empregadores-datatable',
  template: `
    <div class="ui-g">
      <div class="ui-g-12">
        <pandora-table
          caption="Empregados - Fonte: RAIS"
          exportFilename="tabela_RAIS"
          [value]="dataRAIS"
          [dicionarioDados]="dadosDicionariosRAIS">
        </pandora-table>
      </div>
    </div>
  `
})
export class EmpresaEstatisticaEmpregadoressDatatableComponent {

  @Input() data;
  @Output() dataChange = new EventEmitter();

  dataRAIS;

  dadosDicionariosRAIS = {
    ano                  : {nome: 'Ano' },
    qtdVinculos          : {nome: 'Vínculos' },
    folhaAnual           : {nome: 'Folha Anual', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
    mediaMesesTrabalhados: {nome: 'Média Meses Trabalhados' },
    mediaSalarial        : {nome: 'Média Salarial', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
    menorMediaSalarial   : {nome: 'Menor Média Salarial', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
    maiorMediaSalarial   : {nome: 'Maior Média Salarial', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.dataRAIS = this.data
      .filter(dado => dado.fonte === 'RAIS')
      .map((dado, idx) => Object.assign(dado, {id: idx}));
  }
}
