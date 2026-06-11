import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-pessoa-imovel-table',
  template: `
    <pandora-table
      caption="Imóveis - Dados do Imovel"
      exportFilename="imoveis_doi_itbi"
      [value]="dadosITBI"
      [dicionarioDados]="dicionarioDadosITBI"
    >
      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{ col.header }}</span>

            <span *ngSwitchCase="'cpfCnPJAnterior'">
              <a
                *ngIf="rowData.cpfCnPJAnterior && rowData.cpfCnPJAnterior.length === 11"
                [routerLink]="['/dashboard/pesquisa/integrado/pessoa']"
                [queryParams]="{
                  cpf: utils.codificaDado(rowData.cpfCnPJAnterior)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cpfCnPJAnterior, '###.###.###-##')
                }}</a
              >
              <a
                *ngIf="rowData.cpfCnPJAnterior && rowData.cpfCnPJAnterior.length === 14"
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cpfCnPJAnterior)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(
                    rowData.cpfCnPJAnterior,
                    '##.###.###/####-##'
                  )
                }}</a
              >
            </span>

            <span *ngSwitchCase="'cpfCnpj'">
              <a
                *ngIf="rowData.cpfCnpj.length === 11"
                [routerLink]="['/dashboard/pesquisa/integrado/pessoa']"
                [queryParams]="{ cpf: utils.codificaDado(rowData.cpfCnpj) }"
                style="color: #3984b8;"
                >{{ utils.formataDado(rowData.cpfCnpj, '###.###.###-##') }}</a
              >
              <a
                *ngIf="rowData.cpfCnpj.length === 14"
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{ cnpj: utils.codificaDado(rowData.cpfCnpj) }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cpfCnpj, '##.###.###/####-##')
                }}</a
              >
            </span>

            <span *ngSwitchCase="'valorMercado'"
              >R$ {{ utils.converteEmDinheiro(rowData.valorMercado) }}</span
            >
            <span *ngSwitchCase="'valorAvaliacao'"
              >R$ {{ utils.converteEmDinheiro(rowData.valorAvaliacao) }}</span
            >
            <span *ngSwitchCase="'dtAvaliacao'">{{
              utils.formataData(rowData.dtAvaliacao)
            }}</span>
            <span *ngSwitchCase="'dtLancamento'">{{
              utils.formataData(rowData.dtLancamento)
            }}</span>
            <span *ngSwitchCase="'areaPrivTotal'"
              >{{ rowData.areaPrivTotal }} m²</span
            >

            <span *ngSwitchDefault>{{ rowData[col.field] }}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>

    <pandora-table
      caption="Imóveis - Alienante"
      exportFilename="imoveis_doi_alientante"
      [value]="dadosAlienante"
      dataKey="id"
      [mostraEspacamentoExpand]="true"
      [dicionarioDadosExpand]="dicionarioDadosExpand"
      [dicionarioDados]="dicionarioDadosDOI"
    >
      <ng-template
        pTemplate="body"
        let-expanded="expanded"
        let-rowData
        let-columns="columns"
      >
        <tr>
          <td>
            <a href="#" [pandoraRowToggler]="rowData">
              <i
                class="pointer"
                [ngClass]="
                  expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
                "
              ></i>
            </a>
          </td>

          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{ col.header }}</span>

            <span *ngSwitchCase="'cartorioCnpj'">
              <a
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cartorioCnpj)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cartorioCnpj, '##.###.###/####-##')
                }}</a
              >
            </span>

            <span *ngSwitchCase="'cpfCnpjAlienante'">
              <a
                *ngIf="rowData.cpfCnpjAlienante.length === 11"
                [routerLink]="['/dashboard/pesquisa/integrado/pessoa']"
                [queryParams]="{
                  cpf: utils.codificaDado(rowData.cpfCnpjAlienante)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cpfCnpjAlienante, '###.###.###-##')
                }}</a
              >
              <a
                *ngIf="rowData.cpfCnpjAlienante.length === 14"
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cpfCnpjAlienante)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(
                    rowData.cpfCnpjAlienante,
                    '##.###.###/####-##'
                  )
                }}</a
              >
            </span>

            <span *ngSwitchCase="'cpfCnpjAdquirente'">
              <a
                *ngIf="rowData.cpfCnpjAdquirente.length === 11"
                [routerLink]="['/dashboard/pesquisa/integrado/pessoa']"
                [queryParams]="{
                  cpf: utils.codificaDado(rowData.cpfCnpjAdquirente)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cpfCnpjAdquirente, '###.###.###-##')
                }}</a
              >
              <a
                *ngIf="rowData.cpfCnpjAdquirente.length === 14"
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cpfCnpjAdquirente)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(
                    rowData.cpfCnpjAdquirente,
                    '##.###.###/####-##'
                  )
                }}</a
              >
            </span>

            <span *ngSwitchCase="'dataCarga'">{{
              utils.formataData(rowData.dataCarga)
            }}</span>
            <span *ngSwitchCase="'dataLavratura'">{{
              utils.formataData(rowData.dataLavratura)
            }}</span>

            <span *ngSwitchDefault>{{ rowData[col.field] }}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>

    <pandora-table
      caption="Imóveis - Adquirente"
      exportFilename="imoveis_doi_adquirente"
      [value]="dadosAdquirente"
      dataKey="id"
      [mostraEspacamentoExpand]="true"
      [dicionarioDadosExpand]="dicionarioDadosExpand"
      [dicionarioDados]="dicionarioDadosDOI"
    >
      <ng-template
        pTemplate="body"
        let-expanded="expanded"
        let-rowData
        let-columns="columns"
      >
        <tr>
          <td>
            <a href="#" [pandoraRowToggler]="rowData">
              <i
                class="pointer"
                [ngClass]="
                  expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
                "
              ></i>
            </a>
          </td>

          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{ col.header }}</span>

            <span *ngSwitchCase="'cartorioCnpj'">
              <a
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cartorioCnpj)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cartorioCnpj, '##.###.###/####-##')
                }}</a
              >
            </span>

            <span *ngSwitchCase="'cpfCnpjAlienante'">
              <a
                *ngIf="rowData.cpfCnpjAlienante.length === 11"
                [routerLink]="['/dashboard/pesquisa/integrado/pessoa']"
                [queryParams]="{
                  cpf: utils.codificaDado(rowData.cpfCnpjAlienante)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cpfCnpjAlienante, '###.###.###-##')
                }}</a
              >
              <a
                *ngIf="rowData.cpfCnpjAlienante.length === 14"
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cpfCnpjAlienante)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(
                    rowData.cpfCnpjAlienante,
                    '##.###.###/####-##'
                  )
                }}</a
              >
            </span>

            <span *ngSwitchCase="'cpfCnpjAdquirente'">
              <a
                *ngIf="rowData.cpfCnpjAdquirente.length === 11"
                [routerLink]="['/dashboard/pesquisa/integrado/pessoa']"
                [queryParams]="{
                  cpf: utils.codificaDado(rowData.cpfCnpjAdquirente)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(rowData.cpfCnpjAdquirente, '###.###.###-##')
                }}</a
              >
              <a
                *ngIf="rowData.cpfCnpjAdquirente.length === 14"
                [routerLink]="['/dashboard/pesquisa/integrado/empresa']"
                [queryParams]="{
                  cnpj: utils.codificaDado(rowData.cpfCnpjAdquirente)
                }"
                style="color: #3984b8;"
                >{{
                  utils.formataDado(
                    rowData.cpfCnpjAdquirente,
                    '##.###.###/####-##'
                  )
                }}</a
              >
            </span>

            <span *ngSwitchCase="'dataCarga'">{{
              utils.formataData(rowData.dataCarga)
            }}</span>
            <span *ngSwitchCase="'dataLavratura'">{{
              utils.formataData(rowData.dataLavratura)
            }}</span>

            <span *ngSwitchDefault>{{ rowData[col.field] }}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  `,
})
export class PessoaImovelTableComponent implements OnInit {
  @Input() dados;

