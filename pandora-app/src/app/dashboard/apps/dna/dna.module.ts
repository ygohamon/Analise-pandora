import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppSharedModule } from '../../../shared/shared.module';

import { DNAComponent } from './dna.component';
import { MapaDNAComponent } from './mapa/mapa.dna.component';
import { DNAInformacoesGeraisComponent } from './paineis/informacoes.gerais.component';
import { DNASociosPFComponent } from './paineis/socio.pf.component';
import { DNASociosPJComponent } from './paineis/socio.pj.component';
import { DNAAtividadeEconomicaComponent } from './paineis/atividade.economica.component';
import { DNAInformacoesSociosComponent } from './paineis/informacoes.socios.component';
import { DNAInformacoesEleitoraisComponent } from './paineis/informacoes.eleitorais.component';
import { DNAContadoresComponent } from './paineis/contadores.component';
import { DNAEmpresasPagasContadoresComponent } from './paineis/empresas.pagas.contadores.component';
import { DNAEmpresasLicitantesContadoresComponent } from './paineis/empresas.licitantes.contadores.component';
import { DNARankingEmpenhosComponent } from './paineis/ranking.empenho.component';
import { DNAEmpresasMesmoEmailComponent } from './paineis/empresas.mesmo.email.component';
import { DNAEmpresasMesmoTelefoneComponent } from './paineis/empresas.mesmo.telefone.component';
import { DNATipologiasComponent } from './paineis/tipologias.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { UtilsService } from '../../../services/common/utils.service';
import { DNAService } from '../../../services/dna/dna.service';
import { GeoJSONService } from 'src/app/services/common/geojson.service';
import { ExportService } from 'src/app/services/common/export.service';

const routes: Routes = [
  { path: '', component: DNAComponent}
];

@NgModule({
    declarations: [
      DNAComponent,
      MapaDNAComponent,
      DNAInformacoesGeraisComponent,
      DNAAtividadeEconomicaComponent,
      DNASociosPFComponent,
      DNASociosPJComponent,
      DNATipologiasComponent,
      DNAInformacoesSociosComponent,
      DNAInformacoesEleitoraisComponent,
      DNAContadoresComponent,
      DNAEmpresasPagasContadoresComponent,
      DNAEmpresasLicitantesContadoresComponent,
      DNARankingEmpenhosComponent,
      DNAEmpresasMesmoEmailComponent,
      DNAEmpresasMesmoTelefoneComponent,
      DashboardComponent,
    ],
    imports: [
      AppSharedModule,
      LeafletModule,
      RouterModule.forChild(routes)
    ],
    providers: [
      UtilsService,
      DNAService,
      GeoJSONService,
      ExportService,
    ]
})
export class DNAModule {}
