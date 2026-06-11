import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../relatorio.utils';
import { UtilsService } from './../../common/utils.service';

@Injectable()
export class RelatorioSecaoMandadosService {


    constructor(
        private utils: UtilsService,
        private relatorio: RelatorioUtilsService
      ) { }

      criaSecaoMandado(registros) {

          if (!registros || registros.length === 0) { return null; }
          const ordemAtributos = [
            'nome', 'alcunha', 'corRaca', 'flagGravidez',
            'flagLactante', 'flgDeficienteFisico', 'flagDependenteQuimico',
            'escolaridade',
            'mandado.tipoPeca', 'numeroPeca',
             'pessoa.statusPessoa', 'pessoa.municipioCustodia',
            'pessoa.ufCustodia', 'pessoa.justificativa',
            'mandado', 'mandado.numeroPeca', 'mandado.numeroProcesso',
            'mandado.status', 'mandado.nomeServidor', 'mandado.cargoServidor',
            'mandado.nomeMagistrado', 'mandado.textoJustificativaCancelamento', 'mandado.orgaoJudiciario', 'mandado.numeroPrazoPrisao',
            'mandado.sinteseDecisao', 'mandado.descricaoLocalOcorrencia', 'mandado.descricaoCumprimento', 'mandado.observacao',
            'mandado.regimePrisional', 'mandado.especiePrisao', 'mandado.sigilo',
            'mandado.nomeEstabelecimentoPrisional', 'mandado.descricaoJustificativa', 'mandado.ufCustodia', 'mandado.municipioCustodia',
            'linha_vazia',
            'contramandado.numeroPeca', 'contramandado.numeroProcesso', 'contramandado.descricaoMotivoExpedicao',
            'contramandado.descricaoObservacao', 'contramandado.descricaoObservacao', 'contramandado.descricaoObservacao',
          ]

          return [
              { text: 'Registros Encontrados do Mandado', style: 'secao' },
              this.relatorio.criaPainel(registros, ordemAtributos)
          ];
      }

      criaSecaoMandadoAgrupado(registros) {
          if (!registros || Object.keys(registros).length === 0) { return null; }

          return [{ text: 'Dados do Mandado', style: 'secao' },
          {
              style: 'painel',
              table: {
                  widths: [130, '*'],
                  body: this.relatorio.formataPainel(registros)
              },
              layout: this.relatorio.layout
          }];
      }
}
