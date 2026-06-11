import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from './../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-beneficio-datatable',
    template: `
      <pandora-table
        *ngIf="dadosBFTransparencia.length > 0"
        [styleClass]="'pb-3'"
        caption="Bolsa Familia - Fonte: Transparência Federal"
        exportFilename="bf_transparencia"
        [value]="dadosBFTransparencia"
        [dicionarioDados]="dicionarioDadosBFTransparencia">
      </pandora-table>

      <pandora-table
        *ngIf="dadosBF.length > 0"
        [styleClass]="'pb-3'"
        caption="Bolsa Família"
        exportFilename="bolsa_familia"
        [value]="dadosBF"
        [dicionarioDados]="dicionarioDadosBF">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'agenciaMunicipio'">{{rowData.agenciaMunicipio}}/{{rowData.agenciaUf}}</span>
              <span *ngSwitchCase="'vlrTotal'">R$ {{utils.converteEmDinheiro(rowData.vlrTotal)}}</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>

      <pandora-table
        *ngIf="dadosCartaoGovernoFederal.length > 0"
        [styleClass]="'pb-3'"
        caption="Cartão de Pagamento do Governo Federal - Fonte: Transparência Federal"
        exportFilename="cartao_governo_federal"
        [value]="dadosCartaoGovernoFederal"
        [dicionarioDados]="dicionarioDadosCartaoGovernoFederal">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'cnpj'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
                </span>
                <span *ngSwitchCase="'dataTransacao'">{{utils.formataData(rowData.dataTransacao)}}</span>
                <span *ngSwitchCase="'valor'">R$ {{utils.converteEmDinheiro(rowData.valor)}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>

      <pandora-table
        *ngIf="dadosCartaoAlimentacaoPB.length > 0"
        [styleClass]="'pb-3'"
        caption="Cartão Alimentação PB"
        exportFilename="cartao_alimentacao_pb"
        [value]="dadosCartaoAlimentacaoPB"
        [dicionarioDados]="dicionarioDadosCartaoAlimentacaoPB">
      </pandora-table>

      <pandora-table
        *ngIf="dadosBPC.length > 0"
        [styleClass]="'pb-3'"
        caption="BPC - Fonte: Transparência Federal"
        exportFilename="bpc"
        [value]="dadosBPC"
        [dicionarioDados]="dicionarioDadosBPC">
      </pandora-table>

      <pandora-table
        *ngIf="dadosAuxilioEmergencial.length > 0"
        [styleClass]="'pb-3'"
        caption="Auxílio Emergencial - Fonte: Transparência Federal"
        exportFilename="auxilio_emergencial"
        [value]="dadosAuxilioEmergencial"
        [dicionarioDados]="dicionarioDadosAuxilioEmergencial">
      </pandora-table>

      <pandora-table
        *ngIf="dadosSeguroDefeso.length > 0"
        [styleClass]="'pb-3'"
        caption="Seguro Defeso - Fonte: Transparência Federal"
        exportFilename="seguro_defeso"
        [value]="dadosSeguroDefeso"
        [dicionarioDados]="dicionarioDadosSeguroDefeso">
      </pandora-table>

      <pandora-table
        *ngIf="dadosGarantiaSafra.length > 0"
        [styleClass]="'pb-3'"
        caption="Garantia Safra - Fonte: Transparência Federal"
        exportFilename="seguro_defeso"
        [value]="dadosGarantiaSafra"
        [dicionarioDados]="dicionarioDadosGarantiaSafra">
      </pandora-table>
    `

})
export class PessoaBeneficioDatatableComponent implements OnChanges {

    @Input() data;

    dadosBF;
    dadosBFTransparencia;
    dadosCartaoGovernoFederal;
    dadosCartaoAlimentacaoPB;
    dadosBPC;
    dadosAuxilioEmergencial;
    dadosSeguroDefeso;
    dadosGarantiaSafra;

