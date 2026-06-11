import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from '../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoProcessosService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaTabelaCEIS (dados) {
    const headerTabela = [['Processo', 'Sanção', 'Dt Início', 'Dt Final', 'Orgão Sancionador', 'Origem', 'Dt Origem', 'Publicação', 'Dt Publicação']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.processo)           ? dado.processo : '',
        (dado.tipoSancao)         ? dado.tipoSancao : '',
        (dado.dataInicio)         ? this.utils.formataData(dado.dataInicio) : '',
        (dado.dataFinal)          ? this.utils.formataData(dado.dataFinal) : '',
        (dado.orgaoSancionador)   ? dado.orgaoSancionador : '',
        (dado.origemInformacoes)  ? dado.origemInformacoes : '',
        (dado.dataOrigem)         ? this.utils.formataData(dado.dataOrigem) : '',
        (dado.publicacao)         ? dado.publicacao : '',
        (dado.dataPublicacao)     ? this.utils.formataData(dado.dataPublicacao) : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaTabelaCadicon (dados) {
    const headerTabela = [['Tribunal', 'Colegiado', 'Trânsito Julgado', 'Acordão', 'Processo', 'V. Débito', 'V. Multa']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.siglaTribunal)        ? dado.siglaTribunal : '',
        (dado.colegiado)            ? dado.colegiado : '',
        (dado.dataTransitoJulgado)  ? this.utils.formataData(dado.dataTransitoJulgado) : '',
        (dado.acordao)              ? dado.acordao : '',
        (dado.processo)             ? dado.processo : '',
        (dado.vDebito)              ? `R$ ${this.utils.converteEmDinheiro(dado.vDebito)}` : '',
        (dado.vMulta)               ? `R$ ${this.utils.converteEmDinheiro(dado.vMulta)}` : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaTabelaTJPB (dados) {
    const headerTabela = [['Número', 'Classe', 'Unidade', 'Distribuição', 'Status', 'Trânsito Julg.', 'Valor']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.numero)           ? dado.numero : '',
        (dado.classe)           ? dado.classe : '',
        (dado.unidadeJudiciaria)? dado.unidadeJudiciaria : '',
        (dado.dataDistribuicao) ? this.utils.formataData(dado.dataDistribuicao * 1000) : '',
        (dado.status)           ? dado.status : '',
        (dado.transitouJulgado) ? 'Sim' : 'Não',
        (dado.valorAcao)        ? `R$ ${this.utils.converteEmDinheiro(dado.valorAcao)}` : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaTabelaCondenacoesTRF5 (dados) {
    const headerTabela = [['Processo', 'Data Processo', 'Data Julgamento', 'Decisão', 'Observação']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.processo)       ? dado.processo : '',
        (dado.dataProcesso)   ? this.utils.formataData(dado.dataProcesso) : '',
        (dado.dataJulgamento) ? this.utils.formataData(dado.dataJulgamento) : '',
        (dado.resultado)      ? dado.resultado : '',
        (dado.decisao)        ? dado.decisao : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaTabelaCondenacoesTCEPB (dados) {
    const headerTabela = [['Processo', 'Jurisdicionado', 'Data Julgamento', 'Decisão', 'Decisão Legislativo']];
    const corpoTabela = dados.map(dado => {
      return [
        (dado.processo)           ? dado.processo : '',
        (dado.jurisdicionado)     ? dado.jurisdicionado : '',
        (dado.dataJulgamento)     ? this.utils.formataData(dado.dataJulgamento) : '',
        (dado.decisao)            ? dado.decisao : '',
        (dado.decisaoLegislativo) ? dado.decisaoLegislativo : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoProcessos (dados) {
    if (!dados || dados.length === 0) { return null; }

    const ceis  = dados.filter(dado => dado.fonte === 'CEIS');
    const cadicon  = dados.filter(dado => dado.fonte === 'CADICON');
    const trf5  = dados.filter(dado => dado.fonte === 'trf5');
    const tcepb = dados.filter(dado => dado.fonte === 'tcepb');
    const tjpb = dados.filter(dado => dado.tipo === 'processo_tjpb');

    let ret = [];

    if (ceis.length) {
      ret = ret.concat({ text: 'CEIS - Fonte: Transparência', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: this.criaTabelaCEIS(ceis)
        },
        layout: this.relatorio.layout
      });
    }

    if (cadicon.length) {
      ret = ret.concat({ text: 'Cadicon - Fonte: TCU', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: this.criaTabelaCadicon(cadicon)
        },
        layout: this.relatorio.layout
      });
    }

    if (tjpb.length) {
      ret = ret.concat({ text: 'Processos - Fonte: TJPB', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: this.criaTabelaTJPB(tjpb)
        },
        layout: this.relatorio.layout
      });
    }

    if (trf5.length) {
      ret = ret.concat({ text: 'Condenações - Fonte: TRF5', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', '*'],
          body: this.criaTabelaCondenacoesTRF5(trf5)
        },
        layout: this.relatorio.layout
      });
    }

    if (tcepb.length) {
      ret = ret.concat({ text: 'Condenações - Fonte: TCE-PB', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', '*'],
          body: this.criaTabelaCondenacoesTCEPB(tcepb)
        },
        layout: this.relatorio.layout
      });
    }

    return ret;
  }
}
