import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoBeneficiarioService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaTabelaResumidaBolsaFamilia(registros) {
    const headerTabela = [['Agência', 'Competência', 'Nome', 'Dep. NIS', 'Dep. Nome', 'Dep. Idade', 'Valor Total']];
    const corpoTabela = registros.map(registro => {
      return [
        (registro.agenciaMunicipio) ? registro.agenciaMunicipio + '/' + registro.agenciaUf : '',
        (registro.competenciaFolha) ? registro.competenciaFolha : '',
        (registro.nome) ? registro.nome : '',
        (registro.nisDependente) ? registro.nisDependente : '',
        (registro.nomeDependente) ? registro.nomeDependente : '',
        (registro.idadeDependente) ? registro.idadeDependente : '',
        (registro.vlrTotal) ? 'R$ ' + this.utils.converteEmDinheiro(registro.vlrTotal) : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaTabelaResumidaCartaoAlimentacaoPB(registros) {
    const headerTabela = [['Cidade', 'NIS', 'Nome']];
    const corpoTabela = registros.map(registro => {
      return [
        (registro.cidade) ? registro.agenciaMunicipio + '/' + registro.agenciaUf : '',
        (registro.nis) ? registro.competenciaFolha : '',
        (registro.nome) ? registro.nome : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoBeneficio(registros) {
    if (!registros || registros.length === 0) { return null; }

    let ret = [];

    const dadosBF = registros.filter(d => d.fonte !== 'transparencia' && d.tipo === 'bolsa_familia');
    if (dadosBF.length) {
      ret = ret.concat({ text: 'Benefício - Bolsa Família', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: this.criaTabelaResumidaBolsaFamilia(dadosBF)
        },
        layout: this.relatorio.layout
      });
    }

    const dadosCartao = registros.filter(d => d.tipo === 'cartao_alimentacao_pb');
    if (dadosCartao.length) {
      ret = ret.concat({ text: 'Benefício - Cartão de Alimentação', style: 'secao' });
      ret = ret.concat({
        style: 'tabela',
        table: {
          widths: ['auto', 'auto', '*'],
          body: this.criaTabelaResumidaCartaoAlimentacaoPB(dadosCartao)
        },
        layout: this.relatorio.layout
      });
    }

    return ret;
  }
}
