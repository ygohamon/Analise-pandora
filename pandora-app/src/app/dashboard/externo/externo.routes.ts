import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcessoGuard } from './../../services/auth/authguard.service';

import { ExternoAltoRiscoComponent } from './altorisco/altorisco.component';
import { ExternoFolhaPagamentoComponent } from './folhapagamento/folhapagamento.component';
import { ExternoPadroesContratacaoComponent } from './padroescontratacao/padroescontratacao.component';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'altorisco',
        component: ExternoAltoRiscoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.externo, permissao: mpi.externo.altorisco }
      },
      {
        path: 'folhapagamento',
        component: ExternoFolhaPagamentoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.externo, permissao: mpi.externo.folhapagamento }
      },
      {
        path: 'padroescontratacao',
        component: ExternoPadroesContratacaoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.externo, permissao: mpi.externo.padroescontratacao }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExternoRoutesModule { }
