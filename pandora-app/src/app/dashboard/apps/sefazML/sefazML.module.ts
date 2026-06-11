import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {SefazMLComponent} from './sefazML.component';
import { ExportService } from 'src/app/services/common/export.service';
import {UtilsService} from '../../../services/common/utils.service';
import {AppSharedModule} from '../../../shared/shared.module';
import { SefazMLService } from '../../../services/sefazML/sefazML.service';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';

import { DashboardSefazMLComponent } from '../sefazML/dashboard/dashboard.component';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { RelatorioModule } from '../../../services/relatorio/relatorio.module';
import { AuthService } from './../../../services/auth/auth.service';
import { AcessoGuard } from '../../../services/auth/authguard.service';
import { mapeamentoItensAcesso as mpi } from '../../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../../services/auth/controle.acesso';

const routes: Routes = [
    { path: '', component: SefazMLComponent},
    { path: 'dashboard', canActivate: [AcessoGuard], component: DashboardSefazMLComponent, data: { secao: mps.apps, permissao: mpi.apps.sefazML }}
];

@NgModule({
    declarations: [
      SefazMLComponent,
      DashboardSefazMLComponent
    ],
    imports: [
      AppSharedModule,
      RouterModule.forChild(routes),
      RelatorioModule,
    ],
    providers: [
      UtilsService,
      SefazMLService,
      ExportService,
      PesquisaMiscService,
    ]
})
export class SefazMLModule {}
