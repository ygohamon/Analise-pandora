import { Component, Input, OnInit, OnDestroy, EventEmitter, AfterViewInit, ViewChild, DoCheck } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { ScrollPanel } from 'primeng/scrollpanel';
import { MenuItem } from 'primeng/api';

import { AppDashboardComponent } from './../dashboard/app.dashboard.component';
import { AuthService } from './../services/auth/auth.service';
import { UtilsService } from './../services/common/utils.service';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';


@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit, DoCheck, OnDestroy, AfterViewInit {

  @Input() reset: boolean;
  processoSetado = false;

  model: any[];

  @ViewChild('layoutMenuScroller', { static: true }) layoutMenuScrollerViewChild: ScrollPanel;

  constructor(
    public app: AppDashboardComponent,
    private auth: AuthService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.setMenu();
  }

  ngDoCheck() {
    if (this.utils.getLiberaAcesso()) {
      this.processoSetado = true;
      this.setMenu();
    } else {
      //  this.processoSetado = false;
    }
  }

  setaProcesso() {
    this.processoSetado = true;
  }

  setMenu() {
    this.model = [
      this.getSecaoHome()
    ];

    if (!this.auth.getNecessitaProcesso()
      || this.processoSetado
      || this.utils.getProcesso()) {

      // Monta as abas por secao
      this.model = this.model.concat(this.getSecaoPesquisa());
      this.model = this.model.concat(this.getSecaoApps());
      this.model = this.model.concat(this.getSecaoAnalise());
      this.model = this.model.concat(this.getSecaoCadastro());
      this.model = this.model.concat(this.getSecaoExterno());

      if (this.auth.getPerfil() === 'admin') {
        this.model = this.model.concat(this.getSecaoSistema());
      }
    }
    this.model = this.model.filter(x => x !== null);
  }

  getSecaoHome() {
    return {
      label: 'Home', icon: 'fa fa-home', routerLink: ['home']
    };
  }

  getSecaoPesquisa() {
    const secao = {
      label: 'Pesquisa', icon: 'fa fa-search',
      items: [
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.pessoa)) ?
          { label: 'Pessoa', icon: 'fa fa-user-o', routerLink: ['pesquisa/pessoa'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.empresa)) ?
          { label: 'Empresa', icon: 'fa fa-building-o', routerLink: ['pesquisa/empresa'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.endereco)) ?
          { label: 'Endereço', icon: 'fa fa-road', routerLink: ['pesquisa/endereco'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.veiculo)) ?
          { label: 'Veículo', icon: 'fa fa-car', routerLink: ['pesquisa/veiculo'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.telefone)) ?
          { label: 'Telefone', icon: 'fa fa-phone', routerLink: ['pesquisa/telefone'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.preso)) ?
          { label: 'Preso', icon: 'fa fa-user-circle', routerLink: ['pesquisa/preso'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.obito)) ?
          { label: 'Obito', icon: 'fa fa-universal-access', routerLink: ['pesquisa/obito'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.folhapagamento)) ?
          { label: 'Folha de Pagamento', icon: 'fa fa-file-text-o', routerLink: ['pesquisa/folhapagamento'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.imovel)) ?
          { label: 'Imóvel', icon: 'fa fa-home', routerLink: ['pesquisa/imovel'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.embarcacao)) ?
          { label: 'Embarcação', icon: 'fa fa-ship', routerLink: ['pesquisa/embarcacao'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.investigado)) ?
          { label: 'Investigado', icon: 'fa fa-user-secret', routerLink: ['pesquisa/investigado'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.prontuario)) ?
          { label: 'Prontuário', icon: 'fa fa-clipboard', routerLink: ['pesquisa/prontuario'] } : null,
        (this.auth.checkControleAcesso(mps.pesquisa, mpi.pesquisa.orcrim)) ?
          { label: 'Org. Criminosas', icon: 'fa fa-users', routerLink: ['pesquisa/orcrim'] } : null,
      ]
    };

    secao.items = secao.items.filter(i => i !== null);

    return (secao.items.length) ? secao : null;
  }

  getSecaoApps() {
    let secao;

    secao = {
      label: 'Apps', icon: 'fa fa-server',
      items: [
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.integra)) ?
          { label: 'Integra', icon: 'fa fa-linkedin', routerLink: ['apps/integra'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.cacafantasmas)) ?
          { label: 'Caça Fantasmas', icon: 'fa fa-eye', routerLink: ['apps/cacafantasmas'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.dna)) ?
          { label: 'DNA', icon: 'fa fa-share-alt', routerLink: ['apps/dna'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.painelcovid)) ?
          { label: 'Painel Covid', icon: 'fa fa-bullseye', routerLink: ['apps/painelcovid'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.inp)) ?
          { label: 'INP', icon: 'fa fa-users', routerLink: ['apps/inp'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.mapaconsumo)) ?
          { label: 'Mapa de Consumo', icon: 'fa fa-map', routerLink: ['apps/mapaconsumo'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.relacionamentos)) ?
          { label: 'Relacionamentos', icon: 'fa fa-sitemap', routerLink: ['apps/relacionamentos'] } : null,
        {
          label: 'Operações em Lote', icon: 'fa fa-share',
          items: [
            (this.auth.checkControleAcesso(mps.apps, mpi.apps.relatoriointegrado)) ?
              { label: 'Relatórios', routerLink: ['apps/relatorio'] } : null,
            (this.auth.checkControleAcesso(mps.apps, mpi.apps.relatoriointegrado)) ?
              { label: 'Qualificações', routerLink: ['apps/qualificacaolote'] } : null,
          ]
        },
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.erbtracker)) ?
          { label: 'ERB Tracker', icon: 'fa fa-podcast', routerLink: ['apps/erbtracker'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.tiporank)) ?
          { label: 'TipoRank', icon: 'fa fa-thermometer-three-quarters', routerLink: ['apps/tiporank'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.ariel)) ?
          { label: 'Ariel', icon: 'fa fa-camera', routerLink: ['apps/ariel'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.simba)) ?
          { label: 'SIMBA', icon: 'fa fa-university', routerLink: ['apps/simba'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.yellowpages)) ?
          { label: 'YellowPages', icon: 'fa fa-yoast', routerLink: ['apps/yellowpages'] } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.sefazML)) ?
          {
            label: 'Análise de NF', icon: 'fa fa-truck',
            items: [
              (this.auth.checkControleAcesso(mps.apps, mpi.apps.sefazML)) ?
                { label: 'SefazML', icon: 'fa fa-android', routerLink: ['apps/sefazML'] } : null,
              (this.auth.checkControleAcesso(mps.apps, mpi.apps.sefazRank)) ?
                { label: 'SefazRank', icon: 'fa fa-truck', routerLink: ['apps/sefazRank'] } : null,
            ]
          } : null,
        (this.auth.checkControleAcesso(mps.apps, mpi.apps.sadep)) ?
          { label: 'SADEP', icon: 'fa fa-street-view', routerLink: ['apps/sadep'] } : null,
        // (this.auth.checkControleAcesso(mps.apps, mpi.apps.pje)) ?
        //   { label: 'PJE', icon: 'fa fa-leanpub', routerLink: ['apps/pje'] } : null,
      ]
    };

    secao.items = secao.items.filter(i => i !== null);

    return (secao.items.length) ? secao : null;
  }

  getSecaoAnalise() {
    let secao;

    secao = {
      label: 'Análise', icon: 'fa fa-eye',
      items: [
        (this.auth.checkControleAcesso(mps.analise, mpi.analise.empenhos)) ?
          { label: 'Empenhos', icon: 'fa fa-usd', routerLink: ['analise/empenhos'] } : null,
        (this.auth.checkControleAcesso(mps.analise, mpi.analise.licitacoes)) ?
          { label: 'Licitações', icon: 'fa fa-envelope', routerLink: ['analise/licitacoes'] } : null,
        (this.auth.checkControleAcesso(mps.analise, mpi.analise.aditivos)) ?
          { label: 'Aditivos', icon: 'fa fa-line-chart', routerLink: ['analise/aditivos'] } : null,
        (this.auth.checkControleAcesso(mps.analise, mpi.analise.contratos)) ?
          { label: 'Contratos', icon: 'fa fa-book', routerLink: ['analise/contratos'] } : null,
        (this.auth.checkControleAcesso(mps.analise, mpi.analise.tce)) ?
          { label: 'TCE', icon: 'fa fa-dollar', routerLink: ['analise/tce']} : null,
      ]
    };

    secao.items = secao.items.filter(i => i !== null);

    return (secao.items.length) ? secao : null;
  }

  getSecaoExterno() {
    let secao;

    secao = {
      label: 'Externo', icon: 'fa fa-external-link',
      /* O acesso aos itens de menu Externo está liberado para todos os perfis */
      items: [
        { label: 'Pandora Speech', icon: 'fa fa-soundcloud', url: 'https://pandoraspeech.mppb.mp.br/', target: '_blank'},
        { label: 'GAECO Tech', icon: 'fa fa-cubes', url: 'https://gaecotech.mppb.mp.br/', target: '_blank' },
        { label: 'Fisco Cidadão', icon: 'fa fa-users', url: 'http://fiscocidadao.sindifiscopb.org.br/', target: '_blank' },
        { label: 'INVESTIG4', icon: 'fa fa-th', url: 'https://start.me/p/7k9rPp/investig4-mpsc', target: '_blank' },

        /* Funcionalidades comentadas por não estarem mais no funcionando
        (this.auth.checkControleAcesso(mps.externo, mpi.externo.altorisco)) ?
          // { label: 'Empresas de Alto Risco', icon: 'fa fa-briefcase', routerLink: ['externo/altorisco'] } : null,
          { label: 'Empresas de Alto Risco', icon: 'fa fa-briefcase', url: 'http://18.217.142.248/corruption_report', target: '_blank' } : null,
        (this.auth.checkControleAcesso(mps.externo, mpi.externo.folhapagamento)) ?
          // { label: 'Folhas de Pagamento', icon: 'fa fa-file-text-o', routerLink: ['externo/folhapagamento'] } : null,
          { label: 'Folhas de Pagamento', icon: 'fa fa-file-text-o', url: 'http://18.217.142.248/prefectures-reports/', target: '_blank' } : null,
        (this.auth.checkControleAcesso(mps.externo, mpi.externo.padroescontratacao)) ?
          //  { label: 'Tipologias de Risco', icon: 'fa fa-pencil', routerLink: ['externo/padroescontratacao'] } : null,
          { label: 'Tipologias de Risco', icon: 'fa fa-pencil', url: 'http://18.217.142.248:3821/', target: '_blank' } : null,
        */
      ]
    };

    secao.items = secao.items.filter(i => i !== null);

    return (secao.items.length) ? secao : null;
  }

  getSecaoCadastro() {
    let secao;

    secao = {
      label: 'Cadastro', icon: 'fa fa-database',
      items: [
        (this.auth.checkControleAcesso(mps.cadastro, mpi.cadastro.cadastroendereco)) ?
          { label: 'Endereço', icon: 'fa fa-road', routerLink: ['operacoes/cadastroendereco'] } : null,
        (this.auth.checkControleAcesso(mps.cadastro, mpi.cadastro.cadastrotelefone)) ?
          { label: 'Telefone', icon: 'fa fa-volume-control-phone', routerLink: ['operacoes/cadastrotelefone'] } : null,
      ]
    };

    secao.items = secao.items.filter(i => i !== null);

    return (secao.items.length) ? secao : null;
  }

  getSecaoSistema() {
    return {
      label: 'Sistema', icon: 'fa fa-gear',
      items: [
        // { label: 'Avisos', icon: 'fa fa-exclamation-triangle', routerLink: ['sistema/avisos'] },
        { label: 'Ativar Usuário', icon: 'fa fa-user-plus', routerLink: ['sistema/ativacao'] },
        { label: 'Gerenciar Usuários', icon: 'fa fa-users', routerLink: ['sistema/gerenciamento'] },
        { label: 'Logs', icon: 'fa fa-file-o', routerLink: ['sistema/logs'] },
        { label: 'Estatísticas', icon: 'fa fa-area-chart', routerLink: ['sistema/estatisticas'] },
        { label: 'Mailer', icon: 'fa fa-envelope-o', routerLink: ['sistema/mailer'] },
        { label: 'Painel de Controle', icon: 'fa fa-tachometer', routerLink: ['sistema/painelcontrole'] },
        { label: 'Limites de Acesso', icon: 'fa fa-ticket', routerLink: ['sistema/limitesacesso'] },
        // {label: 'Anomalias', icon: 'fa fa-adn', routerLink: ['sistema/anomalias']},
        { label: 'Integra - Painel', icon: 'fa fa-linkedin', routerLink: ['sistema/integra'] },
        { label: 'Gerenciar Aplicativos', icon: 'fa fa-users', routerLink: ['sistema/appgerenciamento'] }
      ]
    };
  }

  ngAfterViewInit() {
    setTimeout(() => { this.layoutMenuScrollerViewChild.moveBar(); }, 100);
  }

  onWrapperClick(event: Event) {
    this.app.onMenuClick(event);
    setTimeout(() => {
      this.layoutMenuScrollerViewChild.moveBar();
    }, 450);
  }

  ngOnDestroy() {
  }
}

