import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtivacaoComponent } from './ativacao/ativacao.component';
import { GerenciamentoComponent } from './gerenciamento/gerenciamento.component';
import { LogsComponent } from './logs/logs.component';
import { EstatisticasComponent } from './estatisticas/estatisticas.component';
import { AnomaliasComponent } from './anomalias/anomalias.component';
import { MailerComponent } from './mailer/mailer.component';
import { PainelControleComponent } from './painelcontrole/painelcontrole.component';
import { LimitesAcessoComponent } from './limitesacesso/limitesacesso.component';
import { GerenciamentoIntegraComponent } from './gerenciamento.integra/gerenciamento.integra.component';

import { AuthGuard, AdminGuard } from '../../services/auth/authguard.service';
import { AppGerenciamentoComponent } from './aplicativos/gerenciamento.component';
// import { AvisosComponent } from './avisos/avisos.component';

const routes: Routes = [
  { path: '', canActivate: [AdminGuard],
    children: [
        { path: '', pathMatch: 'full', redirectTo: 'gerenciamento' },
        { path: 'gerenciamento',    component: GerenciamentoComponent },
        { path: 'ativacao',         component: AtivacaoComponent },
        { path: 'logs',             component: LogsComponent },
        { path: 'estatisticas',     component: EstatisticasComponent },
        { path: 'anomalias',        component: AnomaliasComponent },
        { path: 'mailer',           component: MailerComponent },
        { path: 'painelcontrole',   component: PainelControleComponent },
        { path: 'limitesacesso',    component: LimitesAcessoComponent },
        { path: 'integra',          component: GerenciamentoIntegraComponent },
        { path: 'appgerenciamento', component: AppGerenciamentoComponent }
        // { path: 'avisos',         component: AvisosComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SistemaRoutesModule {}
