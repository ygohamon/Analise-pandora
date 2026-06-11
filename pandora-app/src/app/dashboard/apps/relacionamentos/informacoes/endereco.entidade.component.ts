import { Component, OnInit, Input } from '@angular/core';
import { RelacionamentosService } from '../../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-relacionamentos-info-entidade-endereco',
  template: `
    <table>
            <tr>
                <td>Logradouro</td>
                <td>{{data.tipoLogradouro}} {{data.logradouro}}</td>
            </tr>
            <tr>
                <td>Número</td>
                <td>{{data.numero}}</td>
            </tr>
            <tr>
                <td>Complemento</td>
                <td>{{data.complemento}}</td>
            </tr>
            <tr>
                <td>Bairro</td>
                <td>{{data.bairro}}</td>
            </tr>
            <tr>
                <td>CEP</td>
                <td>{{this.utils.formataDado(data.cep, '#####-###')}}</td>
            </tr>
            <tr>
                <td>Município</td>
                <td>{{data.municipio}}</td>
            </tr>
            <tr>
                <td>UF</td>
                <td>{{data.uf}}</td>
            </tr>
        </table>
      `
})
export class RelacionamentosInfoEntidadeEnderecoComponent implements OnInit {

  @Input() data;
  tabela;

  constructor(public relacionamentos: RelacionamentosService,
              public utils: UtilsService) { }

  ngOnInit() {}
}
