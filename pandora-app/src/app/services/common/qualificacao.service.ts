import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';

import { sortBy } from 'lodash-es';

@Injectable()
export class QualificacaoService {

  constructor(
    private utils: UtilsService
  ) {}

  processaPessoa(dadosEncontrados) {
    if (!dadosEncontrados.pessoa) return null;

    let pessoaResultado = {};

    // Preferencia pela fonte CTX
    const pessoaRF = (dadosEncontrados.pessoa.filter(d => d.fonte.startsWith('CTX')).length) ?
      this.utils.first(dadosEncontrados.pessoa.filter(d => d.fonte.startsWith('CTX'))):
      this.utils.first(sortBy(dadosEncontrados.pessoa.filter(d => d.fonte.startsWith('RF')), d => d.fonte).reverse());

    if (!!pessoaRF) {
      pessoaResultado = Object.assign(pessoaResultado, {nome: pessoaRF.nome});
      pessoaResultado = Object.assign(pessoaResultado, {nomeMae: pessoaRF.nomeMae});
      pessoaResultado = Object.assign(pessoaResultado, {cpf: pessoaRF.cpf});
      pessoaResultado = Object.assign(pessoaResultado, {rg: pessoaRF.rg});
      pessoaResultado = Object.assign(pessoaResultado, {dataNascimento: pessoaRF.dataNascimento});
      pessoaResultado = Object.assign(pessoaResultado, {sexo: this.utils.toUpperCase(pessoaRF.sexo)});
    }

    const pessoaLINC = dadosEncontrados.pessoa.filter(d => d.fonte === 'LIC')[0];
    if (!!pessoaLINC) {
      pessoaResultado = Object.assign(pessoaResultado, {nome: pessoaLINC.nome});
      pessoaResultado = Object.assign(pessoaResultado, {nomeMae: pessoaLINC.nomeMae});
      pessoaResultado = Object.assign(pessoaResultado, {cpf: pessoaLINC.cpf});
      pessoaResultado = Object.assign(pessoaResultado, {rg: pessoaLINC.rg});
      pessoaResultado = Object.assign(pessoaResultado, {dataNascimento: pessoaLINC.dataNascimento});
      pessoaResultado = Object.assign(pessoaResultado, {sexo: this.utils.toUpperCase(pessoaLINC?.sexo)});
    }

    const pessoaTSE = dadosEncontrados.pessoa.filter(d => d.fonte === 'TSE2019')[0];
    if (!!pessoaTSE) {
      const nomePai = (pessoaTSE.nomePai !== 'NAO CONSTA' && pessoaTSE.nomePai !== 'NÃO CONSTA') ? pessoaTSE.nomePai : null;
      pessoaResultado = Object.assign(pessoaResultado, {nomePai});
      pessoaResultado = Object.assign(pessoaResultado, {tituloEleitor: pessoaTSE.tituloEleitor});
    }

    const pessoaIPC = dadosEncontrados.pessoa.filter(d => d.fonte === 'IPC')[0];
    if (!!pessoaIPC) {
      // const nomePai = (pessoaIPC.nomePai !== pessoaIPC.nomeMae) ? pessoaIPC.nomePai : null;
      // tslint:disable-next-line: max-line-length
      // pessoaResultado = (nomePai && !pessoaResultado?.nomePai as any) ? Object.assign(pessoaResultado, {nomePai: pessoaIPC.nomePai}) : pessoaResultado;
      pessoaResultado = Object.assign(pessoaResultado, {naturalidade: pessoaIPC.naturalidade});
      pessoaResultado = Object.assign(pessoaResultado, {ufNaturalidade: pessoaIPC.ufNaturalidade});
    }

    const pessoaDetran = dadosEncontrados.pessoa.filter(d => d.fonte === 'DETRAN')[0];
    if(!!pessoaDetran){
      pessoaResultado = Object.assign(pessoaResultado, {nome: pessoaDetran.nome});
    }

    if (dadosEncontrados.endereco) {
      const endereco = (dadosEncontrados.endereco.filter(d => d.fonte.startsWith('CTX')).length) ?
        this.utils.first(dadosEncontrados.endereco.filter(d => d.fonte.startsWith('CTX'))):
        this.utils.first(sortBy(dadosEncontrados.endereco.filter(d => d.fonte.startsWith('RF')), d => d.fonte).reverse());

      if (endereco) {
        pessoaResultado = Object.assign(pessoaResultado, {endereco: {
          tipoLogradouro: endereco.tipoLogradouro,
          logradouro: endereco.logradouro,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cep: endereco.cep,
          municipio: endereco.municipio,
          uf: endereco.uf,
        }});
      }
    }

    if (!dadosEncontrados.endereco && pessoaLINC) {
      const endereco = pessoaLINC.logradouro.length ? this.utils.first(pessoaLINC.enderecos) : '';

      if (endereco) {
        pessoaResultado = Object.assign(pessoaResultado, {endereco: {
          tipoLogradouro: endereco.tipoLogradouro,
          logradouro: endereco.logradouro,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cep: endereco.cep,
          municipio: endereco.cidade,
          uf: endereco.estado
        }})
      }
    }

    return pessoaResultado;
  }

