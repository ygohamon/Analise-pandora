import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorModule } from 'primeng/editor';

import { AtivacaoComponent } from './ativacao/ativacao.component';

import { GerenciamentoComponent } from './gerenciamento/gerenciamento.component';
import { GerenciamentoUsuariosTableComponent } from './gerenciamento/tabela/gerenciamento.usuarios.table.component';

import { AppGerenciamentoComponent } from './aplicativos/gerenciamento.component';

import { AnomaliasComponent } from './anomalias/anomalias.component';
import { MailerComponent } from './mailer/mailer.component';
import { PainelControleComponent } from './painelcontrole/painelcontrole.component';

import { LogsComponent } from './logs/logs.component';
import { UltimosLogsComponent } from './logs/tabelas/ultimos.logs.component';
import { TokensValidosComponent } from './logs/tabelas/tokens.validos.component';

import { EstatisticasComponent } from './estatisticas/estatisticas.component';
import { SistemaRankingsComponent } from './estatisticas/tabelas/rankings.component';
import { SistemaRecursosComponent } from './estatisticas/tabelas/recursos.component';
import { SistemaUtilizacaoComponent } from './estatisticas/tabelas/utilizacao.component';
import { SistemaNaoEncontradosComponent } from './estatisticas/tabelas/naoencontrados.component';
import { LogRankingTopPFTableComponent } from './estatisticas/tabelas/ranking.toppf.datatable.component';
import { LogRankingTopPJTableComponent } from './estatisticas/tabelas/ranking.toppj.datatable.component';
import { LogRankingTopGeralTableComponent } from './estatisticas/tabelas/ranking.top.geral.datatable.component';

import { GerenciamentoIntegraComponent } from './gerenciamento.integra/gerenciamento.integra.component';
import { SistemaParametrosPesquisaComponent } from './estatisticas/tabelas/parametros.pesquisa.component';

import { LimitesAcessoComponent } from './limitesacesso/limitesacesso.component';
import { LimitesAcessoPorIPComponent } from './limitesacesso/abas/limitesacesso.ip.component';
import { LimitesAcessoPorIPBlacklistComponent } from './limitesacesso/abas/limitesacesso.ip.blacklist.component';
import { LimitesAcessoPorIPHistoricoComponent } from './limitesacesso/abas/limitesacesso.ip.historico.component';
import { LimitesAcessoPorUsuarioHistoricoComponent } from './limitesacesso/abas/limitesacesso.usuario.historico.component';
import { LimitesAcessoPorUsuarioComponent } from './limitesacesso/abas/limitesacesso.usuario.component';

import { AppSharedModule } from '../../shared/shared.module';
import { SistemaRoutesModule} from './sistema.routes';

import { DownloadService } from '../../services/download/download.service';
import { SistemaService } from '../../services/sistema/sistema.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { MailerService } from '../../services/mailer/mailer.service';
import { ExportService } from 'src/app/services/common/export.service';
// import { AvisosComponent } from './avisos/avisos.component';

@NgModule({
  declarations: [
    AtivacaoComponent,
    // AvisosComponent,
    GerenciamentoComponent,
    GerenciamentoUsuariosTableComponent,

    AppGerenciamentoComponent,

    MailerComponent,
    PainelControleComponent,

    AnomaliasComponent,
    GerenciamentoIntegraComponent,
    LogsComponent,
    UltimosLogsComponent,
    TokensValidosComponent,

    LimitesAcessoComponent,
    LimitesAcessoPorIPComponent,
    LimitesAcessoPorIPBlacklistComponent,
    LimitesAcessoPorIPHistoricoComponent,
    LimitesAcessoPorUsuarioComponent,
    LimitesAcessoPorUsuarioHistoricoComponent,

    EstatisticasComponent,
    SistemaRankingsComponent,
    SistemaRecursosComponent,
    SistemaUtilizacaoComponent,
    SistemaNaoEncontradosComponent,
    SistemaParametrosPesquisaComponent,

    LogRankingTopPFTableComponent,
    LogRankingTopPJTableComponent,
    LogRankingTopGeralTableComponent,
  ],
  imports: [
      AppSharedModule,
      SistemaRoutesModule,
      EditorModule,
  ],
  providers: [
      SistemaService,
      UsuarioService,
      DownloadService,
      MailerService,
      ExportService,
  ]
})
export class SistemaModule {}
