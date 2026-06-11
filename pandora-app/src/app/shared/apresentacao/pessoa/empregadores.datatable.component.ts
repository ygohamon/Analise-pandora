import { Component, Input, OnChanges } from '@angular/core';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-empregadores-datatable',
    templateUrl: './empregadores.datatable.component.html'
})
export class EmpregadoresDatatableComponent implements OnChanges {

  @Input() data;

  dataRAIS;

  dicionarioDadosRAIS = {
    ano              : { nome: 'Ano' },
    cnpj             : { nome: 'CNPJ' },
    razaoSocial      : { nome: 'Razão Social' },
    municipio        : { nome: 'Município' },
    uf               : { nome: 'UF' },
    cargo            : { nome: 'Cargo' },
    cargaHoraria     : { nome: 'Carga Horária' },
    salarioContratado: { nome: 'Salário Contratado' },
  };

  dicionarioDadosExpandRAIS = {
    pis              : { nome: 'PIS' },
    ctpsNumero       : { nome: 'CTPS', fnRow           : (x) => `${x.ctpsNumero}-${x.ctpsSerie}` },
    sinonimos        : { nome: 'Possíveis Cargos' },
    dtAdmissao       : { nome: 'Data Admissão', fn     : (x) => this.utils.formataData(x) },
    tipoAdmissao     : { nome: 'Tipo Admissão' },
    tipoVinculo      : { nome: 'Tipo Vínculo' },
    dtDesligamento   : { nome: 'Data Desligamento', fn : (x) => this.utils.formataData(x) },
    causaDesligamento: { nome: 'Causa Desligamento' },
    salarioAnual     : { nome: 'Salário Anual', fn     : (x) => this.utils.converteEmDinheiro(x) },
    mesesTrabalhados : { nome: 'Meses Trabalhados' },
    salarioContratado: { nome: 'Salário Contratado', fn: (x) => this.utils.converteEmDinheiro(x) },
    tipoSalario      : { nome: 'Tipo' },
  };

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.dataRAIS = this.data
      .filter(dado => dado.fonte === 'RAIS')
      .map((dado, idx) => Object.assign(dado, {id: idx}));
  }
}
