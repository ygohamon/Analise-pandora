import { Component, Input, OnInit } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-obito-dataview',
    template: `
      <app-pandora-dataview
        [values]="obitos"
        header="Dados dos Óbitos"
        [dict]="dicionarioDados"
        orientacao="horizontal"
        >
      </app-pandora-dataview>
    `
})

export class ObitosDataviewComponent {

    @Input() obitos;

    dicionarioDados = {

      obito_cnpjServentia:            {nome: 'CNPJ Serventia', fn: (x) => this.utils.formataDado(x, '##.###.###/####-##') },
      obito_nomeFantasia:             {nome: 'Nome Fantasia da Serventia'},
      obito_razaoSocial:              {nome: 'Razão Social da Serventia'},
      obito_endereco:                 {nome: 'Endereço Serventia'},
      obito_municipioServentia:       {nome: 'Municipio Serventia'},
      obito_numero:                   {nome: 'Numero Serventia'},
      obito_complemento:              {nome: 'Complemento Serventia'},
      obito_bairro:                   {nome: 'Bairro Serventia'},
      obito_ufServentia:              {nome: 'UF Serventia'},
      obito_cep:                      {nome: 'CEP Serventia'},
      obito_distrito:                 {nome: 'Distrito Serventia'},
      obito_subDistrito:              {nome: 'SubDistrito Serventia'},
      obito_fax:                      {nome: 'FAX da Serventia'},
      obito_site:                     {nome: 'Site da Serventia', url : true},
      obito_emailServentia:           {nome: 'Email da Serventia'},
      obito_numeroTelefonePrincipal:  {nome: 'Telefone Principal Serventia'},
      obito_numeroTelefoneSecundario: {nome: 'Telefone Secundario Serventia'},
      obito_dataInicioAtividades:     {nome: 'Data de Inicio das Atividades', fn: (x) => this.utils.formataData(x)},
      obito_dataExclusao:             {nome: 'Data de Exclusão', fn: (x) => this.utils.formataData(x)},
      obito_dataAtualizacao:          {nome: 'Data Atualização', fn: (x) => this.utils.formataData(x)},

      obito_nome:                     {nome: 'Nome', categoria: 'Dados Falecido'},
      obito_cpf:                      {nome: 'CPF', fn: (x) =>  this.utils.formataDado(x, '###.###.###-##')},
      obito_dataNascimento:           {nome: 'Data de Nascimento', fn: (x) => this.utils.formataData(x)},
      obito_ufNaturalidade:           {nome: 'UF Naturalidade'},
      obito_naturalidade:             {nome: 'Naturalidade'},
      obito_dataOperacao:             {nome: 'Data da Operação', fn: (x) => this.utils.formataData(x)},
      obito_matricula:                {nome: 'Matricula'},
      obito_obito_nomePai:            {nome: 'Nome do Pai'},
      obito_obito_nomeMae:            {nome: 'Nome da Mãe'},
      obito_metodoBuscaCpf:           {nome: 'Metodo de Busca'},
      obito_municipioNaturalidade:    {nome: 'Municipio Naturalidade'},
      obito_sexo:                     {nome: 'Sexo'},
      obito_tipoOperacao:             {nome: 'Tipo de Operação'},

      obito_municipioÓbito:           {nome: 'Municipio Óbito'},
      obito_ufObito:                  {nome: 'UF Óbito'},
      obito_dataObito:                {nome: 'Data do Óbito', fn: (x) => this.utils.formataData(x)},
      obito_livro:                    {nome: 'Numero do Livro de Óbito'},
      obito_folha:                    {nome: 'Numero da Folha de Óbito'},
      obito_termo:                    {nome: 'Numero do Termo de Óbito'},
      fonte:                          {nome: 'Fonte'},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
