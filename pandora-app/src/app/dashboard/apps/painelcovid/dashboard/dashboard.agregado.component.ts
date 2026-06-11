import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-painelcovid-dashboard-agregado',
  template: `
    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Valores pagos em Abril</div>

        <div class="w-100 text-center font-weight-bold">
          {{abril?.qtd}} ocorrências - R$ {{utils.converteEmDinheiro(abril?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Valores pagos em Maio</div>

        <div class="w-100 text-center font-weight-bold">
          {{maio?.qtd}} ocorrências - R$ {{utils.converteEmDinheiro(maio?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Falecidos</div>

        <div class="w-100 text-center font-weight-bold">
          {{falecidos?.qtd}} ocorrências - R$ {{utils.converteEmDinheiro(falecidos?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Residentes Exterior</div>

        <div class="w-100 text-center font-weight-bold">
          Número de Beneficiários {{residentes_exterior?.qtd}} - R$ {{utils.converteEmDinheiro(residentes_exterior?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Donos de Aeronave</div>

        <div class="w-100 text-center font-weight-bold">
          Número de Beneficiários {{aeronave?.qtd}} - R$ {{utils.converteEmDinheiro(aeronave?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Donos de Embarcação</div>

        <div class="w-100 text-center font-weight-bold">
          Número de Beneficiários {{embarcacao?.qtd}} - R$ {{utils.converteEmDinheiro(embarcacao?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Servidores</div>

        <div class="w-100 text-center font-weight-bold">
          Número de Beneficiários {{servidor?.qtd}} - R$ {{utils.converteEmDinheiro(servidor?.total)}}
        </div>
      </div>
    </div>

    <div class="ui-g-3 ui-sm-12">
      <div class="p-card mb-0">
        <div class="pb-1 fs-3 fw-bold">Sócios de Empresa</div>

        <div class="w-100 text-center font-weight-bold">
          Número de Beneficiários {{socios?.qtd}} - R$ {{utils.converteEmDinheiro(socios?.total)}}
        </div>
      </div>
    </div>
  `
})
export class DashboardPainelCovidAgregadoComponent implements OnInit {

  @Input() dados;
  falecidos;
  residentes_exterior;
  embarcacao;
  aeronave;
  servidor;
  socios;

  abril;
  maio;

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.falecidos = this.utils.first(this.dados['agregado_falecido']);
    this.residentes_exterior = this.utils.first(this.dados['agregado_exterior']);
    this.embarcacao = this.utils.first(this.dados['agregado_embarcacao']);
    this.aeronave = this.utils.first(this.dados['agregado_aeronave']);
    this.servidor = this.utils.first(this.dados['agregado_servidor']);
    this.socios = this.utils.first(this.dados['agregado_socios']);

    this.abril = this.utils.first(this.dados['agregado_abril']);
    this.maio = this.utils.first(this.dados['agregado_maio']);
  }
}
