import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimbaComponent } from './simba.component';
import { SimbaRankingsComponent } from './rankings/simba.rankings.component';
import { SimbaTabelaComponent } from './simba.tabela/simba.tabela.component';

import { AppSharedModule } from '../../../shared/shared.module';
import { UtilsService } from '../../../services/common/utils.service';
import { SimbaService } from 'src/app/services/simba/simba.service';
import { ExportService } from 'src/app/services/common/export.service';

const routes: Routes = [
    { path: '', component: SimbaComponent}
];

@NgModule({
    declarations: [
      SimbaComponent,
      SimbaRankingsComponent,
      SimbaTabelaComponent
    ],
    imports: [
      AppSharedModule,
      RouterModule.forChild(routes)
    ],
    providers: [
      UtilsService,
      SimbaService,
      ExportService
    ]
})
export class SimbaModule {}
