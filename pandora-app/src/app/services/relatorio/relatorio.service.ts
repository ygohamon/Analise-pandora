import { Injectable } from '@angular/core';

import { AuthService } from './../auth/auth.service';
import { UtilsService } from './../common/utils.service';

import { RelatorioSecaoCadastroService } from './secoes/cadastro.relatorio';

import { RelatorioSecaoEnderecosService } from './secoes/enderecos.relatorio';
import { RelatorioSecaoTelefonesService } from './secoes/telefones.relatorio';
import { RelatorioSecaoVeiculosService } from './secoes/veiculos.relatorio';
import { RelatorioSecaoAeronaveService } from './secoes/aeronaves.relatorio';
import { RelatorioSecaoEmpenhosService } from './secoes/empenhos.relatorio';
import { RelatorioSecaoMandadosService } from './secoes/mandados.relatorio';
import { RelatorioSecaoOperacoesService } from './secoes/operacoes.relatorio';
import { RelatorioSecaoRIFService } from './secoes/rif.relatorio';
import { RelatorioSecaoTipologiasService } from './secoes/tipologias.relatorio';
import { RelatorioSecaoEleitoralService } from './secoes/eleitoral.relatorio';

import { RelatorioSecaoBeneficiarioService } from './secoes/pf/beneficio.relatorio';
import { RelatorioSecaoEmpregadoresService } from './secoes/pf/empregadores.relatorio';
import { RelatorioSecaoEmpresasPessoaService } from './secoes/pf/empresas.relatorio';
import { RelatorioSecaoObitoService } from './secoes/pf/obito.relatorio';
import { RelatorioSecaoPessoaService } from './secoes/pf/pessoa.relatorio';
import { RelatorioSecaoPrisionalService } from './secoes/pf/prisional.relatorio';
import { RelatorioSecaoQuadroSocietarioService } from './secoes/pf/quadro_societario.relatorio';
import { RelatorioSecaoServidorService } from './secoes/pf/servidor.relatorio';
import { RelatorioSecaoParentescosService } from './secoes/pf/parentescos.relatorio';


import { RelatorioSecaoSociosService } from './secoes/pj/socios.relatorio';
import { RelatorioSecaoEmpresaService } from './secoes/pj/empresa.relatorio';
import { RelatorioSecaoEmpregadosService } from './secoes/pj/empregados.relatorio';
import { RelatorioSecaoPJQuadroSocietarioService } from './secoes/pj/quadro_societario.relatorio';

import { logo_mp, RelatorioUtilsService } from './relatorio.utils';

import { RelatorioSecaoVizinhosService } from './secoes/pf/vizinhos.relatorio';
import { RelatorioSecaoFiliacaoService } from './secoes/pf/filiacao.relatorio';
import { RelatorioSecaoInformacoesVirtuaisService } from './secoes/informacoes.virtuais.relatorio';
import { RelatorioSecaoProcessosService } from './secoes/pf/processos.relatorio';
import { RelatorioSecaoProntuarioService } from './secoes/prontuario.relatorio';

@Injectable()
export class RelatorioService {

  valorProtocolo;

  constructor(
    private auth: AuthService,
    private utils: UtilsService,
    private secaoCadastro: RelatorioSecaoCadastroService,
    private rutils: RelatorioUtilsService,

    private secaoEnderecos: RelatorioSecaoEnderecosService,
    private secaoTelefones: RelatorioSecaoTelefonesService,
    private secaoInformacoesVirtuais: RelatorioSecaoInformacoesVirtuaisService,

    private secaoVeiculos: RelatorioSecaoVeiculosService,
    private secaoAeronaves: RelatorioSecaoAeronaveService,
    private secaoEmpenhos: RelatorioSecaoEmpenhosService,
    private secaoMandados: RelatorioSecaoMandadosService,
    private secaoOperacoes: RelatorioSecaoOperacoesService,
    private secaoProcessos: RelatorioSecaoProcessosService,
    private secaoRIF: RelatorioSecaoRIFService,
    private secaoTipologias: RelatorioSecaoTipologiasService,

    private secaoFiliacao: RelatorioSecaoFiliacaoService,
    private secaoEleitoral: RelatorioSecaoEleitoralService,
    private secaoBeneficiario: RelatorioSecaoBeneficiarioService,
    private secaoEmpregadores: RelatorioSecaoEmpregadoresService,
    private secaoEmpresasPessoa: RelatorioSecaoEmpresasPessoaService,
    private secaoObito: RelatorioSecaoObitoService,
    private secaoPessoa: RelatorioSecaoPessoaService,
    private secaoProntuario: RelatorioSecaoProntuarioService,
    private secaoMandado: RelatorioSecaoMandadosService,
    private secaoPrisional: RelatorioSecaoPrisionalService,
    private secaoQuadroSocietario: RelatorioSecaoQuadroSocietarioService,
    private secaoServidor: RelatorioSecaoServidorService,
    private secaoParentescos: RelatorioSecaoParentescosService,
    private secaoVizinhos: RelatorioSecaoVizinhosService,

    private secaoSocios: RelatorioSecaoSociosService,
    private secaoEmpresa: RelatorioSecaoEmpresaService,
    private secaoEmpregado: RelatorioSecaoEmpregadosService,
    private secaoQuadroSocietarioPJ: RelatorioSecaoPJQuadroSocietarioService,
  ) {}

