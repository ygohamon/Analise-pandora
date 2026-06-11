import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { RecaptchaModule } from 'ng-recaptcha';

import {AppSharedModule} from '../../shared/shared.module';
import {RelatorioModule} from '../../services/relatorio/relatorio.module';

import {CadastroComponent} from './cadastro.component';

//import {RelatorioService} from '../../services/relatorio/relatorio.service';
import { UsuarioService } from '../../services/usuario/usuario.service';

const routes: Routes = [
    { path: '', component: CadastroComponent}
];


@NgModule({
    declarations: [
      CadastroComponent,
    ],
    imports: [
      AppSharedModule,
      RelatorioModule,
      RouterModule.forChild(routes),
      RecaptchaModule,
    ],
    providers: [
      UsuarioService
    ]
})
export class CadastroModule {}
