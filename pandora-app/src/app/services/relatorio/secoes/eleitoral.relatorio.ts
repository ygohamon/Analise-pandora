import { Injectable, Inject } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from './../relatorio.utils';

@Injectable()
export class RelatorioSecaoEleitoralService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  private criaTabelaInformacoesCandidato(registros) {
    const headerTabela = [['Ano', 'Situação', 'UE', 'UF', 'Cargo', 'Partido', 'Número', 'Nome', 'Coligação', 'Nome Coligação']];
    const corpoTabela = registros.map(d => {
      return [
        (d.ano)           ? d.ano : '',
        (d.situacao)      ? d.situacao : '',
        (d.ue)            ? d.ue : '',
        (d.uf)            ? d.uf : '',
        (d.cargo)         ? d.cargo : '',
        (d.partido)       ? d.partido : '',
        (d.numCandidato)  ? d.numCandidato : '',
        (d.nomeUrna)      ? d.nomeUrna : '',
        (d.coligacao)     ? d.coligacao : '',
        (d.nomeColigacao) ? d.nomeColigacao : '',
      ];
    });

    return {
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto'],
      body: this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela)
    }
  };

  private criaTabelaDoacoesFeitas(registros) {
    const headerTabela = [['Ano', 'UE', 'UF', 'Cargo', 'Partido', 'Número', 'CPF', 'Nome', 'Qtd Doações', 'Valor Total']];
    const corpoTabela = registros.map(d => {
      return [
        (d.ano)             ? d.ano : '',
        (d.ue)              ? d.ue : '',
        (d.uf)              ? d.uf : '',
        (d.cargo)           ? d.cargo : '',
        (d.partido)         ? d.partido : '',
        (d.numeroCandidato) ? d.numeroCandidato : '',
        (d.cpf)             ? this.utils.formataDado(d.cpf, '###.###.###-##') : '',
        (d.nome)            ? d.nome : '',
        (d.qtd)             ? d.qtd : '',
        (d.valor)           ? `R$ ${this.utils.converteEmDinheiro(d.valor)}` : '',
      ];
    });

    return {
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
      body: this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela)
    }
  };

  private criaTabelaDoacoesRecebidas(registros) {
    const headerTabela = [['Ano', 'UE', 'UF', 'Qtd Doações', 'Menor Doação', 'Maior Doação', 'Média', 'Valor Total']];
    const corpoTabela = registros.map(d => {
      return [
        (d.ano)   ? d.ano : '',
        (d.ue)    ? d.ue : '',
        (d.uf)    ? d.uf : '',
        (d.qtd)   ? d.qtd : '',
        (d.menor) ? `R$ ${this.utils.converteEmDinheiro(d.menor)}` : '',
        (d.maior) ? `R$ ${this.utils.converteEmDinheiro(d.maior)}` : '',
        (d.media) ? `R$ ${this.utils.converteEmDinheiro(d.media)}` : '',
        (d.valor) ? `R$ ${this.utils.converteEmDinheiro(d.valor)}` : '',
      ];
    });

    return {
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto'],
      body: this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela)
    }
  };

  private criaTabelaGastos(registros) {
    const headerTabela = [['Ano', 'UF', 'Cargo', 'Qtd Doações', 'Menor Doação', 'Maior Doação', 'Média', 'Valor Total']];
    const corpoTabela = registros.map(d => {
      return [
        (d.ano)   ? d.ano : '',
        (d.uf)    ? d.uf : '',
        (d.cargo) ? d.cargo : '',
        (d.qtd)   ? d.qtd : '',
        (d.menor) ? `R$ ${this.utils.converteEmDinheiro(d.menor)}` : '',
        (d.maior) ? `R$ ${this.utils.converteEmDinheiro(d.maior)}` : '',
        (d.media) ? `R$ ${this.utils.converteEmDinheiro(d.media)}` : '',
        (d.valor) ? `R$ ${this.utils.converteEmDinheiro(d.valor)}` : '',
      ];
    });

    return {
      widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela)
    }
  };

  private criaTabelaCandidatosFornecidos(registros) {
    const headerTabela = [['Ano', 'UE', 'UF', 'Cargo', 'Partido', 'CPF', 'Nome', 'Qtd', 'Menor Valor', 'Maior Valor', 'Média', 'Valor Total']];
    const corpoTabela = registros.map(d => {
      return [
        (d.ano)             ? d.ano : '',
        (d.ue)              ? d.ue : '',
        (d.uf)              ? d.uf : '',
        (d.cargo)           ? d.cargo : '',
        (d.partido)         ? d.partido : '',
        // (d.numeroCandidato) ? d.numeroCandidato : '',
        (d.cpf)             ? this.utils.formataDado(d.cpf, '###.###.###-##') : '',
        (d.nome)            ? d.nome : '',
        (d.qtd)             ? d.qtd : '',
        (d.menor)           ? `R$ ${this.utils.converteEmDinheiro(d.menor)}` : '',
        (d.maior)           ? `R$ ${this.utils.converteEmDinheiro(d.maior)}` : '',
        (d.media)           ? `R$ ${this.utils.converteEmDinheiro(d.media)}` : '',
        (d.valor)           ? `R$ ${this.utils.converteEmDinheiro(d.valor)}` : '',
      ];
    });

    return {
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela)
    }
  };

  private criaTabelaBens(registros) {
    const headerTabela = [['Ano', 'Tipo', 'Descrição', 'Valor']];
    const corpoTabela = registros.map(d => {
      return [
        (d.ano)       ? d.ano : '',
        (d.classe)    ? d.classe : '',
        (d.descricao) ? d.descricao : '',
        (d.valor)     ? `R$ ${this.utils.converteEmDinheiro(d.valor)}` : '',
      ];
    });

    return {
      widths: ['auto', 'auto', '*', 'auto'],
      body: this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela)
    }
  };

  criaSecaoEleitoral(registros) {
    if (!registros || registros.length === 0) { return null; }

    const bens                  = registros.filter(d => d.tipo === 'bem');
    const doacoes               = registros.filter(d => d.tipo === 'doacao');
    const doadores              = registros.filter(d => d.tipo === 'doador');
    const candidatos            = registros.filter(d => d.tipo === 'candidato');
    const gastos                = registros.filter(d => d.tipo === 'gastos');
    const candidatosfornecidos  = registros.filter(d => d.tipo === 'forneceu');

    let ret = [];

    if (candidatos.length) {
      ret = ret.concat({ text: 'Informação de Candidato - Fonte: TSE', style: 'secao' });
      ret = ret.concat({
          style: 'tabela',
          table: this.criaTabelaInformacoesCandidato(candidatos),
          layout: this.relatorio.layout
      });
    }

    if (bens.length) {
        ret = ret.concat({ text: 'Bens do Candidato - Fonte: TSE', style: 'secao' });
        ret = ret.concat({
            style: 'tabela',
            table: this.criaTabelaBens(bens),
            layout: this.relatorio.layout
        });
    }

    if (doacoes.length) {
        ret = ret.concat({ text: 'Doações Feitas - Fonte: TSE', style: 'secao' });
        ret = ret.concat({
            style: 'tabela',
            table: this.criaTabelaDoacoesFeitas(doacoes),
            layout: this.relatorio.layout
        });
    }

    if (doadores.length) {
        ret = ret.concat({ text: 'Doações Recebidas - Fonte: TSE', style: 'secao' });
        ret = ret.concat({
            style: 'tabela',
            table: this.criaTabelaDoacoesRecebidas(doadores),
            layout: this.relatorio.layout
        });
    }

    if (gastos.length) {
        ret = ret.concat({ text: 'Gastos dos Candidatos - Fonte: TSE', style: 'secao' });
        ret = ret.concat({
            style: 'tabela',
            table:  this.criaTabelaGastos(gastos),
            layout: this.relatorio.layout
        });
    }

    if (candidatosfornecidos.length) {
        ret = ret.concat({ text: 'Candidatos Fornecidos - Fonte: TSE', style: 'secao' });
        ret = ret.concat({
            style: 'minitabela',
            table: this.criaTabelaCandidatosFornecidos(candidatosfornecidos),
            layout: this.relatorio.layout
        });
    }

    return ret;
  };
}
