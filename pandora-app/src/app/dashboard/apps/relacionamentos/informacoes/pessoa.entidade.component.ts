import { Component, OnInit, Input } from '@angular/core';
import { RelacionamentosService } from '../../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-relacionamentos-info-entidade-pessoa',
  template: `
        <table style="margin-top: 15px; font-size: 12px;">
            <tr>
                <td>CPF</td>
                <td>
                  <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(data.cpf)}' style="color: #3984b8;">{{utils.formataDado(data.cpf, '###.###.###-##')}}</a>
                </td>
            </tr>
            <tr>
                <td>Nome</td>
                <td>{{data.nome}}</td>
            </tr>
            <!-- <tr>
                <td>Sexo</td>
                <td>{{data.sexo}}</td>
            </tr>
            <tr>
                <td>Data Nascimento</td>
                <td>{{this.utils.formataData(data.dataNascimento)}}</td>
            </tr>
            <tr>
                <td>Mãe</td>
                <td>{{data.nomeMae}}</td>
            </tr>
            <tr>
                <td>Pai</td>
                <td>{{data.nomePai}}</td>
            </tr>
            <tr>
                <td>Município</td>
                <td>{{data.municipio}}</td>
            </tr>
            <tr>
                <td>UF</td>
                <td>{{data.uf}}</td>
            </tr> -->
        </table>
      `
})
export class RelacionamentosInfoEntidadePessoaComponent implements OnInit {

  @Input() data;
  tabela;

  constructor(public relacionamentos: RelacionamentosService,
              public utils: UtilsService) { }

  ngOnInit() {}
}