@Component({
  /* tslint:disable:component-selector */
  selector: '[app-submenu]',
  /* tslint:enable:component-selector */
  template: `
    <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
        <li [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
            <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" *ngIf="!child.routerLink"
                [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                (mouseenter)="onMouseEnter(i)">

                <i [ngClass]="child.icon"></i>
                <span>{{child.label}}</span>
                <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                <i class="fa fa-fw fa-angle-down" *ngIf="child.items"></i>
            </a>

            <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink"
                [routerLink]="child.routerLink" routerLinkActive="active-menuitem-routerlink"
                [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                (mouseenter)="onMouseEnter(i)">

                <i [ngClass]="child.icon"></i>
                <span>{{child.label}}</span>
                <span class="menuitem-badge menuitem-badge-child" *ngIf="child.badge && !child.items">{{child.badge}}</span>
                <span class="menuitem-badge" *ngIf="child.badge && child.items">{{child.badge}}</span>
                <i class="fa fa-fw fa-angle-down" *ngIf="child.items"></i>
            </a>

            <div class="layout-menu-tooltip">
                <div class="layout-menu-tooltip-arrow"></div>
                <div class="layout-menu-tooltip-text">{{child.label}}</div>
            </div>
            <ul app-submenu [item]="child" *ngIf="child.items" [visible]="isActive(i)" [reset]="reset" [parentActive]="isActive(i)"
                [@children]="app.slimMenu&&root ? isActive(i) ? 'visible' : 'hidden' : isActive(i) ?
                'visibleAnimated' : 'hiddenAnimated'"></ul>
        </li>
    </ng-template>
  `,
  animations: [
    trigger('children', [
      state('hiddenAnimated', style({
        height: '0px'
      })),
      state('visibleAnimated', style({
        height: '*'
      })),
      state('visible', style({
        height: '*'
      })),
      state('hidden', style({
        height: '0px'
      })),
      transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppSubMenuComponent {

  @Input() item: MenuItem;
  @Input() root: boolean;
  @Input() visible: boolean;

  _parentActive: boolean;
  _reset: boolean;
  activeIndex: number;

  constructor(public app: AppDashboardComponent,
    public router: Router,
    public location: Location,
    public appMenu: AppMenuComponent) { }

  itemClick(event: Event, item: MenuItem, index: number) {
    if (this.root) {
      this.app.menuHoverActive = !this.app.menuHoverActive;
    }

    // avoid processing disabled items
    if (item.disabled) {
      event.preventDefault();
      return true;
    }

    // activate current item and deactivate active sibling if any
    if (item.routerLink || item.items) {
      this.activeIndex = (this.activeIndex === index) ? null : index;
    }

    // execute command
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    // prevent hash change
    if (item.items || (!item.url && !item.routerLink)) {
      setTimeout(() => {
        this.appMenu.layoutMenuScrollerViewChild.moveBar();
      }, 450);
      event.preventDefault();
    }

    // hide menu
    if (!item.items) {
      if (this.app.overlayMenu || this.app.isMobile()) {
        this.app.overlayMenuActive = false;
        this.app.mobileMenuActive = false;
      }

      if (!this.root && this.app.slimMenu) {
        this.app.resetSlim = true;
      }

      this.app.menuHoverActive = !this.app.menuHoverActive;
    }
  }

  onMouseEnter(index: number) {
    if (this.root && this.app.menuHoverActive && this.app.slimMenu) {
      this.activeIndex = index;
    }
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  unsubscribe(item: any) {
    if (item.eventEmitter) {
      item.eventEmitter.unsubscribe();
    }

    if (item.items) {
      for (const childItem of item.items) {
        this.unsubscribe(childItem);
      }
    }
  }

  @Input() get reset(): boolean {
    return this._reset;
  }

  set reset(val: boolean) {
    this._reset = val;

    if (this._reset && this.app.slimMenu) {
      this.activeIndex = null;
    }
  }

  @Input() get parentActive(): boolean {
    return this._parentActive;
  }

  set parentActive(val: boolean) {
    this._parentActive = val;

    if (!this._parentActive) {
      this.activeIndex = null;
    }
  }
}
