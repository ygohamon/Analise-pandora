import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpenhosComponent } from './empenhos/empenhos.component';
import { LicitacoesComponent } from './licitacoes/licitacoes.component';
import { AditivosComponent } from './aditivos/aditivos.component';

import { AcessoGuard } from './../../services/auth/authguard.service';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';
import { ContratosComponent } from './contratos/contratos.component';
import { TCEComponent } from './tce/tce.component';


const routes: Routes = [
  { path: '',
    children: [
      {
        path: 'empenhos',
        component: EmpenhosComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.analise, permissao: mpi.analise.empenhos }
      },
      {
        path: 'licitacoes',
        component: LicitacoesComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.analise, permissao: mpi.analise.licitacoes }
      },
      {
        path: 'aditivos',
        component: AditivosComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.analise, permissao: mpi.analise.aditivos }
      },
      {
        path: 'contratos',
        component: ContratosComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.analise, permissao: mpi.analise.contratos }
      },
      {
        path: 'tce',
        component: TCEComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.analise, permissao: mpi.analise.tce}
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnaliseRoutesModule {}
