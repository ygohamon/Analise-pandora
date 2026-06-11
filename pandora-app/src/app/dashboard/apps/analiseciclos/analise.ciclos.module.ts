import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {AnaliseCiclosComponent} from './analise.ciclos.component';

import {RelatorioRelacionamentosService} from '../../../services/relacionamentos/relatorio.relacionamentos.service';
import {RelacionamentosService} from '../../../services/relacionamentos/relacionamentos.service';
import { CacaFantasmasService } from '../../../services/cacafantasmas/cacafantasmas.service';
import { UtilsService } from '../../../services/common/utils.service';

import {AppSharedModule} from '../../../shared/shared.module';

const routes: Routes = [
  { path: '', component: AnaliseCiclosComponent}
];


@NgModule({
  declarations: [
    AnaliseCiclosComponent,
  ],
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    RelatorioRelacionamentosService,
    RelacionamentosService,
    CacaFantasmasService,
  ]
})
export class AnaliseCiclosModule {}
