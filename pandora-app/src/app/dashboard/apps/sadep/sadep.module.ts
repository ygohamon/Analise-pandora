import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ExportService } from "src/app/services/common/export.service";
import { UtilsService } from "src/app/services/common/utils.service";
import { AppSharedModule } from "src/app/shared/shared.module";
import { SadepComponent } from "./sadep.component";
import { SadepService } from "./sadep.service";
import { AcessoGuard } from '../../../services/auth/authguard.service';
import { mapeamentoItensAcesso as mpi } from '../../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../../services/auth/controle.acesso';
import { DetalhamentoComponent } from "./detalhamento/detalhamento.component";
import { RelatorioModule } from "src/app/services/relatorio/relatorio.module";

const routes: Routes = [
  { path: '', component: SadepComponent },
  { path: 'detalhamento', canActivate: [AcessoGuard], component: DetalhamentoComponent, data: { secao: mps.apps, permissao: mpi.apps.sadep } }
]

@NgModule({
  declarations: [
    SadepComponent,
    DetalhamentoComponent,
  ],
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes),
    RelatorioModule
  ],
  providers: [
    UtilsService,
    SadepService,
    ExportService
  ]
})
export class SadepModule {}
