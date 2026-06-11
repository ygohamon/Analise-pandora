import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-dataview',
    template: `
      <app-pandora-dataview
        [values]="pessoas"
        header="Dados Pessoais"
        [dict]="dicionarioDados"
        orientacao="horizontal"
        >
      </app-pandora-dataview>
    `
})
export class PessoaDataviewComponent {

    @Input() pessoas;

    dicionarioDados = {
      nome:                   {nome: 'Nome'},
      cpf:                    {nome: 'CPF', fn: (x) =>  this.utils.formataDado(x, '###.###.###-##')},
      dataNascimento:         {nome: 'Data de Nascimento', fn: (x) => this.utils.formataData(x)},
      naturalidade:           {nome: 'Naturalidade', fnRow: (row) =>  (row.ufNaturalidade) ? `${row.naturalidade} - ${row.ufNaturalidade}`: `${row.naturalidade}`},
      situacaoCadastral:      {nome: 'Situação Cadastral'},
      tituloEleitor:          {nome: 'Título Eleitoral'},
      tituloSecao:            {nome: 'Seção Eleitoral', fnRow: (row) => `${row.tituloSecao} - Zona ${row.tituloZona}`},
      carteiraProfNum:        {nome: 'Carteira Profissional', fnRow: (row) => `${row.carteiraProfNum} - ${row.carteiraProfSerie} / ${row.carteiraProfUf}`},
      sexo:                   {nome: 'Sexo', fn: this.utils.formataSexo},
      nomeMae:                {nome: 'Nome da Mãe'},
      nomePai:                {nome: 'Nome do Pai'},
      conjuge:                {nome: 'Cônjuge'},
      estadoCivil:            {nome: 'Estado Civil'},
      escolaridade:           {nome: 'Escolaridade'},
      estrangeiro:            {nome: 'Estrangeiro'},
      residenteExterior:      {nome: 'Residente no Exterior'},
      nomePaisExterior:       {nome: 'País Exterior'},
      naturezaOcupacao:       {nome: 'Natureza da Ocupação'},
      anoExercicioOcupacao:   {nome: 'Ano da Ocupação'},
      tipoOcupacaoPrincipal:  {nome: 'Tipo da Ocupação Principal'},
      ocupacaoPrincipal:      {nome: 'Ocupação Principal'},
      anoObito:               {nome: 'Ano do Óbito'},
      obito:                  {nome: 'Óbito'}, //credlink
      reservista:             {nome: 'Reservista'},
      reservistaCirc:         {nome: 'Reservista Circunscrição', fnRow: (row) => `${row.reservistaCirc} - Série ${row.reservistaSerie}`},
      rg:                     {nome: 'RG', fnRow: (row) => (row.orgEmissorRg && row.ufOrgEmissorRG) ? `${row.rg} - ${row.orgEmissorRg} / ${row.ufOrgEmissorRG}`: ((row.orgEmissorRg) ? `${row.rg} - ${row.orgEmissorRg}`: `${row.rg}` )},
      dataExpedicao:          {nome: 'Data Expedição', fn: (x) => this.utils.formataData(x)},
      renach:                 {nome: 'RENACH'},
      cnh:                    {nome: 'CNH', fnRow: (row) => (row.catAtual) ? `${row.cnh} - Categoria ${row.catAtual}` : `${row.cnh}`},
      dtPsicotecnico:         {nome: 'Exame Psicotécnico', fnRow: (row) => `${row.resPsicotecnico} - ${this.utils.formataData(row.dtPsicotecnico)}`},
      dtMedico:               {nome: 'Exame Médico', fnRow: (row) => `${row.resMedico} - ${this.utils.formataData(row.dtMedico)}`},
      dtLegislacao:           {nome: 'Exame Legislação', fnRow: (row) => `${row.resLegislacao} - ${this.utils.formataData(row.dtLegislacao)}`},
      logradouro:             {nome: 'Logradouro'},
      cep:                    {nome: 'CEP'}, // credlink
      bairro:                 {nome: 'Bairro'},
      numero:                 {nome: 'Número' }, // credlink
      uf:                     {nome: 'Estado' }, // credlink
      municipio:              {nome: 'Municipio'},
      iptu:                   {nome: 'IPTU'}, // credlink
      operadora:              {nome: 'Operadora'}, // credlink
      telefone:               {nome: 'Telefone'}, // credlink
      whatsapp:               {nome: 'Whatsapp'}, // credlink
      emails:                 {nome: 'E-mails'}, // credlink
      procon:                 {nome: 'Procon'}, // credlink
      dataAtualizacao:        {nome: 'Data Atualização', fn: (x) => this.utils.formataData(x)},
      fonte:                  {nome: 'Fonte'},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
