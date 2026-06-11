import { NgModule } from '@angular/core';

import { EmpenhosComponent } from './empenhos/empenhos.component';
import { LicitacoesComponent } from './licitacoes/licitacoes.component';
import { AditivosComponent } from './aditivos/aditivos.component';
import { ContratosComponent } from './contratos/contratos.component';

import { AnaliseRoutesModule } from './analise.routes';
import { AppSharedModule } from '../../shared/shared.module';

import { PesquisaEmpenhoService } from '../../services/pesquisa/pesquisa.empenho.service';
import { PesquisaLicitacaoService } from '../../services/pesquisa/pesquisa.licitacao.service';
import { PesquisaAditivoService } from '../../services/pesquisa/pesquisa.aditivos.service';
import { PesquisaContratoService } from '../../services/pesquisa/pesquisa.contratos.service';
import { ExportService } from '../../services/common/export.service';
import { PesquisaTCEService } from '../../services/pesquisa/pesquisa.tce.service';
import { TCEComponent } from './tce/tce.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    EmpenhosComponent,
    LicitacoesComponent,
    AditivosComponent,
    ContratosComponent,
    TCEComponent,
    // CadastroTelefoneComponent,
  ],
  imports: [
    AppSharedModule,
    AnaliseRoutesModule,
    CalendarModule,
  ],
  providers: [
    PesquisaAditivoService,
    PesquisaContratoService,
    PesquisaEmpenhoService,
    PesquisaLicitacaoService,
    PesquisaTCEService,
    ExportService
  ]
})
export class AnaliseModule {}
