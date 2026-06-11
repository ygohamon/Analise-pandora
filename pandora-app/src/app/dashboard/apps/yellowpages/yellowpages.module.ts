import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { YellowPagesComponent } from './yellowpages.component';

import { UtilsService } from '../../../services/common/utils.service';
import { AppSharedModule } from '../../../shared/shared.module';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';
import { ExportService } from 'src/app/services/common/export.service';

const routes: Routes = [
  { path: '', component: YellowPagesComponent}
];

@NgModule({
  declarations: [
    YellowPagesComponent,
  ],
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    PesquisaMiscService,
    ExportService,
  ]
})
export class YellowPagesModule {}