  dadosITBI;

  dadosAlienante;
  dadosAdquirente;

  dicionarioDadosDOI = {
    cartorioCnpj: { nome: 'CNPJ' },
    cartorioMunicipio: { nome: 'Município' },
    cartorioUf: { nome: 'UF' },
    cartorioRazaoSocial: { nome: 'Razão Social' },
    dataLavratura: { nome: 'Data Lavratura' },
    cpfCnpjAlienante: { nome: 'CPF-CNPJ Alienante' },
    alienante: { nome: 'Alienante' },
    cpfCnpjAdquirente: { nome: 'CPF-CNPJ Adquirente' },
    adquirente: { nome: 'Adquirente' },
    dataCarga: { nome: 'Data Carga' },
  };

  dicionarioDadosExpand = {
    livro: { nome: 'Livro' },
    folha: { nome: 'Folha' },
    matricula: { nome: 'Matrícula' },
    registro: { nome: 'Registro' },
  };

  dicionarioDadosITBI = {
    proprietarioAnterior: { nome: 'Vendedor' },
    cpfCnPJAnterior: { nome: 'Doc - Vendedor' },
    nome: { nome: 'Nome' },
    logradouro: { nome: 'Logradouro' },
    bairro: { nome: 'Bairro' },
    natureza: { nome: 'Natureza' },
    valorMercado: { nome: 'V.Mercado' },
    valorAvaliacao: { nome: 'V.Avaliação' },
    areaPrivTotal: { nome: 'Área Total' },
    dtAvaliacao: { nome: 'Data Avaliação' },
    dtLancamento: { nome: 'Data Lançamento' },
  };

  constructor(public utils: UtilsService) {}

  ngOnInit() {
    this.dadosITBI = this.dados.filter((d) => d.fonte.toUpperCase() === 'ITB');

    this.dadosAlienante = this.dados
      .filter((d) => d.fonte.toUpperCase() === 'DOI' && d.tipo === 'alienante')
      .map((d, i) => Object.assign(d, { id: i }));
    this.dadosAdquirente = this.dados
      .filter((d) => d.fonte.toUpperCase() === 'DOI' && d.tipo === 'adquirente')
      .map((d, i) => Object.assign(d, { id: i }));
  }
}