  criaCabecalho(protocolo, grupo = null) {
    return [
      { image: logo_mp, alignment: 'center', width: 100 },
      { text: 'MINISTÉRIO PÚBLICO DA PARAÍBA', style: 'header'},
      { text: 'PROCURADORIA-GERAL DE JUSTIÇA', style: 'header' },
      { text: 'NÚCLEO DE GESTÃO DO CONHECIMENTO E SEGURANÇA INSTITUCIONAL', style: 'subheader' },

      { text: '\n\nRelatório Integrado\n', style: 'secao' },
      {
          style: 'painel',
          table: {
              widths: [100, '*'],
              body: this.rutils.formataPainel([
                  ['Solicitante:', (grupo) ? grupo : this.auth.getNome() ],
                  ['Data:', this.utils.formataData(new Date(), 'DD [de] MMMM [de] YYYY')],
                  (this.utils.getProcesso()) ? ['Processo:', this.utils.getProcesso()] : null,
                  ['Protocolo:', protocolo],
              ].filter(linha => linha !== null))
          },
          layout: this.rutils.layout
    }];
  }

  relatorioIntegradoResumidoPessoa(dadoPessoaAgrupado, dadosEncontrados, grupo = null, filename, url: string = '') {
    this.valorProtocolo = btoa(`user:${this.auth.getId()}data:${(new Date()).toISOString()}`);

    const doc = {
      content: [
        this.criaCabecalho(this.valorProtocolo, grupo),

        this.secaoPessoa.criaSecaoPessoaAgrupado(dadoPessoaAgrupado),

        this.secaoEnderecos.criaSecaoEnderecos(dadosEncontrados.endereco),
        this.secaoTelefones.criaSecaoTelefones(dadosEncontrados.telefone),
        this.secaoInformacoesVirtuais.criaSecaoInformacoesVirtuais(dadosEncontrados.virtual),

        this.secaoServidor.criaSecaoServidorMunicipal(dadosEncontrados.servidor_municipal),
        this.secaoServidor.criaSecaoServidorEstadual(dadosEncontrados.servidor_estadual),
        this.secaoServidor.criaSecaoServidorFederal(dadosEncontrados.servidor_federal),

        this.secaoEmpenhos.criaSecaoEmpenhoMunicipal(dadosEncontrados.empenho_municipal),
        this.secaoEmpenhos.criaSecaoEmpenhoEstadual(dadosEncontrados.empenho_estadual),

        this.secaoEmpresasPessoa.criaSecaoEmpresasPessoa(dadosEncontrados.empresa),
        this.secaoQuadroSocietario.criaSecaoQuadroSocietarioPF(dadosEncontrados.historico_quadro_societario),
        this.secaoEmpregadores.criaSecaoEmpregadores(dadosEncontrados.empregador),

        this.secaoBeneficiario.criaSecaoBeneficio(dadosEncontrados.beneficio),
        this.secaoVeiculos.criaSecaoResumidaVeiculos(dadosEncontrados.veiculo),
        this.secaoAeronaves.criaSecaoAeronaves(dadosEncontrados.aeronave),
        this.secaoPrisional.criaSecaoResumidaPrisional(dadosEncontrados.preso),
        // this.secaoMandado.criaSecaoMandado(dadosEncontrados.mandado),
        // this.secaoProntuario.criaSecaoProntuarios(dadosEncontrados.prontuario),
        this.secaoObito.criaSecaoResumidaObitos(dadosEncontrados.obito),

        this.secaoTipologias.criaSecaoTipologias(dadosEncontrados.tipologia_pf, 'PF'),
        this.secaoRIF.criaSecaoRIF(dadosEncontrados.rif),
        this.secaoOperacoes.criaSecaoOperacoes(dadosEncontrados.operacao),
        this.secaoProcessos.criaSecaoProcessos(dadosEncontrados.processo),

        this.rutils.criaRodape(url)
      ],
      styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }

  relatorioIntegradoCompletoPessoa(dadoPessoaAgrupado, dadosEncontrados, grupo = null, filename, url: string = '') {
    this.valorProtocolo = btoa(`user:${this.auth.getId()}data:${(new Date()).toISOString()}`);

    // console.log(        this.secaoMandado.criaSecaoMandado(dadosEncontrados.mandado),)
    const doc = {
      content: [
        this.criaCabecalho(this.valorProtocolo, grupo),

        this.secaoPessoa.criaSecaoPessoaAgrupado(dadoPessoaAgrupado),
        this.secaoPessoa.criaSecaoPessoa(dadosEncontrados.pessoa),

        this.secaoParentescos.criaSecaoParentescos(dadosEncontrados.parentesco),

        this.secaoEnderecos.criaSecaoEnderecos(dadosEncontrados.endereco),
        this.secaoVizinhos.criaSecaoVizinhos(dadosEncontrados.vizinho),

        this.secaoTelefones.criaSecaoTelefones(dadosEncontrados.telefone),
        this.secaoInformacoesVirtuais.criaSecaoInformacoesVirtuais(dadosEncontrados.virtual),

        this.secaoServidor.criaSecaoServidorMunicipal(dadosEncontrados.servidor_municipal),
        this.secaoServidor.criaSecaoServidorEstadual(dadosEncontrados.servidor_estadual),
        this.secaoServidor.criaSecaoServidorFederal(dadosEncontrados.servidor_federal),

        this.secaoEmpenhos.criaSecaoEmpenhoMunicipal(dadosEncontrados.empenho_municipal),
        this.secaoEmpenhos.criaSecaoEmpenhoEstadual(dadosEncontrados.empenho_estadual),

        this.secaoEmpresasPessoa.criaSecaoEmpresasPessoa(dadosEncontrados.empresa),
        this.secaoQuadroSocietario.criaSecaoQuadroSocietarioPF(dadosEncontrados.historico_quadro_societario),
        this.secaoEmpregadores.criaSecaoEmpregadores(dadosEncontrados.empregador),

        this.secaoBeneficiario.criaSecaoBeneficio(dadosEncontrados.beneficio),

        this.secaoVeiculos.criaSecaoResumidaVeiculos(dadosEncontrados.veiculo),
        this.secaoAeronaves.criaSecaoAeronaves(dadosEncontrados.aeronave),
        this.secaoPrisional.criaSecaoPrisional(dadosEncontrados.preso),
        // this.secaoMandado.criaSecaoMandado(dadosEncontrados.mandado),
        // this.secaoProntuario.criaSecaoProntuarios(dadosEncontrados.prontuario),
        this.secaoObito.criaSecaoObitos(dadosEncontrados.obito),

        this.secaoFiliacao.criaSecaoFiliacao(dadosEncontrados.filiacao),
        this.secaoEleitoral.criaSecaoEleitoral(dadosEncontrados.eleitoral),

        //this.secaoTipologias.criaSecaoTipologias(dadosEncontrados.tipologia_pf, 'PF'),
        this.secaoRIF.criaSecaoRIF(dadosEncontrados.rif),
        this.secaoOperacoes.criaSecaoOperacoes(dadosEncontrados.operacao),
        this.secaoProcessos.criaSecaoProcessos(dadosEncontrados.processo),

        this.rutils.criaRodape(url)
      ],
      styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }

  relatorioIntegradoResumidoEmpresa(dadosEncontrados, grupo = null, filename, url: string = '') {
    this.valorProtocolo = btoa(`user:${this.auth.getId()}data:${(new Date()).toISOString()}`);

    const doc = {
        content: [
            this.criaCabecalho(this.valorProtocolo, grupo),

            this.secaoEmpresa.criaSecaoEmpresas(dadosEncontrados.empresa),

            // this.secaoSocios.criaSecaoSociosPF(dadosEncontrados.socio_pf),
            // this.secaoSocios.criaSecaoSociosPJ(dadosEncontrados.socio_pj),
            // this.secaoSocios.criaSecaoSociosEstrangeiro(dadosEncontrados.socio_estrangeiro),

            this.secaoQuadroSocietarioPJ.criaSecaoPJQuadroSocietario(dadosEncontrados.historico_quadro_societario),

            this.secaoEnderecos.criaSecaoEnderecos(dadosEncontrados.endereco),
            this.secaoTelefones.criaSecaoTelefones(dadosEncontrados.telefone),
            this.secaoInformacoesVirtuais.criaSecaoInformacoesVirtuais(dadosEncontrados.virtual),

            this.secaoVeiculos.criaSecaoResumidaVeiculos(dadosEncontrados.veiculo),
            this.secaoAeronaves.criaSecaoAeronaves(dadosEncontrados.aeronave),

            this.secaoTipologias.criaSecaoTipologias(dadosEncontrados.tipologia_pj, 'PJ'),

            this.secaoEmpenhos.criaSecaoEmpenhoMunicipal(dadosEncontrados.empenho_municipal),
            this.secaoEmpenhos.criaSecaoEmpenhoEstadual(dadosEncontrados.empenho_estadual),

            this.secaoEmpregado.criaSecaoEmpregados(dadosEncontrados.empregador),

            this.secaoRIF.criaSecaoRIF(dadosEncontrados.rif),
            this.secaoOperacoes.criaSecaoOperacoes(dadosEncontrados.operacao),

            this.rutils.criaRodape(url)
        ],
        styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }

  relatorioIntegradoCompletoEmpresa(dadosEncontrados, grupo = null, filename, url: string = '') {
    this.valorProtocolo = btoa(`user:${this.auth.getId()}data:${(new Date()).toISOString()}`);

    const doc = {
        content: [
            this.criaCabecalho(this.valorProtocolo, grupo),

            this.secaoEmpresa.criaSecaoEmpresas(dadosEncontrados.empresa),

            this.secaoEmpresa.criaSecaoAtividadeEconomica(dadosEncontrados.atividadeeconomica),
            this.secaoEmpresa.criaSecaoFiliais(dadosEncontrados.filial),
            this.secaoEmpresa.criaSecaoContadores(dadosEncontrados.contador),

            this.secaoEnderecos.criaSecaoEnderecos(dadosEncontrados.endereco),
            this.secaoTelefones.criaSecaoTelefones(dadosEncontrados.telefone),
            this.secaoInformacoesVirtuais.criaSecaoInformacoesVirtuais(dadosEncontrados.virtual),

            // this.secaoSocios.criaSecaoSociosPF(dadosEncontrados.socio_pf),
            // this.secaoSocios.criaSecaoSociosPJ(dadosEncontrados.socio_pj),
            // this.secaoSocios.criaSecaoSociosEstrangeiro(dadosEncontrados.socio_estrangeiro),

            this.secaoQuadroSocietarioPJ.criaSecaoPJQuadroSocietario(dadosEncontrados.historico_quadro_societario),

            this.secaoVeiculos.criaSecaoVeiculos(dadosEncontrados.veiculo),
            this.secaoAeronaves.criaSecaoAeronaves(dadosEncontrados.aeronave),

            this.secaoEmpenhos.criaSecaoEmpenhoMunicipal(dadosEncontrados.empenho_municipal),
            this.secaoEmpenhos.criaSecaoEmpenhoEstadual(dadosEncontrados.empenho_estadual),

            this.secaoEmpregado.criaSecaoEmpregados(dadosEncontrados.empregador),
            this.secaoEleitoral.criaSecaoEleitoral(dadosEncontrados.eleitoral),

            this.secaoRIF.criaSecaoRIF(dadosEncontrados.rif),
            this.secaoOperacoes.criaSecaoOperacoes(dadosEncontrados.operacao),

            this.secaoTipologias.criaSecaoTipologias(dadosEncontrados.tipologia_pj, 'PJ'),

            this.rutils.criaRodape(url)
        ],
        styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }

  relatorioCadastro(dadosCadastro, filename){
    const doc = {
        content: [
            this.secaoCadastro.criaCabecalhoCadastro(),
            this.secaoCadastro.criaSecaoRelatorioCadastro(dadosCadastro)
        ],
        styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }
}
