import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {IntegraComponent} from './integra.component';
import { UtilsService } from '../../../services/common/utils.service';
import { UsuarioService } from '../../../services/usuario/usuario.service';

import {AppSharedModule} from '../../../shared/shared.module';
import { FileUploadModule } from 'ng2-file-upload';

import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';

const routes: Routes = [
  { path: '', component: IntegraComponent}
];


@NgModule({
  declarations: [
    IntegraComponent,
  ],
  imports: [
    AppSharedModule,
    FileUploadModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UtilsService,
    UsuarioService,
    PesquisaMiscService
  ]
})
export class IntegraModule {}
