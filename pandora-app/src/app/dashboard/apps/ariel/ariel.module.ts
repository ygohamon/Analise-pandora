import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {ArielComponent} from './ariel.component';

import { ArielService } from 'src/app/services/ariel/ariel.service';
import { UtilsService } from '../../../services/common/utils.service';

import {AppSharedModule} from '../../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ArielComponent}
];


@NgModule({
  declarations: [
    ArielComponent,
  ],
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    ArielService
  ]
})
export class ArielModule {}
