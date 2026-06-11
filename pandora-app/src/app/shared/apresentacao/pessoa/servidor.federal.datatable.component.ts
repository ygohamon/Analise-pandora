import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-servidor-federal-datatable',
    template: `
      <pandora-table
        *ngIf="dadosAPITransparencia.length > 0"
        [styleClass]="'pb-2'"
        caption="Folha de Pagamento - Fonte: Transparência Federal"
        exportFilename="servidor_federal_api"
        [value]="dadosAPITransparencia"
        dataKey="id"
        [mostraEspacamentoExpand]="true"
        [dicionarioDadosExpand]="dicionarioDadosExpandTransparencia"
        [dicionarioDados]="dicionarioDadosTransparencia">
      </pandora-table>

      <pandora-table
        *ngIf="dados.length > 0"
        [styleClass]="'pb-2'"
        caption="Folha de Pagamento - Fonte: BD"
        exportFilename="servidor_federal_bd"
        [value]="dados"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class ServidorFederalDatatableComponent implements OnChanges {

    @Input() data;

    dadosAPITransparencia;
    dados;

    dicionarioDados = {
      cargo             : {nome: 'Cargo' },
      funcaoAtividade   : {nome: 'Atividade' },
      unidOrgLotacao    : {nome: 'Unidade' },
      orgLotacao        : {nome: 'Lotação' },
      dataIngressoCargo : {nome: 'Ingresso Cargo' },
      dataIngressoOrgao : {nome: 'Ingresso Orgão' },
      ufExercicio       : {nome: 'UF Exercício' },
      remuneracao       : {nome: 'Remuneração', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
    }

    dicionarioDadosTransparencia = {
      orgaoSuperiorLotacao : {nome: 'Órgão Superior' },
      orgaoServidorLotacao : {nome: 'Órgão Lotação' },
      uorgLotacao          : {nome: 'UG Lotação' },
      dataIngressoOrgao    : {nome: 'Ingresso Orgão', fn: this.utils.formataData },
      cargo                : {nome: 'Cargo' },
      dataIngressoCargo    : {nome: 'Ingresso Cargo', fn: this.utils.formataData },
      situacao             : {nome: 'Situação' },
      funcao               : {nome: 'Função' },
      funcaoAtividade      : {nome: 'Atividade' },
      dataIngressoFuncao   : {nome: 'Ingresso Função', fn: this.utils.formataData },
      dataConsulta         : {nome: 'Data Consulta', fn: this.utils.formataData },
    }

    dicionarioDadosExpandTransparencia = {
      classeCargo     : { nome: 'Classe Cargo' },
      jornadaTrabalho : { nome: 'Jornada Trabalho' },
      uorgExercicio : { nome: 'UG Exercício' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
      this.dados                 = this.data.filter(d => d.fonte !== 'transparencia');
      this.dadosAPITransparencia = this.data.filter(d => d.tipo === 'servidor' && d.fonte === 'transparencia');
    }
}
