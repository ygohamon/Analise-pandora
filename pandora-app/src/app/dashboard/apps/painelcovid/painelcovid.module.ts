import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { PainelCovidComponent } from './painelcovid.component';
import { DashboardPainelCovidComponent } from './dashboard/dashboard.component';
import { DashboardPainelCovidMapaComponent } from './dashboard/dashboard.mapa.component';
import { DashboardPainelCovidTabelaGeralComponent } from './dashboard/dashboard.tabelageral.component';
import { DashboardPainelCovidFalecidoComponent } from './dashboard/dashboard.falecido.component';
import { DashboardPainelCovidAgregadoComponent } from './dashboard/dashboard.agregado.component';
import { DashboardPainelCovidResidenteExteriorComponent } from './dashboard/dashboard.residenteexterior.component';
import { DashboardPainelCovidProprietarioEmbarcacoesComponent } from './dashboard/dashboard.embarcacoes.component';
import { DashboardPainelCovidProprietarioAeronavesComponent } from './dashboard/dashboard.aeronaves.component';
import { DashboardPainelCovidProprietarioVeiculosComponent } from './dashboard/dashboard.veiculos.component';

import { AppSharedModule } from '../../../shared/shared.module';

import { UtilsService } from '../../../services/common/utils.service';
import { PainelCovidService } from './painelcovid.service';
import { ExportService } from 'src/app/services/common/export.service';
import { GeoJSONService } from 'src/app/services/common/geojson.service';

const routes: Routes = [
  { path: '', component: PainelCovidComponent}
];

@NgModule({
  declarations: [
    PainelCovidComponent,
    DashboardPainelCovidComponent,
    DashboardPainelCovidTabelaGeralComponent,
    DashboardPainelCovidMapaComponent,
    DashboardPainelCovidFalecidoComponent,
    DashboardPainelCovidAgregadoComponent,
    DashboardPainelCovidResidenteExteriorComponent,
    DashboardPainelCovidProprietarioEmbarcacoesComponent,
    DashboardPainelCovidProprietarioAeronavesComponent,
    DashboardPainelCovidProprietarioVeiculosComponent,
  ],
  imports: [
    AppSharedModule,
    LeafletModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    PainelCovidService,
    ExportService,
    GeoJSONService
  ]
})
export class PainelCovidModule {}
