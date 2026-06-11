import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { QualificacaoLoteComponent } from './qualificacao.lote.component';

import {AppSharedModule} from '../../../shared/shared.module';
import { RelatorioModule } from 'src/app/services/relatorio/relatorio.module';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaPessoaService } from 'src/app/services/pesquisa/pesquisa.pessoa.service';
import { PesquisaEmpresaService } from 'src/app/services/pesquisa/pesquisa.empresa.service';
import { ExportService } from 'src/app/services/common/export.service';
import { QualificacaoService } from 'src/app/services/common/qualificacao.service';


const routes: Routes = [
    { path: '', component: QualificacaoLoteComponent}
];

@NgModule({
    declarations: [
      QualificacaoLoteComponent,
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
        ExportService,
        QualificacaoService,
    ]
})
export class QualificacaoLoteModule {}
