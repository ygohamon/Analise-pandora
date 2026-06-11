import { Component, OnInit, Input } from '@angular/core';
import { RelacionamentosService } from '../../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-relacionamentos-info-entidade-orgao',
  template: `
        <table style="margin-top: 15px; font-size: 12px;">
            <tr>
                <td>Unidade Gestora</td>
                <td>{{data.uGestora}}</td>
            </tr>
            <tr>
                <td>Esfera</td>
                <td>{{data.esfera}}</td>
            </tr>
            <tr *ngIf="!!data.municipio">
                <td>Município</td>
                <td>{{data.municipio}}</td>
            </tr>
        </table>
      `
})
export class RelacionamentosInfoEntidadeOrgaoComponent implements OnInit {

  @Input() data;
  tabela;

  constructor(public relacionamentos: RelacionamentosService,
              public utils: UtilsService) { }

  ngOnInit() {}
}
