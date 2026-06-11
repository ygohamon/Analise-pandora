import { Component, OnInit } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';
import { CacaFantasmasService } from '../../../services/cacafantasmas/cacafantasmas.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cacafantasmas',
  templateUrl: './cacafantasmas.component.html',
})
export class CacaFantasmasComponent implements OnInit {

  msgRegistroNaoEncontrado: string;

  orgao: any;
  orgaosEncontrados: any;

  intervaloAnalise: Date[];

  pt_br: any;

  pessoasEncontradasTabelaGeral: any;
  buscaTipologiasFinalizadaSucesso;
  buscaTipologiasFinalizadaFalha: boolean = false;
  esconderPainel: boolean = false;

  resultadoAnalise: object = {};

  tiposAnalise = [
      {label: 'Geral', value: 'geral' },
      {label: 'T1', value: 't1' },
      //{label: 'T2', value: 't2' },
      //{label: 'T3', value: 't3' },
      //{label: 'T4', value: 't4' },
      //{label: 'T5', value: 't5' },
      //{label: 'T6', value: 't6' },
      //{label: 'T7', value: 't7' },
      //{label: 'T8', value: 't8' },
  ];
  tipoAnaliseSelecionada = 'geral';

  resumoAnalise;

  constructor(
    public utils: UtilsService,
    private message: MessageService,
    private cacafantasmas: CacaFantasmasService
  ) {}

    ngOnInit() {
        this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
        this.pt_br = this.utils.locale_pt_br;

        this.inicializaResultados();

        this.resumoAnalise = {
            'geral': {
                titulo: 'Análise Geral',
                conteudo: `Lista as pessoas que aparecem em pelo menos uma das tipologias
                calculadas. Para uma visão mais detalhada, favor escolher um modo
                de análise específico.`
            },
            't1': {
                titulo: 'Análise Tipologia - Folha Pagamento x SISOBI',
                conteudo: `Lista os servidores que receberam pagamentos pela folha do órgão após sua data de óbito.`
            },
            't2': {
                titulo: 'Análise Tipologia - Empenhos x SISOBI',
                conteudo: `Lista os servidores que foram empenhados junto ao órgão após sua data de óbito.`
            },
            't3': {
                titulo: 'Análise Tipologia - Município (Folha Pagamento) x Município (Receita Federal)',
                conteudo: `Lista os servidores que apresentam residência declarada na Receita Federal
                em uma microrregião diferente da microrregião do órgão analisado.`
            },
            't4': {
                titulo: 'Análise Tipologia - Município (Folha Pagamento) x Município (Receita Estadual)',
                conteudo: `Lista os servidores que apresentam residência pela Receita Estadual
                em uma microrregião diferente da microrregião do órgão analisado.`
            },
            't5': {
                titulo: 'Análise Tipologia - Servidores (Folha Pagamento) x Sócios (Receita Federal)',
                conteudo: `Lista os servidores que sejam sócios em Pessoa Jurídica. Apresenta a microrregião
                e a quantiadde de PJs encontradas por cada microrregião.`
            },
            't6': {
                titulo: 'Análise Tipologia - Servidores (Folha Pagamento) x Folha de Pagamento',
                conteudo: `Lista os servidores que apresentam vínculos diversos aos do órgão durante o período analisado.`
            },
            't8': {
                titulo: 'Análise Tipologia - Servidores (Folha Pagamento) x Folha de Pagamento',
                conteudo: `Lista os servidores que apresentam vínculos diversos aos do órgão durante o período analisado.`
            },
        };
    }

  inicializaResultados() {
      this.buscaTipologiasFinalizadaSucesso = false;
      this.resultadoAnalise = null;
  }

  buscaOrgao(event) {
    const orgaoParcial = event.query;

    this.cacafantasmas.pesquisaOrgaoSagresMunicipal(orgaoParcial)
        .subscribe(resultado => {
            const { status, msg, dados } = resultado;

            if (status === 'OK') {
                this.orgaosEncontrados = dados;
                this.inicializaResultados();
            } else {
                this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
            }
        });
  }

  onGerarAnalise() {
    if (this.orgao) {

      let dtinicio;
      let dtfim;

      if (this.intervaloAnalise) {
          dtinicio = this.utils.formataData(this.intervaloAnalise[0], 'YYYYMMDD');
          dtfim = this.utils.formataData(this.intervaloAnalise[1], 'YYYYMMDD');
      }

      this.cacafantasmas.analisaOrgao(this.orgao.cdUgestora, dtinicio, dtfim, this.tipoAnaliseSelecionada)
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;

          this.esconderPainel = true;

            if (status === 'OK') {
              this.buscaTipologiasFinalizadaFalha   = false;
              this.buscaTipologiasFinalizadaSucesso = true;

              this.resultadoAnalise                 = dados.slice();
              this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de fantasmas realizada com sucesso.`));
            } else {
              if (status !== 'ENOTFOUND') { this.buscaTipologiasFinalizadaFalha = true; }
              this.buscaTipologiasFinalizadaSucesso                             = false;

              this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
            }
        }, error => {
            this.esconderPainel = true;

            if (status !== 'ENOTFOUND') { this.buscaTipologiasFinalizadaFalha = true; }
            this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao analisar o órgão.'));
        });
    }
  }

  resetaBusca() {
      this.inicializaResultados();
      this.esconderPainel = false;
  }
}
