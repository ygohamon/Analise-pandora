import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppDashboardComponent } from './app.dashboard.component';
import { HomeComponent } from './home/home.component';

import { AuthGuard, AdminGuard, AcessoGuard } from './../services/auth/authguard.service';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';


const routes: Routes = [
  {
    path: '', component: AppDashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home'},
      { path: 'home', component: HomeComponent },
      {
        path: 'pesquisa',
        loadChildren: () => import('./pesquisa/pesquisa.module').then(m => m.PesquisaModule),
        canLoad: [AcessoGuard],
        data: { secao: mps.pesquisa, checaSecao: true }
      },
      {
        path: 'operacoes',
        loadChildren: () => import('./operacoes/operacoes.module').then(m => m.OperacoesModule),
        canLoad: [AcessoGuard],
        data: { secao: mps.cadastro, checaSecao: true }
      },
      {
        path: 'analise',
        loadChildren: () => import('./analise/analise.module').then(m => m.AnaliseModule),
        canLoad: [AcessoGuard],
        data: { secao: mps.analise, checaSecao: true }
      },
      {
        path: 'externo',
        loadChildren: () => import('./externo/externo.module').then(m => m.ExternoModule),
        canLoad: [AcessoGuard],
        data: { secao: mps.externo, checaSecao: true }
      },
      {
        path: 'sistema',
        loadChildren: () => import('./sistema/sistema.module').then(m => m.SistemaModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'apps',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'relatorio' },
          {
            path: 'tiporank',
            loadChildren: () => import('./apps/tiporank/tiporank.module').then(m => m.TipoRankModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.tiporank }
          },
          {
            path: 'erbtracker',
            loadChildren: () => import('./apps/erbtracker/erbtracker.module').then(m => m.ERBTrackerModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.erbtracker }
          },
          {
            path: 'mapaconsumo',
            loadChildren: () => import('./apps/mapaconsumo/mapaconsumo.module').then(m => m.MapaConsumoModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.mapaconsumo }
          },
          {
            path: 'relacionamentos',
            loadChildren: () => import('./apps/relacionamentos/relacionamentos.module').then(m => m.RelacionamentosModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.relacionamentos }
          },
          {
            path: 'relatorio',
            loadChildren: () => import('./apps/relatoriolote/relatorio.lote.module').then(m => m.RelatorioLoteModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.relatoriointegrado }
          },
          {
            path: 'qualificacaolote',
            loadChildren: () => import('./apps/qualificacaolote/qualificacao.lote.module').then(m => m.QualificacaoLoteModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.relatoriointegrado }
          },
          {
            path: 'dna',
            loadChildren: () => import('./apps/dna/dna.module').then(m => m.DNAModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.dna }
          },
          {
            path: 'painelcovid',
            loadChildren: () => import('./apps/painelcovid/painelcovid.module').then(m => m.PainelCovidModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.painelcovid }
          },
          {
            path: 'cacafantasmas',
            loadChildren: () => import('./apps/cacafantasmas/cacafantasmas.module').then(m => m.CacaFantasmasModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.cacafantasmas }
          },
          // {
          //   path: 'analiseciclos',
          //   loadChildren: './apps/analiseciclos/analise.ciclos.module#AnaliseCiclosModule',
          //   canLoad: [AcessoGuard],
          //   canActivate: [AcessoGuard],
          //   data: { secao: mps.apps, permissao: mpi.apps.analiseciclos }
          // },
          {
            path: 'ariel',
            loadChildren: () => import('./apps/ariel/ariel.module').then(m => m.ArielModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.ariel }
          },
          {
            path: 'inp',
            loadChildren: () => import('./apps/inp/inp.module').then(m => m.INPModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.inp }
          },
          {
            path: 'integra',
            loadChildren: () => import('./apps/integra/integra.module').then(m => m.IntegraModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.integra }
          },
          {
            path: 'simba',
            loadChildren: () => import('./apps/simba/simba.module').then(m => m.SimbaModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.simba }
          },
          {
            path: 'yellowpages',
            loadChildren: () => import('./apps/yellowpages/yellowpages.module').then(m => m.YellowPagesModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.yellowpages }
          },
          {
            path: 'sefazML',
            loadChildren: () => import('./apps/sefazML/sefazML.module').then(m => m.SefazMLModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.sefazML }
          },
          {
            path: 'sefazRank',
            loadChildren: () => import('./apps/sefazRank/sefazRank.module').then(m => m.SefazRankModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.sefazRank }
          },
          {
            path: 'sadep',
            loadChildren: () => import('./apps/sadep/sadep.module').then(m => m.SadepModule),
            canLoad: [AcessoGuard],
            canActivate: [AcessoGuard],
            data: { secao: mps.apps, permissao: mpi.apps.sadep}
          }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppDashboardRoutesModule { }
