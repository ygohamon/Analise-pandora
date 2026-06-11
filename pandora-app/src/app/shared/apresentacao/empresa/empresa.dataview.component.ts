import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-dataview',
    template: `
      <app-pandora-dataview
        [values]="empresas"
        header="Dados Corporativos"
        orientacao="horizontal"
        [dict]="dicionarioDados">
      </app-pandora-dataview>
    `
})
export class EmpresaDataviewComponent {

    @Input() empresas;

    dicionarioDados = {
      anoReferencia:                 { nome: 'Ano Referência' },
      cnpj:                          { nome: 'CNPJ', fn: (x) =>  this.utils.formataDado(x, '##.###.###/####-##') },
      razaoSocial:                   { nome: 'Razão Social' },
      nomeFantasia:                  { nome: 'Nome Fantasia' },
      matriz:                        { nome: 'Matriz' },
      situacaoCadastral:             { nome: 'Situação Cadastral' },
      dataSituacaoCadastral:         { nome: 'Data Situação Cadastral', fn: (x) => this.utils.formataData(x) },
      dataInicioAtividade:           { nome: 'Data Início Atividade', fn: (x) => this.utils.formataData(x) },
      dataFimAtividade:              { nome: 'Data Fim Atividade', fn: (x) => this.utils.formataData(x) },
      dataConstituicao:              { nome: 'Data Contituição', fn: (x) => this.utils.formataData(x) },
      dataConstituicaoCredlink:      { nome: 'Data Contituição' },
      DataUltimaAlteracaoContratual: { nome: 'Data última atualização cadastral', fn: (x) => this.utils.formataData(x) },
      naturezaJuridica:              { nome: 'Natureza Jurídica'},
      porte:                         { nome: 'Porte'},
      capitalSocial:                 { nome: 'Capital Social', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
      cnaeFiscal:                    { nome: 'CNAE Fiscal' },
      cnaeSecundario:                { nome: 'CNAE Secundário' },
      cnaeSecao:                     { nome: 'Seção' },
      cnaeDivisao:                   { nome: 'Divisão' },
      cnaeGrupo:                     { nome: 'Grupo' },
      cnaeClasse:                    { nome: 'Classe' },
      cnaeSubClasse:                 { nome: 'Sub Classe' },
      cpfResponsavel:                { nome: 'Responsável - CPF', fn: (x) =>  this.utils.formataDado(x, '###.###.###-##') },
      nomeResponsavel:               { nome: 'Responsável - Nome' },
      enderecoEmpresa:               { nome: 'Endereço' },
      iptu:                          { nome: 'IPTU' },
      operadora:                     { nome: 'Operadora' },
      telefone:                      { nome: 'Telefone' },
      emails:                        { nome: 'E-mails' },
      procon:                        { nome: 'Procon' },
      info_restricao:                { nome: 'Restrição' },
      restricoes_bancarias:          { nome: 'Restrições bancárias' },
      restricoes_lojistas:           { nome: 'Restrições Logistas' },
      cheques_pre_datados:           { nome: 'Cheques pré-datados' },
      alertas:                       { nome: 'Alertas' },
      fonte:                         { nome: 'Fonte' },
    }

    constructor(
      public utils: UtilsService
    ) {}
}
