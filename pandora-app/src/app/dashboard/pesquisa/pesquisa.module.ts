import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PessoaComponent } from './pessoa/pessoa.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { EnderecoComponent } from './endereco/endereco.component';
import { VeiculoComponent } from './veiculo/veiculo.component';
import { TelefoneComponent } from './telefone/telefone.component';
import { ObitoComponent } from './obito/obito.component';
import { PresoComponent } from './preso/preso.component';
import { InvestigadoComponent } from './investigado/investigado.component';
import { ProntuarioComponent } from './prontuario/prontuario.component';
import { OrcrimComponent } from './orcrim/orcrim.component';

// import { ServidorComponent } from './servidor/servidor.component';
// import { MandadoComponent } from './mandado/mandado.component';

import { ImovelComponent } from './imovel/imovel.component';
import { ImovelDOITableComponent } from './imovel/imovel.doi.table.component';
import { ImovelITBITableComponent } from './imovel/imovel.itbi.table.component';

import { FolhaPagamentoComponent } from './folhapagamento/folhapagamento.component';
import { EmbarcacaoComponent } from './embarcacao/embarcacao.component';

import { PesquisaRoutesModule } from './pesquisa.routes';
import { AppSharedModule } from '../../shared/shared.module';

import { PesquisaPessoaService } from './../../services/pesquisa/pesquisa.pessoa.service';
import { PesquisaEmpresaService } from './../../services/pesquisa/pesquisa.empresa.service';
import { PesquisaVeiculoService } from './../../services/pesquisa/pesquisa.veiculo.service';
import { PesquisaTelefoneService } from './../../services/pesquisa/pesquisa.telefone.service';
import { PesquisaObitoService } from './../../services/pesquisa/pesquisa.obito.service';
import { PesquisaMandadoService } from './../../services/pesquisa/pesquisa.mandado.service';
import { PesquisaProntuarioService } from './../../services/pesquisa/pesquisa.prontuario.service';
import { PesquisaPresoService } from './../../services/pesquisa/pesquisa.preso.service';
import { PesquisaEnderecoService } from '../../services/pesquisa/pesquisa.endereco.service';
import { PesquisaFolhaService } from '../../services/pesquisa/pesquisa.folha.service';
import { PesquisaImovelService } from '../../services/pesquisa/pesquisa.imovel.service';
import { PesquisaEmbarcacaoService } from '../../services/pesquisa/pesquisa.embarcacao.service';
import { PesquisaInvestigadoService } from '../../services/pesquisa/pesquisa.investigado.service';
import { PesquisaAmadorService } from '../../services/pesquisa/pesquisa.amador.service';
import { PesquisaOrcrimService } from '../../services/pesquisa/pesquisa.orcrim.service';

import { RelatorioUtilsService } from '../../services/relatorio/relatorio.utils';
import { RelatorioPresoSisdepenService } from '../../services/relatorio/preso.sisdepen/preso.sisdepen.service';
import { ExportService } from '../../services/common/export.service';
import { QualificacaoService } from '../../services/common/qualificacao.service';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtHttpInterceptor } from '../../services/auth/http.interceptor';
import { PesquisaSASPService } from 'src/app/services/pesquisa/pesquisa.sasp.service';


@NgModule({
  declarations: [
    PessoaComponent,
    EmpresaComponent,
    VeiculoComponent,
    TelefoneComponent,
    PresoComponent,
    ObitoComponent,
    EnderecoComponent,
    FolhaPagamentoComponent,
    ImovelComponent,
    ImovelDOITableComponent,
    ImovelITBITableComponent,
    EmbarcacaoComponent,
    ProntuarioComponent,
    InvestigadoComponent,
  ],
  imports: [
    AppSharedModule,
    PesquisaRoutesModule,
  ],
  providers: [
    PesquisaPessoaService,
    PesquisaOrcrimService,
    PesquisaEmpresaService,
    PesquisaVeiculoService,
    PesquisaTelefoneService,
    PesquisaObitoService,
    PesquisaMandadoService,
    PesquisaAmadorService,
    PesquisaProntuarioService,
    PesquisaPresoService,
    PesquisaEnderecoService,
    PesquisaFolhaService,
    PesquisaImovelService,
    PesquisaEmbarcacaoService,
    PesquisaInvestigadoService,
    RelatorioPresoSisdepenService,
    RelatorioUtilsService,
    ExportService,
    QualificacaoService,
    PesquisaSASPService,
  ]
})
export class PesquisaModule {}