  getTemplatePessoa(pessoa) {
    return this.getTemplateCPF(pessoa)
         + this.getTemplateRG(pessoa)
         + this.getTemplateDataNascimento(pessoa)
         + this.getTemplateNaturalidade(pessoa)
         + this.getTemplatePaternidade(pessoa)
         + this.getTemplateEndereco(pessoa);
  }

  private getTemplateCPF(pessoa) {
    if (!pessoa.cpf) return '';

    let template = `, ${(pessoa.sexo === 'MASCULINO' || pessoa.sexo === 'M') ? 'portador' : 'portadora'} `;
    template += `do CPF nº ${this.utils.formataDado(pessoa.cpf, '###.###.###-##')}`;

    return template;
  }

  private getTemplateRG(pessoa) {
    if (!pessoa.rg) return '';

    let template = `, ${(pessoa.sexo === 'MASCULINO' || pessoa.sexo === 'M') ? 'portador' : 'portadora'} `;
    template += `do RG nº ${pessoa.rg}`;

    return template;
  }


  private getTemplateDataNascimento(pessoa) {
    if (!pessoa.dataNascimento) return '';

    let dataFormatada = this.utils.formataData(pessoa.dataNascimento).split('/').join('.');
    dataFormatada = dataFormatada.slice(0, 6) + dataFormatada.slice(8, 10);

    let template = `, ${(this.utils.toUpperCase(pessoa.sexo) === 'MASCULINO' || this.utils.toUpperCase(pessoa.sexo) ===  'M') ? 'nascido' : 'nascida'} `;
    template += `em ${dataFormatada}`;
    return template;
  }

  private getTemplateNaturalidade(pessoa) {
    if (!pessoa.naturalidade) return '';
    return `, natural de ${this.utils.toUpperCase(pessoa.naturalidade)} - ${this.utils.toUpperCase(pessoa.ufNaturalidade)}`;
  }

  private getTemplatePaternidade(pessoa) {
    if (!pessoa.nomeMae && !pessoa.nomePai) return '';

    let template =  `, ${(this.utils.toUpperCase(pessoa.sexo) === 'MASCULINO' || this.utils.toUpperCase(pessoa.sexo) === 'M') ? 'filho' : 'filha'} de `;
    template += `${pessoa.nomeMae}`
    template += `${(pessoa.nomePai) ? ` e de ${pessoa.nomePai}` : ''}`
    return template;
  }

  private getTemplateEndereco(pessoa) {
    if (!pessoa.endereco) return '';

    let template =  `, ${(this.utils.toUpperCase(pessoa.sexo) === 'MASCULINO' || this.utils.toUpperCase(pessoa.sexo) === 'M') ? 'domiciliado' : 'domiciliada'} no(a) `;
    template +=  `${(pessoa.endereco.tipoLogradouro && pessoa.endereco.tipoLogradouro !== 'OUTROS') ? pessoa.endereco.tipoLogradouro + ' ' : ''}`;
    template += `${(pessoa.endereco.logradouro) ? `${pessoa.endereco.logradouro}, ` : ''} ${(pessoa.endereco.numero) ? `nº ${pessoa.endereco.numero}, ` : ''} ${(pessoa.endereco.bairro) ?`${pessoa.endereco.bairro}, `: ''} ${(pessoa.endereco.cep) ? `CEP ${this.utils.formataDado(pessoa.endereco.cep, "#####-###")}, ` : ''} cidade de ${pessoa.endereco.municipio}/${pessoa.endereco.uf}`;
    return template;
  }

}
