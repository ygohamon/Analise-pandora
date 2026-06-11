import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppSharedModule } from '../../../shared/shared.module';

import { OrcrimComponent } from './orcrim.component';

import { DashboardComponent } from './dashboard/dashboard.orcrim.component';
import { DescricaoOrcrimComponent } from './paineis/descricao.orcrim.component';
import { MembrosOrcrimComponent } from './paineis/membros.orcrim.component';
import { MembrosPorUnidadePrisionalComponent } from './paineis/membros.por.unidade.component';
import { AdvogadoMembrosOrcrimComponent } from './paineis/advogados.membros.orcrim.component';
import { VisitantesFamiliaresOrcrimComponent } from './paineis/visitantes.familiares.orcrim.component';
import { VisitantesAdvogadosOrcrimComponent } from './paineis/visitantes.advogados.orcrim.component';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaOrcrimService } from '../../../services/pesquisa/pesquisa.orcrim.service';
import { GeoJSONService } from 'src/app/services/common/geojson.service';
import { ExportService } from 'src/app/services/common/export.service';

@NgModule({
    declarations: [
      OrcrimComponent,
      DashboardComponent,
      DescricaoOrcrimComponent,
      MembrosOrcrimComponent,
      MembrosPorUnidadePrisionalComponent,
      AdvogadoMembrosOrcrimComponent,
      VisitantesFamiliaresOrcrimComponent,
      VisitantesAdvogadosOrcrimComponent
    ],
    imports: [
      AppSharedModule,
      LeafletModule,
    ],
    providers: [
      UtilsService,
      PesquisaOrcrimService,
      GeoJSONService,
      ExportService,
    ]
})
export class OrcrimModule {}
