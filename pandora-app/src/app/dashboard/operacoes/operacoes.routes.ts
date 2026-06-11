import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroEnderecoComponent } from './cadastroendereco/cadastro.endereco.component';
import { CadastroTelefoneComponent } from './cadastrotelefone/cadastro.telefone.component';

import { AcessoGuard } from './../../services/auth/authguard.service';
import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'cadastroendereco',
        component: CadastroEnderecoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.cadastro, permissao: mpi.cadastro.cadastroendereco }
      },
      {
        path: 'cadastrotelefone',
        component: CadastroTelefoneComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.cadastro, permissao: mpi.cadastro.cadastrotelefone }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperacoesRoutesModule {}
