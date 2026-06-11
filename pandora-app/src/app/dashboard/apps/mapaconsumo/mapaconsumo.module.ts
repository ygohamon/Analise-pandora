import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AppSharedModule} from '../../../shared/shared.module';

import { UtilsService } from '../../../services/common/utils.service';
import { OndeAndeiService } from 'src/app/services/mapaconsumo/ondeandei.service';

import { MapaConsumoComponent } from './mapaconsumo.component';
import { GmapComponent } from './gmap/gmap.component';

const routes: Routes = [
  { path: '', component: MapaConsumoComponent}
];

@NgModule({
  declarations: [
    MapaConsumoComponent,
    GmapComponent,
  ],
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    OndeAndeiService,
  ]
})
export class MapaConsumoModule {}