    dicionarioDadosBFTransparencia = {
      dataMesCompetencia    : {nome: 'Competência', fn: this.utils.formataData},
      dataMesReferencia     : {nome: 'Referência', fn: this.utils.formataData},
      nis                   : {nome: 'NIS'},
      municipio             : {nome: 'Município'},
      uf                    : {nome: 'UF'},
      quantidadeDependentes : {nome: 'Dependentes'},
      valor                 : {nome: 'Valor', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
    }

    dicionarioDadosBF = {
      agenciaMunicipio: {nome: 'Agência'},
      competenciaFolha: {nome: 'Competência'},
      nome            : {nome: 'Nome'},
      logradouro      : {nome: 'Logradouro'},
      nisDependente   : {nome: 'NIS Dep'},
      nomeDependente  : {nome: 'Nome Dep'},
      idadeDependente : {nome: 'Idade Dep'},
      vlrTotal        : {nome: 'Valor Total'},
    }

    dicionarioDadosCartaoAlimentacaoPB = {
      cidade: {nome: 'Cidade'},
      nis:    {nome: 'NIS'},
      nome:   {nome: 'Beneficiário'},
      // responsavel     : {nome: 'Nome - Resp'},
      // nisDependente   : {nome: 'NIS Dep'},
      // nomeDependente  : {nome: 'Nome Dep'},
      // idadeDependente : {nome: 'Idade Dep'},
      // vlrTotal        : {nome: 'Valor Total'},
    }

    dicionarioDadosCartaoGovernoFederal = {
      orgaoMaximo: {nome: 'Órgão Máximo'},
      orgaoVinculado: {nome: 'Órgão Vinculado'},
      unidadeGestora: {nome: 'Unidade Gestora'},
      tipoCartao: {nome: 'Tipo Cartão'},
      razaoSocial: {nome: 'Razão Social'},
      cnpj: {nome: 'CNPJ'},
      municipio:    {nome: 'Município'},
      uf:    {nome: 'UF'},
      dataTransacao:    {nome: 'Data'},
      valor:   {nome: 'Valor'},
      // responsavel     : {nome: 'Nome - Resp'},
      // nisDependente   : {nome: 'NIS Dep'},
      // nomeDependente  : {nome: 'Nome Dep'},
      // idadeDependente : {nome: 'Idade Dep'},
      // vlrTotal        : {nome: 'Valor Total'},
    }

    dicionarioDadosBPC = {
      dataMesCompetencia:     {nome: 'Data Competência', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
      dataMesReferencia:      {nome: 'Data Referência', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
      municipio:              {nome: 'Município'},
      uf:                     {nome: 'UF'},
      nis:                    {nome: 'Beneficiário NIS', dica: 'NIS do Beneficiário' },
      representanteNome:      {nome: 'Representante Legal'},
      representanteNis:       {nome: 'Representante NIS'},
      concedidoJudicialmente: {nome: 'Concedido Judicialmente', fn: (d) => this.utils.formataSimNao(d)},
      valor:                  {nome: 'Valor', fn: (d) => `R$ ${this.utils.converteEmDinheiro(d)}`},
      dataConsulta:           {nome: 'Data Consulta', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
    }

    dicionarioDadosAuxilioEmergencial = {
      mesDisponibilizacao:  {nome: 'Mês Disponibilização', fn: (d) => this.utils.formataData(d, 'MM/YYYY')},
      municipio:            {nome: 'Município'},
      uf:                   {nome: 'UF'},
      nis:                  {nome: 'Beneficiário NIS', dica: 'NIS do Beneficiário' },
      representanteNome:    {nome: 'Representante Legal'},
      representanteNis:     {nome: 'Representante NIS'},
      valor:                {nome: 'Valor', fn: (d) => `R$ ${this.utils.converteEmDinheiro(d)}`},
      dataConsulta:         {nome: 'Data Consulta', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
    }

    dicionarioDadosSeguroDefeso = {
      dataEmissaoParcela: {nome: 'Data Parcela', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
      dataSaque:          {nome: 'Data Saque', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
      municipio:          {nome: 'Município'},
      uf:                 {nome: 'UF'},
      nis:                {nome: 'Beneficiário NIS', dica: 'NIS do Beneficiário' },
      defeso:             {nome: 'Defeso'},
      parcela:            {nome: 'Parcela'},
      valor:              {nome: 'Valor', fn: (d) => `R$ ${this.utils.converteEmDinheiro(d)}`},
      dataConsulta:       {nome: 'Data Consulta', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
    }

    dicionarioDadosGarantiaSafra = {
      dataMesReferencia: {nome: 'Data Referência', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
      municipio:         {nome: 'Município'},
      uf:                {nome: 'UF'},
      nis:               {nome: 'Beneficiário NIS', dica: 'NIS do Beneficiário' },
      valor:             {nome: 'Valor', fn: (d) => `R$ ${this.utils.converteEmDinheiro(d)}`},
      dataConsulta:      {nome: 'Data Consulta', fn: (d) => this.utils.formataData(d, 'DD/MM/YYYY')},
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
      this.dadosBF                  = this.data.filter(d => d.fonte !== 'transparencia' && d.tipo === 'bolsa_familia');
      this.dadosCartaoAlimentacaoPB = this.data.filter(d => d.tipo === 'cartao_alimentacao_pb');


      this.dadosCartaoGovernoFederal= this.data.filter(d => d.fonte === 'transparencia' && d.tipo === 'cartao_gov_federal');
      this.dadosBFTransparencia     = this.data.filter(d => d.fonte === 'transparencia' && d.tipo === 'bolsa_familia');
      this.dadosBPC                 = this.data.filter(d => d.fonte === 'transparencia' && d.tipo === 'bpc');
      this.dadosAuxilioEmergencial  = this.data.filter(d => d.fonte === 'transparencia' && d.tipo === 'auxilio_emergencial');
      this.dadosSeguroDefeso        = this.data.filter(d => d.fonte === 'transparencia' && d.tipo === 'seguro_defeso');
      this.dadosGarantiaSafra       = this.data.filter(d => d.fonte === 'transparencia' && d.tipo === 'garantia_safra');
    }

}
