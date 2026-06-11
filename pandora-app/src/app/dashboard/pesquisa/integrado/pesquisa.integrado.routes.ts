import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcessoGuard } from '../../../services/auth/authguard.service';
import { PessoaIntegradoComponent } from './pessoa/pessoa.integrado.component';
import { EmpresaIntegradoComponent } from './empresa/empresa.integrado.component';

import { mapeamentoItensAcesso as mpi } from '../../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../../services/auth/controle.acesso';

const routes: Routes = [
    { path: '',
        children: [
          {
            path: 'pessoa',
            component: PessoaIntegradoComponent,
            canActivate: [AcessoGuard],
            data: { secao: mps.pesquisa, permissao: mpi.pesquisa.pessoa }
          },
          {
            path: 'empresa',
            component: EmpresaIntegradoComponent,
            canActivate: [AcessoGuard],
            data: { secao: mps.pesquisa, permissao: mpi.pesquisa.empresa }
          }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PesquisaIntegradoRoutesModule { }
