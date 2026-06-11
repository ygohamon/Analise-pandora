import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DialogService } from 'primeng/dynamicdialog';

import {RelacionamentosComponent} from './relacionamentos.component';
import { DialogPainelBuscasComponent } from './painel/painelbuscas.component';
import { RelacionamentosInfoEntidadePessoaComponent } from './informacoes/pessoa.entidade.component';
import { RelacionamentosInfoEntidadeEmpresaComponent } from './informacoes/empresa.entidade.component';
import { RelacionamentosInfoEntidadeEnderecoComponent } from './informacoes/endereco.entidade.component';
import { RelacionamentosInfoEntidadeOrgaoComponent } from './informacoes/orgao.entidade.component';
import { RelacionamentosInfoEntidadeTelefoneComponent } from './informacoes/telefone.entidade.component';

import { UtilsService } from '../../../services/common/utils.service';
import { RelatorioUtilsService } from 'src/app/services/relatorio/relatorio.utils';
import {RelatorioRelacionamentosService} from '../../../services/relacionamentos/relatorio.relacionamentos.service';
import {RelacionamentosService} from '../../../services/relacionamentos/relacionamentos.service';

import {AppSharedModule} from '../../../shared/shared.module';

const routes: Routes = [
    { path: '', component: RelacionamentosComponent}
];


@NgModule({
    declarations: [
      RelacionamentosComponent,
      DialogPainelBuscasComponent,
      RelacionamentosInfoEntidadePessoaComponent,
      RelacionamentosInfoEntidadeEmpresaComponent,
      RelacionamentosInfoEntidadeEnderecoComponent,
      RelacionamentosInfoEntidadeOrgaoComponent,
      RelacionamentosInfoEntidadeTelefoneComponent,
    ],
    imports: [
        AppSharedModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        UtilsService,
        RelatorioRelacionamentosService,
        RelatorioUtilsService,
        RelacionamentosService,
        DialogService,
    ],
    entryComponents: [DialogPainelBuscasComponent],
})
export class RelacionamentosModule {}
