
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-informacoes-gerais',
  template: `
    <div class="ui-g">

      <!-- Card contendo as informações da Empresa -->
      <div class="ui-g-6 ui-sm-12 px-0 pr-md-2">
        <div class="ui-g p-card mb-0 h-100">
          <div class="p-card-subtitulo pb-2">Empresa</div>

          <div class="ui-g-12 p-0">
            <div class="ui-g-3 ui-sm-12 fw-bold">Razão Social</div>
            <div class="ui-g-9 ui-sm-12" *ngIf="dnaInformacoesEmpresa">{{dnaInformacoesEmpresa.razaoSocial}}</div>
          </div>

          <div class="ui-g-12 p-0">
            <div class="ui-g-3 ui-sm-12 fw-bold">Nome Fantasia</div>
            <div class="ui-g-9 ui-sm-12" *ngIf="dnaInformacoesEmpresa">{{dnaInformacoesEmpresa.nomeFantasia}}</div>
          </div>

          <div class="ui-g-12 p-0">
            <div class="ui-g-3 ui-sm-12 fw-bold">CNPJ</div>
            <div class="ui-g-9 ui-sm-12" *ngIf="dnaInformacoesEmpresa">
              <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(dnaInformacoesEmpresa.cnpj)}' class="text-primary">
                {{utils.formataDado(dnaInformacoesEmpresa.cnpj, '##.###.###/####-##')}}
              </a>
            </div>
          </div>

          <div class="ui-g-12 p-0">
            <div class="ui-g-3 ui-sm-12 fw-bold">Início de Atividade</div>
            <div class="ui-g-9 ui-sm-12" *ngIf="dnaInformacoesEmpresa">{{utils.formataData(dnaInformacoesEmpresa.dataInicioAtividade)}}</div>
          </div>
        </div>
      </div>

      <!-- Card contendo as informações do Responsável -->
      <div class="ui-g-6 ui-sm-12 px-0 pl-md-2">
        <div class="ui-g p-card mb-0 h-100">
          <div class="p-card-subtitulo pb-2">Responsável</div>

          <div class="ui-g-12 p-0">
            <div class="ui-g-3 ui-sm-12 fw-bold">Nome</div>
            <div class="ui-g-9 ui-sm-12" *ngIf="dnaInformacoesEmpresa">{{dnaInformacoesEmpresa.nomeResponsavel}}</div>
          </div>

          <div class="ui-g-12 p-0">
            <div class="ui-g-3 ui-sm-12 fw-bold">CPF</div>
            <div class="ui-g-9 ui-sm-12" *ngIf="dnaInformacoesEmpresa">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(dnaInformacoesEmpresa.cpfResponsavel)}' class="text-primary">
                {{utils.formataDado(dnaInformacoesEmpresa.cpfResponsavel, '###.###.###-##')}}
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DNAInformacoesGeraisComponent implements OnInit {

  @Input() dados;

  dnaInformacoesEmpresa

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dnaInformacoesEmpresa = this.utils.first(this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'empresa'))?.empresa);
  }
}
