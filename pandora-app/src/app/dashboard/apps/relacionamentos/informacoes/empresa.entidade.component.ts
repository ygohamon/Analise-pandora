import { Component, OnInit, Input } from '@angular/core';
import { RelacionamentosService } from '../../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-relacionamentos-info-entidade-empresa',
  template: `
    <table style="margin-top: 15px; font-size: 12px;">
        <tr>
            <td>CNPJ</td>
            <td>
              <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(data.cnpj)}' style="color: #3984b8;">{{utils.formataDado(data.cnpj, '##.###.###/####-##')}}</a>
            </td>
        </tr>
        <tr>
            <td>Razão Social</td>
            <td>{{data.razaoSocial}}</td>
        </tr>
        <tr>
            <td>Nome Fantasia</td>
            <td>{{data.nomeFantasia}}</td>
        </tr>
        <!-- <tr>
            <td>Data Início Atividade</td>
            <td>{{this.utils.formataData(data.dataInicioAtividade)}}</td>
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
export class RelacionamentosInfoEntidadeEmpresaComponent implements OnInit {

  @Input() data;
  tabela;

  constructor(public relacionamentos: RelacionamentosService,
              public utils: UtilsService) { }

  ngOnInit() {}
}
