import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PessoaComponent } from './pessoa/pessoa.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { EnderecoComponent } from './endereco/endereco.component';
import { VeiculoComponent } from './veiculo/veiculo.component';
import { TelefoneComponent } from './telefone/telefone.component';
import { ObitoComponent } from './obito/obito.component';
import { PresoComponent } from './preso/preso.component';
import { FolhaPagamentoComponent } from './folhapagamento/folhapagamento.component';
import { ImovelComponent } from './imovel/imovel.component';
import { EmbarcacaoComponent } from './embarcacao/embarcacao.component';
import { InvestigadoComponent } from './investigado/investigado.component';
import { ProntuarioComponent } from './prontuario/prontuario.component';
import { OrcrimComponent } from './orcrim/orcrim.component';
// import { ServidorComponent } from './servidor/servidor.component';
// import { MandadoComponent } from './mandado/mandado.component';

import { AcessoGuard } from '../../services/auth/authguard.service';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';



const routes: Routes = [
  { path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pessoa'
      },
      {
        path: 'pessoa',
        component: PessoaComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.pessoa }
      },
      {
        path: 'empresa',
        component: EmpresaComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.empresa }
      },
      {
        path: 'endereco',
        component: EnderecoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.endereco }
      },
      {
        path: 'telefone',
        component: TelefoneComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.telefone }
      },
      {
        path: 'veiculo',
        component: VeiculoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.veiculo }
      },
      {
        path: 'preso',
        component: PresoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.preso }
      },
      {
        path: 'obito',
        component: ObitoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.obito }
      },
      {
        path: 'folhapagamento',
        component: FolhaPagamentoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.folhapagamento }
      },
      {
        path: 'imovel',
        component: ImovelComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.imovel }
      },
      {
        path: 'embarcacao',
        component: EmbarcacaoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.embarcacao }
      },
      {
        path: 'investigado',
        component: InvestigadoComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.investigado }
      },
      {
        path: 'prontuario',
        component: ProntuarioComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.prontuario }
      },
      {
        path: 'orcrim',
        component: OrcrimComponent,
        canActivate: [AcessoGuard],
        data: { secao: mps.pesquisa, permissao: mpi.pesquisa.orcrim }
      },
      {
        path: 'integrado',
        loadChildren: () => import('./integrado/pesquisa.integrado.module').then(m => m.PesquisaIntegradoModule),
      },
      {
        path: 'orcrins',
        loadChildren: () => import('./orcrim/orcrim.module').then(m => m.OrcrimModule),
      },
      // { path: 'mandado', component: MandadoComponent, canActivate: [PrivadoGuard]},
      // { path: 'servidor', component: ServidorComponent, canActivate: [PrivadoGuard]},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PesquisaRoutesModule {}
