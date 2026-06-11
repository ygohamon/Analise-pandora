import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {MenuItem, MessageService} from 'primeng/api';
import {uniq, startCase, sortBy} from 'lodash-es';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { RelatorioService } from './../../../../services/relatorio/relatorio.service';
import { UtilsService } from './../../../../services/common/utils.service';
import { AuthService } from './../../../../services/auth/auth.service';
import { PesquisaPessoaService } from '../../../../services/pesquisa/pesquisa.pessoa.service';

@Component({
    selector: 'app-integrado-pessoa',
    templateUrl: 'pessoa.integrado.component.html'
})

export class PessoaIntegradoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  tituloNome: string;
  tituloCPF: string;
  tituloRG: string;

  // Para o layout
  cpf:        string;
  rg:         string;
  nome:       string;
  cpfValido = false;
  exibeMenuRelatorio = false;

  buscaFinalizada = false;
  buscaSucesso = false;
  buscaFalha = false;

  buscaLocalFinalizada = false;
  buscaLocalSucesso = false;
  buscaLocalFalha = false;

  buscaExternaFinalizada = false;
  buscaExternaSucesso = false;
  buscaExternaFalha = false;

  nProcesso: string;

  categoriasEncontradas = [];
  dadosEncontrados;

  dadosPessoaAgrupado;
  dadosPessoaAgrupadoBool = false;

  alertas;

  tituloCategorias = {
      foto:                        { titulo: 'Fotos',                       tooltip: 'Imagens do investigado'},
      pessoa:                      { titulo: 'Pessoa',                      tooltip: 'Dados pessoais'},
      parentesco:                  { titulo: 'Parentes',                    tooltip: 'Parentes'},
      endereco:                    { titulo: 'Endereços',                   tooltip: 'Endereços'},
      vizinho:                     { titulo: 'Vizinhos',                    tooltip: 'Vizinhos'},
      telefone:                    { titulo: 'Telefones',                   tooltip: 'Telefones'},
      servidor_federal:            { titulo: 'S.Federal',                   tooltip: 'Servidor Federal'},
      servidor_estadual:           { titulo: 'S.Estadual',                  tooltip: 'Servidor Estadual'},
      servidor_municipal:          { titulo: 'S.Municipal',                 tooltip: 'Servidor Municipal'},
      empenho_municipal:           { titulo: 'E. Municipal',                tooltip: 'Empenhos com os municípios'},
      empenho_estadual:            { titulo: 'E. Estadual',                 tooltip: 'Empenhos com o Estado'},
      imovel:                      { titulo: 'Imóveis',                     tooltip: 'Imóveis'},
      empresa:                     { titulo: 'Empresas',                    tooltip: 'Vínculos com Empresas'},
      historico_quadro_societario: { titulo: 'Q.Societário',                tooltip: 'Histórico de participação em sociedades'},
      veiculo:                     { titulo: 'Veículos',                    tooltip: 'Veículos'},
      embarcacao:                  { titulo: 'Embarcações',                 tooltip: 'Embarcações'},
      aeronave:                    { titulo: 'Aeronaves',                   tooltip: 'Aeronaves'},
      amador:                      { titulo: 'Amador',                      tooltip: 'Amador'},
      preso:                       { titulo: 'Prisional',                   tooltip: 'Dados prisionais'},
      mandado:                     { titulo: 'Mandados de Prisão',          tooltip: 'Informações dos mandados de prisão do usuario'},
      prontuarios:                 { titulo: 'Prontuário',                  tooltip: 'Informações do prontuario de prisão'},
      obito:                       { titulo: 'Óbito',                       tooltip: 'Dados da certidão de óbito'},
      tipologia_pf:                { titulo: 'Tipologias',                  tooltip: 'Tipologias'},
      rif:                         { titulo: 'RIF',                         tooltip: 'Relatório de Inteligência Financeira'},
      operacao:                    { titulo: 'Operações',                   tooltip: 'Operações'},
      empregador:                  { titulo: 'Empregadores',                tooltip: 'Dados trabalhistas'},
      // bolsa_familia:               { titulo: 'B.Família',                   tooltip: 'Bolsa Família'},
      beneficio:                   { titulo: 'Benefícios',                  tooltip: 'Benefícios'},
      crawler:                     { titulo: 'Fontes Abertas',              tooltip: 'Dados de fontes abertas'},
      virtual:                     { titulo: 'Virtuais',                    tooltip: 'Dados Virtuais'},
      conselho:                    { titulo: 'Conselhos',                   tooltip: 'Conselhos'},
      processo:                    { titulo: 'Processos',                   tooltip: 'Processos'},
      condenacao:                  { titulo: 'Condenações',                 tooltip: 'Condenações'},
      boletim_ocorrencia:          { titulo: 'BOs',                         tooltip: 'Boletins de Ocorrência'},
      sasp:                        { titulo: 'Ocorrências',                 tooltip: 'Registros da Policia Militar'},
      eleitoral:                   { titulo: 'Eleitoral',                   tooltip: 'Informações eleitorais do candidato'},
      filiacao:                    { titulo: 'Filiação',                    tooltip: 'Filiação Partidária'},
      zoom:                        { titulo: 'Zoom (beta)',                 tooltip: 'Vínculos'},
      ficha_suja:                  { titulo: 'Ficha Suja',                  tooltip: 'Dados de ficha suja'},
      pep:                         { titulo: 'PEP',                         tooltip: 'Pessoa Exposta Politicamente'}
  };

  menuItems: MenuItem[] = [
    {
      label: 'Relatório Resumido',
      icon: 'pi pi-file',
      items: this.criaOpcoesMenu(this.gerarPDFResumido.bind(this))
    },
    { separator:true },
    {
      label: 'Relatório Completo',
      icon: 'pi pi-file',
      items: this.criaOpcoesMenu(this.gerarPDFCompleto.bind(this))
    },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public utils: UtilsService,
    public auth: AuthService,
    private loadingBar: LoadingBarService,
    private pesquisa: PesquisaPessoaService,
    private message: MessageService,
    private relatorio: RelatorioService
  ) {}

  ngOnInit() {
    this.exibeMenuRelatorio = this.auth.getGrupos().some(g => g === 'GAECO') ? true : false;
    this.nProcesso = this.utils.getProcesso();

    this.route.queryParams
      .subscribe((params: Params) => {

        this.cpf = this.utils.decodificaDado(params['cpf']);
        this.cpf = this.utils.checaCPF(this.cpf);
        this.rg = this.utils.decodificaDado(params['rg']);
        this.nome = this.utils.decodificaDado(params['nome']);

        if (this.cpf != null) {
          this.cpfValido = true;
          this.buscaIntegradaCPF(this.cpf);
        } else if (this.rg) {
          this.cpfValido = true;
          this.buscaIntegradaRG(this.rg);
        } else if (this.nome) {
          this.cpfValido = true;
          this.buscaIntegradaNome(this.nome);
        } else {
          this.buscaFalha = true;
          this.message.add(this.utils.mensagemErro('Erro', 'Parâmetro Inválido!'));
          this.router.navigate(['/dashboard/pesquisa/pessoa']);
        }
    });
  }

  criaOpcoesMenu(fn) {
    const items = this.auth.getGrupos().map(g => {
      return {
        label: `Como ${g}`, icon: 'pi pi-globe', command: () => {fn(g);},
      }
    })

    return [{
      label: 'Download', icon: 'pi pi-download', command: () => fn()
    }].concat(items);
  }

  reset() {
    this.dadosEncontrados      = null;
    this.dadosPessoaAgrupado   = null;
    this.categoriasEncontradas = null;

    this.tituloNome            = null;
    this.tituloCPF             = null;
    this.tituloRG              = null;

    this.buscaSucesso          = false;
    this.buscaFalha            = false;
    this.buscaFinalizada       = false;

    this.buscaLocalSucesso     = false;
    this.buscaLocalFinalizada  = false;
    this.buscaLocalFalha       = false;

    this.buscaExternaSucesso   = false;
    this.buscaExternaFinalizada= false;
    this.buscaExternaFalha     = false;
  }

  ngOnDestroy() {
    this.reset();

    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   *  Insere dados novos aos dados existentes
   *
   * @param colecaoNova
   */
  appendDados(colecaoNova) {
    let dadosExistentes = this.dadosEncontrados;

    const categoriasPermitidas = Object.keys(this.tituloCategorias);
    const colecaoNovaFiltrada = Object.keys(colecaoNova)
      .filter(categoria => categoriasPermitidas.includes(categoria))
      .reduce((colecaoFiltrada, categoriaPermitida) => {
        colecaoFiltrada[categoriaPermitida] = colecaoNova[categoriaPermitida];
        return colecaoFiltrada;
      }, {});

    if (!dadosExistentes) {
      dadosExistentes = colecaoNovaFiltrada;
    } else {
      const categoriasColecaoNova = Object.keys(colecaoNovaFiltrada);

      categoriasColecaoNova.forEach(categoriaColecaoNova => {
        if (categoriaColecaoNova in dadosExistentes) {
          dadosExistentes[categoriaColecaoNova] = dadosExistentes[categoriaColecaoNova].concat(colecaoNovaFiltrada[categoriaColecaoNova])
        } else {
          dadosExistentes[categoriaColecaoNova] = colecaoNovaFiltrada[categoriaColecaoNova]
        }
      })
    }

    this.adicionaIndices(dadosExistentes);


    this.dadosEncontrados = Object.assign({}, dadosExistentes);
    this.categoriasEncontradas = Object.keys(dadosExistentes);

    this.agrupaDadosPessoa();
    this.geraTitulo();
  }

  buscaIntegradaCPF(cpf: string) {
    this.reset();

    this.loadingBar.start(10);

    this.pesquisa.pesquisaIntegradaCPF(cpf, this.nProcesso, 'local')
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        if (this.buscaExternaFinalizada) {
          this.loadingBar.complete();
        }

        const {status, dados, msg} = resultado;
        this.buscaLocalFinalizada = true;

        if (status === 'OK') {
          this.buscaLocalSucesso = true;
          this.buscaLocalFalha   = false;

          const colecao = Object.assign.apply(Object, dados);

          this.alertas = colecao.alertas ? colecao.alertas : null;

          this.appendDados(colecao);
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados locais para ${cpf} concluída com sucesso!`));

        } else {
          this.buscaSucesso = false;
          this.buscaFalha   = true;
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (this.buscaExternaFinalizada) {
          this.loadingBar.complete();
        }
        this.buscaLocalFinalizada = true;
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados locais do registro.'));
      });

    this.pesquisa.pesquisaIntegradaCPF(cpf, this.nProcesso, 'externo')
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        if (this.buscaLocalFinalizada) {
          this.loadingBar.complete();
        }

        const {status, dados, msg} = resultado;
        this.buscaExternaFinalizada = true;

        if (status === 'OK') {
          this.buscaExternaSucesso = true;
          this.buscaExternaFalha   = false;

          const colecao = Object.assign.apply(Object, dados);
          this.appendDados(colecao);
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados externos para ${cpf} concluída com sucesso!`));

        } else {
          this.buscaExternaSucesso = false;
          this.buscaExternaFalha   = true;
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (this.buscaLocalFinalizada) {
          this.loadingBar.complete();
        }
        this.buscaExternaFinalizada = true;
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados externos do registro.'));
      });
  }

  buscaIntegradaRG(rg: string) {
    this.reset();

    this.loadingBar.start(10);

    this.pesquisa.pesquisaIntegradaRG(rg, this.nProcesso, 'local')
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        if (this.buscaExternaFinalizada) {
          this.loadingBar.complete();
        }

        const {status, dados, msg} = resultado;
        this.buscaLocalFinalizada = true;

        if (status === 'OK') {
          this.buscaLocalSucesso = true;
          this.buscaLocalFalha   = false;

          const colecao = Object.assign.apply(Object, dados);
          this.appendDados(colecao);
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados locais para ${rg} concluída com sucesso!`));

        } else {
          this.buscaSucesso = false;
          this.buscaFalha   = true;
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (this.buscaExternaFinalizada) {
          this.loadingBar.complete();
        }
        this.buscaLocalFinalizada = true;
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados locais do registro.'));
      });

    this.pesquisa.pesquisaIntegradaRG(rg, this.nProcesso, 'externo')
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        if (this.buscaLocalFinalizada) {
          this.loadingBar.complete();
        }

        const {status, dados, msg} = resultado;
        this.buscaExternaFinalizada = true;

        if (status === 'OK') {
          this.buscaExternaSucesso = true;
          this.buscaExternaFalha   = false;

          const colecao = Object.assign.apply(Object, dados);
          this.appendDados(colecao);
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados externos para ${rg} concluída com sucesso!`));

        } else {
          this.buscaExternaSucesso = false;
          this.buscaExternaFalha   = true;
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (this.buscaLocalFinalizada) {
          this.loadingBar.complete();
        }
        this.buscaExternaFinalizada = true;
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados externos do registro.'));
      });
  }

  buscaIntegradaNome(nome: string) {
    this.reset();

    this.loadingBar.start(10);

    this.pesquisa.pesquisaIntegradaNome(nome, this.nProcesso, 'local')
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        if (this.buscaExternaFinalizada) {
          this.loadingBar.complete();
        }

        const {status, dados, msg} = resultado;
        this.buscaLocalFinalizada = true;

        if (status === 'OK') {
          this.buscaLocalSucesso = true;
          this.buscaLocalFalha   = false;

          const colecao = Object.assign.apply(Object, dados);
          this.appendDados(colecao);
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados locais para ${nome} concluída com sucesso!`));

        } else {
          this.buscaSucesso = false;
          this.buscaFalha   = true;
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (this.buscaExternaFinalizada) {
          this.loadingBar.complete();
        }
        this.buscaLocalFinalizada = true;
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados locais do registro.'));
      });

    this.pesquisa.pesquisaIntegradaNome(nome, this.nProcesso, 'externo')
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        if (this.buscaLocalFinalizada) {
          this.loadingBar.complete();
        }

        const {status, dados, msg} = resultado;
        this.buscaExternaFinalizada = true;

        if (status === 'OK') {
          this.buscaExternaSucesso = true;
          this.buscaExternaFalha   = false;

          const colecao = Object.assign.apply(Object, dados);
          this.appendDados(colecao);
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados externos para ${nome} concluída com sucesso!`));

        } else {
          this.buscaExternaSucesso = false;
          this.buscaExternaFalha   = true;
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (this.buscaLocalFinalizada) {
          this.loadingBar.complete();
        }
        this.buscaExternaFinalizada = true;
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados externos do registro.'));
      });
  }

  adicionaIndices(dadosEncontrados) {
    return Object.keys(dadosEncontrados).reduce((acc, categoria) => {
      acc[categoria] = dadosEncontrados[categoria].map((dado, i) => {
          dado['index'] = i;
          return dado;
      });
      return acc;
    }, {});
  }

  agrupaDadosPessoa() {
      const dadosPessoa = this.dadosEncontrados.pessoa;
      const atributosValidosEncontrados = dadosPessoa.map(registro => Object.keys(registro).filter(atributo => !!registro[atributo]));
      const flatAtributos = [].concat.apply([], atributosValidosEncontrados);
      const atributosUnicos = uniq(flatAtributos);

      const dadosAgrupados = {};

      atributosUnicos.forEach(atributo => {
        dadosAgrupados[atributo] = uniq(dadosPessoa
          .reduce((acc, registro) => (registro[atributo]) ? acc.concat(registro[atributo]) : acc, [])
          .map(d => this.utils.removerAcentos(d)));
      });

      this.dadosPessoaAgrupado = dadosAgrupados;
      if (this.categoriasEncontradas.indexOf('foto') !== -1){
          this.dadosPessoaAgrupado.foto = [this.dadosEncontrados.foto[0].img];
      }
      this.dadosPessoaAgrupadoBool = true;
  }

  gerarPDFResumido(grupo: string = '') {
    const fileName = `Relatório - ${this.tituloNome} - ${this.cpf}.pdf`;
    const url = location.origin + this.router.url;

    // tslint:disable-next-line: variable-name
    const clone_dadosPessoaAgrupado = JSON.parse(JSON.stringify(this.dadosPessoaAgrupado));
    // tslint:disable-next-line: variable-name
    const clone_dadosEncontrados = JSON.parse(JSON.stringify(this.dadosEncontrados));

    this.relatorio.relatorioIntegradoResumidoPessoa(clone_dadosPessoaAgrupado, clone_dadosEncontrados, grupo, fileName, url)
  }

  gerarPDFCompleto(grupo: string = '') {
    const fileName = `Relatório Completo - ${this.tituloNome} - ${this.cpf}.pdf`;
    const url = location.origin + this.router.url;

    // tslint:disable-next-line: variable-name
    const clone_dadosPessoaAgrupado = JSON.parse(JSON.stringify(this.dadosPessoaAgrupado));
    // tslint:disable-next-line: variable-name
    const clone_dadosEncontrados = JSON.parse(JSON.stringify(this.dadosEncontrados));

    this.relatorio.relatorioIntegradoCompletoPessoa(clone_dadosPessoaAgrupado, clone_dadosEncontrados, grupo, fileName, url);
  }

  criaNome(nome: string){
    const nomes = nome.split(' ');
    this.tituloNome = startCase(`${this.utils.first(nomes)} ${this.utils.last(nomes)}`.toLowerCase());
  }

  getNomePessoa(){
    // tslint:disable-next-line: max-line-length
    const pessoaRF = this.utils.first(sortBy(this.dadosEncontrados.pessoa.filter(d => d.fonte.startsWith('RF') || d.fonte.startsWith('CTX')), d => d.fonte).reverse());
    // tslint:disable-next-line: max-line-length
    const pessoaLINC = this.utils.first(sortBy(this.dadosEncontrados.pessoa.filter(d => d.fonte.startsWith('RF') || d.fonte.startsWith('LIC')), d => d.fonte).reverse());

    if (pessoaRF.nome != null) {
      this.criaNome(pessoaRF.nome);
    } else if (pessoaLINC){
      this.criaNome(pessoaLINC.nome);
    } else {
      this.criaNome('Não Identificado');
    }
  }

  geraTitulo(){
    this.getNomePessoa();
    if(this.cpf != null){
      this.tituloCPF = ` - ${this.utils.formataDado(this.cpf, '###.###.###-##')}`;
    }

    this.tituloRG = ` - ${this.rg}`;

  }

  fecharAba(e){
    if (e.index >= 2) {
      const propriedade = this.categoriasEncontradas[e.index-2];
      delete this.dadosEncontrados[propriedade];
    }

    e.close();
  }
}
