import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../services/common/utils.service';

@Component({
  selector: 'app-aeronave-table',
  templateUrl: './aeronave.table.component.html'
})
export class AeronaveTableComponent implements OnChanges {

  @Input() data;

  dadosProprietario;
  dadosOperador;

  // Colunas para a tabela
  dicionarioDadosProprietario = {
    operador  : {nome: 'Operador' },
    uf2       : {nome: 'UF' },
    cpf_cnpj2 : {nome: 'CPF/CNPJ' },
    marca     : {nome: 'Marca' },
    matricula : {nome: 'Matrícula' },
    modelo    : {nome: 'Modelo' },
    fabricante: {nome: 'Fabricante' },
    ano_fab   : {nome: 'Ano Fabricação' },
    dt_iam    : {nome: 'Inspeção' },
    fonte     : {nome: 'Fonte' },
  }

  dicionarioDadosOperador = {
    proprietario: {nome: 'Proprietário' },
    uf          : {nome: 'UF' },
    cpf_cnpj    : {nome: 'CPF/CNPJ' },
    marca       : {nome: 'Marca' },
    matricula   : {nome: 'Matrícula' },
    modelo      : {nome: 'Modelo' },
    fabricante  : {nome: 'Fabricante' },
    ano_fab     : {nome: 'Ano Fabricação' },
    dt_iam      : {nome: 'Inspeção' },
    fonte       : {nome: 'Fonte' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges () {
    this.dadosProprietario = this.data.filter(d => d.tipo === 'proprietario').map((dado, i) => Object.assign(dado, {id: i}))
    this.dadosOperador     = this.data.filter(d => d.tipo === 'operador').map((dado, i) => Object.assign(dado, {id: i}));
  }
}
