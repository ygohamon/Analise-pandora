import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { RelatorioLoteComponent } from './relatorio.lote.component';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaPessoaService } from 'src/app/services/pesquisa/pesquisa.pessoa.service';

import {AppSharedModule} from '../../../shared/shared.module';
import { RelatorioModule } from 'src/app/services/relatorio/relatorio.module';
import { PesquisaEmpresaService } from 'src/app/services/pesquisa/pesquisa.empresa.service';

const routes: Routes = [
    { path: '', component: RelatorioLoteComponent}
];


@NgModule({
    declarations: [
      RelatorioLoteComponent,
    ],
    imports: [
        AppSharedModule,
        RelatorioModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        UtilsService,
        PesquisaPessoaService,
        PesquisaEmpresaService,
    ]
})
export class RelatorioLoteModule {}
