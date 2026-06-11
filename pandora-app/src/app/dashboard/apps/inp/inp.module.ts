import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { INPComponent } from './inp.component';
import { INPAnaliseOrgaoComponent } from './apresentacao/analise.orgao.component';
import { INPAnaliseCPFComponent } from './apresentacao/analise.cpf.component';

import { UtilsService } from '../../../services/common/utils.service';
import { INPService } from '../../../services/inp/inp.service';
import { ExportService } from 'src/app/services/common/export.service';

import {AppSharedModule} from '../../../shared/shared.module';

const routes: Routes = [
  { path: '', component: INPComponent}
];


@NgModule({
  declarations: [
    INPComponent,
    INPAnaliseOrgaoComponent,
    INPAnaliseCPFComponent
  ],
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    INPService,
    ExportService,
  ]
})
export class INPModule {}
