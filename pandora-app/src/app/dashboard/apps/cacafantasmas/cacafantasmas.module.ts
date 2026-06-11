import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {CacaFantasmasComponent} from './cacafantasmas.component';
import {CacaFantasmasAnaliseGeralComponent} from './tiposAnalise/analise.geral.component';
// import {CacaFantasmasAnaliseFPSisobiComponent} from './tiposAnalise/analise.fp_sisobi.component';
// import {CacaFantasmasAnaliseFPMunicipioRFComponent} from './tiposAnalise/analise.fp_municipio_rf.component';
// import {CacaFantasmasAnaliseFPMunicipioREComponent} from './tiposAnalise/analise.fp_municipio_re.component';
// import {CacaFantasmasAnaliseTipologiaEmpenhosSisobiComponent} from './tiposAnalise/analise.empenhos_sisobi.component';
// import {CacaFantasmasAnaliseFPSocioPJComponent} from './tiposAnalise/analise.fp_sociopj.component';
// import {CacaFantasmasAnaliseFPExtravinculosComponent} from './tiposAnalise/analise.fp_extravinculo.component';

import { UtilsService } from '../../../services/common/utils.service';
import { CacaFantasmasService } from '../../../services/cacafantasmas/cacafantasmas.service';
import { RelatorioCacaFantasmasGeralService } from './../../../services/relatorio/cacafantasmas/relatorio.cacafantasmas.geral.service';
import { RelatorioUtilsService } from 'src/app/services/relatorio/relatorio.utils';
import { ExportService } from 'src/app/services/common/export.service';

import { AppSharedModule } from '../../../shared/shared.module';

const routes: Routes = [
    { path: '', component: CacaFantasmasComponent}
];


@NgModule({
    declarations: [
        CacaFantasmasComponent,
        CacaFantasmasAnaliseGeralComponent,
        // CacaFantasmasAnaliseFPSisobiComponent,
        // CacaFantasmasAnaliseFPMunicipioRFComponent,
        // CacaFantasmasAnaliseFPMunicipioREComponent,
        // CacaFantasmasAnaliseTipologiaEmpenhosSisobiComponent,
        // CacaFantasmasAnaliseFPSocioPJComponent,
        // CacaFantasmasAnaliseFPExtravinculosComponent,
    ],
    imports: [
        AppSharedModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        UtilsService,
        ExportService,
        CacaFantasmasService,
        RelatorioUtilsService,
        RelatorioCacaFantasmasGeralService,
    ]
})
export class CacaFantasmasModule {}
