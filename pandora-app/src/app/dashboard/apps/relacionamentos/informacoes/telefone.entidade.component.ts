import { Component, OnInit, Input } from '@angular/core';
import { RelacionamentosService } from '../../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-relacionamentos-info-entidade-telefone',
  template: `
        <table style="margin-top: 15px; font-size: 12px;">
            <tr>
                <td>Telefone</td>
                <td>{{data.telefone}}</td>
            </tr>
        </table>
      `
})
export class RelacionamentosInfoEntidadeTelefoneComponent implements OnInit {

  @Input() data;
  tabela;

  constructor(public relacionamentos: RelacionamentosService,
              public utils: UtilsService) { }

  ngOnInit() {}
}
