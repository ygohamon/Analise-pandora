import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoadingBarService } from '@ngx-loading-bar/core';

import {startCase} from 'lodash-es';

import { MenuItem, MessageService } from 'primeng/api';

import {UtilsService} from './../../../../services/common/utils.service';
import {RelatorioService} from './../../../../services/relatorio/relatorio.service';
import {AuthService} from './../../../../services/auth/auth.service';
import { PesquisaEmpresaService } from '../../../../services/pesquisa/pesquisa.empresa.service';

@Component({
    selector: 'app-integrado-empresa',
    templateUrl: 'empresa.integrado.component.html'
})
export class EmpresaIntegradoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  tituloCNPJ: string;
  tituloRazaoSocial: string;

  cnpj:       string;
  cnpjValido: boolean = false;

  buscaFinalizada: boolean = false;
  buscaSucesso:    boolean = false;
  buscaFalha:      boolean = false;

  buscaLocalFinalizada: boolean = false;
  buscaLocalSucesso:    boolean = false;
  buscaLocalFalha:      boolean = false;

  buscaExternaFinalizada: boolean = false;
  buscaExternaSucesso:    boolean = false;
  buscaExternaFalha:      boolean = false;

  nProcesso:                  string;

  categoriasEncontradas = [];
  dadosEncontrados;

  tituloCategorias = {
      empresa:                      { titulo: 'Empresa',             tooltip: 'Dados corporativos' },
      atividadeeconomica:           { titulo: 'Atividade Econômica', tooltip: 'Dados de Atividade Econômica da Empresa' },
      endereco:                     { titulo: 'Endereços',           tooltip: 'Endereços' },
      telefone:                     { titulo: 'Telefones',           tooltip: 'Telefones' },
      contador:                     { titulo: 'Contador',            tooltip: 'Contadores' },
      filial:                       { titulo: 'Filiais',             tooltip: 'Filiais da empresa' },
      imovel:                       { titulo: 'Imovéis',             tooltip: 'Imovéis'},
      veiculo:                      { titulo: 'Veículos',            tooltip: 'Veículos' },
      embarcacao:                   { titulo: 'Embarcações',         tooltip: 'Embarcações'},
      aeronave:                     { titulo: 'Aeronaves',           tooltip: 'Aeronaves'},
      socio_pf:                     { titulo: 'Sócios-PF',           tooltip: 'Sócios Pessoa Física' },
      socio_pj:                     { titulo: 'Sócios-PJ',           tooltip: 'Sócios Pessoa Jurídica' },
      socio_estrangeiro:            { titulo: 'Sócios-EX',           tooltip: 'Sócios Estrangeiros' },
      tipologia_pj:                 { titulo: 'Tipologias',          tooltip: 'Tipologias' },
      empenho_municipal:            { titulo: 'E-Municipal',         tooltip: 'Empenhos com os municípios' },
      empenho_estadual:             { titulo: 'E-Estadual',          tooltip: 'Empenhos com o Estado' },
      rif:                          { titulo: 'RIF',                 tooltip: 'Relatórios de Inteligência Financeira' },
      processo:                     { titulo: 'Processos',           tooltip: 'Processos'},
      operacao:                     { titulo: 'Operações',           tooltip: 'Operações' },
      historico_quadro_societario:  { titulo: 'Q.Societário',        tooltip: 'Histórico de participação em sociedades' },
      empregador:                   { titulo: 'Trabalhista',         tooltip: 'Dados trabalhistas' },
      virtual:                      { titulo: 'Virtuais',            tooltip: 'Dados Virtuais'},
      vizinho:                      { titulo: 'Vizinhos',            tooltip: 'Vizinhos'},
      crawler:                      { titulo: 'Fontes Abertas',      tooltip: 'Dados de fontes abertas'},
      eleitoral:                    { titulo: 'Eleitoral',           tooltip: 'Informações eleitorais da Empresa'},
      zoom:                         { titulo: 'Zoom (beta)',         tooltip: 'Vínculos'}
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
    public utils: UtilsService,
    public auth: AuthService,
    private router: Router,
    private loadingBar: LoadingBarService,
    private pesquisa: PesquisaEmpresaService,
    private message: MessageService,
    private relatorio: RelatorioService
  ) {}

  ngOnInit() {
      this.nProcesso = this.utils.getProcesso();

      this.route
        .queryParams
        .subscribe((params: Params) => {
          this.cnpj = this.utils.decodificaDado(params['cnpj']);
          this.cnpj = this.utils.checaCNPJ(this.cnpj);

          if (this.cnpj) {
            this.cnpjValido = true;

            this.buscaIntegrada(this.cnpj);
          } else {
            this.buscaFalha = true;

            this.message.add(this.utils.mensagemErro('Erro', 'CNPJ Inválido'));
          }
      });
  }

  ngOnDestroy() {
    this.reset();

    this._destroy$.next();
    this._destroy$.complete();
  }

  criaOpcoesMenu(fn) {
    const items = this.auth.getGrupos().map(g => {
      return {
        label: `Como ${g}`, icon: 'pi pi-globe', command: () => { fn(g); }
      }
    })

    return [{
      label: 'Download', icon: 'pi pi-download', command: () => fn()
    }].concat(items);
  }

  reset() {
    this.dadosEncontrados      = null;
    this.categoriasEncontradas = null;

    this.tituloCNPJ            = null;
    this.tituloRazaoSocial     = null;

    this.buscaSucesso          = false;
    this.buscaFalha            = false;
    this.buscaFinalizada       = false;

    this.buscaLocalFinalizada   = false;
    this.buscaLocalSucesso      = false;
    this.buscaLocalFalha        = false;

    this.buscaExternaFinalizada = false;
    this.buscaExternaSucesso    = false;
    this.buscaExternaFalha      = false;
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

    this.dadosEncontrados = dadosExistentes;
    this.categoriasEncontradas = Object.keys(dadosExistentes);

    this.geraTitulo();
  }

  buscaIntegrada(cnpj: string) {
    this.reset();

    this.loadingBar.start(10);

    this.pesquisa.pesquisaIntegradaCNPJ(cnpj, this.nProcesso, 'local')
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
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados locais para ${cnpj} concluída com sucesso!`));
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

    this.pesquisa.pesquisaIntegradaCNPJ(cnpj, this.nProcesso, 'externo')
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
          this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de dados externos para ${cnpj} concluída com sucesso!`));
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

  gerarPDFResumido(grupo: string = '') {
    const fileName = `Relatório - ${this.tituloRazaoSocial} - ${this.cnpj}.pdf`;
    const copy = JSON.parse(JSON.stringify(this.dadosEncontrados));

    const url = location.origin + this.router.url;

    this.relatorio.relatorioIntegradoResumidoEmpresa(copy, grupo, fileName, url);
  }

  gerarPDFCompleto(grupo: string = '') {
    const fileName = `Relatório Completo - ${this.tituloRazaoSocial} - ${this.cnpj}.pdf`;
    const copy = JSON.parse(JSON.stringify(this.dadosEncontrados));

    const url = location.origin + this.router.url;

    this.relatorio.relatorioIntegradoCompletoEmpresa(copy, grupo, fileName, url);
  }

  criaRazaoSocial(nome: string){
    const nomes = nome.split(' ');
    this.tituloRazaoSocial = startCase(`${this.utils.first(nomes)} ${this.utils.last(nomes)}`.toLowerCase());
  }

  getRazaoSocialEmpresa(){
    let empresa_rf = this.dadosEncontrados.empresa.filter(p => p.fonte.startsWith('RF') || p.fonte.startsWith('CTX'));

    if (empresa_rf.length > 0) {
      this.criaRazaoSocial(this.utils.first(empresa_rf)?.razaoSocial);
    }
  }

  geraTitulo(){
    this.getRazaoSocialEmpresa();
    this.tituloCNPJ = ` - ${this.utils.formataDado(this.cnpj, '##.###.###/####-##')}`;
  }

  fecharAba(e){
    if (e.index >= 0) {
      const propriedade = this.categoriasEncontradas[e.index-0];
      delete this.dadosEncontrados[propriedade];
    }

    e.close();
  }
}
