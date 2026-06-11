import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RelatorioModule } from '../../../services/relatorio/relatorio.module';

import { PessoaIntegradoComponent } from './pessoa/pessoa.integrado.component';
import { EmpresaIntegradoComponent } from './empresa/empresa.integrado.component';

import { PessoaAgrupadoComponent } from '../../../shared/apresentacao/pessoa/pessoa.agrupado.component';
import { PessoaPresoDatalistComponent } from '../../../shared/apresentacao/pessoa/pessoa.preso.datalist.component';
import { PessoaFotoCarouselComponent } from '../../../shared/apresentacao/pessoa/pessoa.foto.carousel.component';
import { PessoaMandadoDataViewComponent } from '../../../shared/apresentacao/pessoa/pessoa.mandado.dataview.component';
import { PessoaSASPDataViewComponent } from 'src/app/shared/apresentacao/pessoa/pessoa.sasp.dataview.component';
import { PessoaProntuarioDataViewComponent } from '../../../shared/apresentacao/pessoa/pessoa.prontuario.dataview.component';
import { PessoaObitoDatalistComponent } from '../../../shared/apresentacao/pessoa/pessoa.obito.datalist.component';
import { PessoaDataviewComponent } from '../../../shared/apresentacao/pessoa/pessoa.dataview.component';
import { PessoaBeneficioDatatableComponent } from '../../../shared/apresentacao/pessoa/pessoa.beneficio.datatable.component';
import { EmpregadoresDatatableComponent } from '../../../shared/apresentacao/pessoa/empregadores.datatable.component';
import { PessoaProcessoDatatableComponent } from '../../../shared/apresentacao/pessoa/pessoa.processo.datatable.component';
import { ServidorFederalDatatableComponent } from '../../../shared/apresentacao/pessoa/servidor.federal.datatable.component';
import { ServidorEstadualDatatableComponent } from '../../../shared/apresentacao/pessoa/servidor.estadual.datatable.component';
import { ServidorMunicipalTableComponent } from '../../../shared/apresentacao/pessoa/servidor.municipal.table.component';
import { QuadroSocietarioPFDatatableComponent } from '../../../shared/apresentacao/pessoa/quadro.societario.datatable.component';
import { PessoaEmpresaDatatableComponent } from '../../../shared/apresentacao/pessoa/pessoa.empresa.datatable.component';
import { CrawlersDatatableComponent } from '../../../shared/apresentacao/crawler/crawlers.datatable.component';
import { CrawlersTabelaComponent } from '../../../shared/apresentacao/crawler/dados.table.component';
import { CrawlersMotorBuscaTabelaComponent } from '../../../shared/apresentacao/crawler/motoresbusca.table.component';
import { CrawlersFacebookTabelaComponent } from '../../../shared/apresentacao/crawler/facebook.table.component';
import { CrawlersInstagramTabelaComponent } from '../../../shared/apresentacao/crawler/instagram.table.component';
import { CrawlersLinkedinTabelaComponent } from '../../../shared/apresentacao/crawler/linkedin.table.component';
import { CrawlersEscavadorTabelaComponent } from '../../../shared/apresentacao/crawler/escavador.table.component';
import { CrawlersTransparenciaTabelaComponent } from '../../../shared/apresentacao/crawler/transparencia.table.component';
import { PessoaQualificacaoComponent } from '../../../shared/apresentacao/pessoa/pessoa.qualificacao.component';
import { FiliacaoTableComponent } from '../../../shared/apresentacao/pessoa/filiacao.table.component';
import { ConselhoTableComponent } from '../../../shared/apresentacao/pessoa/conselho.table.component';
import { ParentescoDatatableComponent } from '../../../shared/apresentacao/pessoa/parentesco.datatable.component';
import { VizinhosTableComponent } from '../../../shared/apresentacao/pessoa/vizinhos.table.component';
import { BoletimOcorrenciaDataViewComponent } from '../../../shared/apresentacao/pessoa/boletim_ocorrencia.dataview.component';
import { BensDatatableComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral/bens.datatable.component';
import { DoacoesTableComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral/doacoes.table.component';
import { DoadoresTableComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral/doadores.table.component';
import { PessoaEleitoralComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral.component';
import { CandidatoTableComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral/candidatos.datatable.component';
import { EmpresaEleitoralComponent } from 'src/app/shared/apresentacao/empresa/eleitoral.component';
import { GastosTableComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral/gastos.table.component';

import { EmpresaDataviewComponent } from '../../../shared/apresentacao/empresa/empresa.dataview.component';
import { EmpresaContadorTableComponent } from '../../../shared/apresentacao/empresa/contador.table.component';
import { EmpresaAtividadeEconomicaTableComponent } from 'src/app/shared/apresentacao/empresa/atividadeeconomica.table.component';
import { EmpresaFilialDatatableComponent } from '../../../shared/apresentacao/empresa/filial.datatable.component';
import { SocioPFDatatableComponent } from '../../../shared/apresentacao/empresa/sociopf.datatable.component';
import { SocioPJDatatableComponent } from '../../../shared/apresentacao/empresa/sociopj.datatable.component';
import { SocioEstrangeiroDatatableComponent } from '../../../shared/apresentacao/empresa/socioestrangeiro.datatable.component';
import { QuadroSocietarioPJDatatableComponent } from '../../../shared/apresentacao/empresa/quadro.societario.datatable.component';
import { EmpresaEstatisticaEmpregadoressDatatableComponent } from '../../../shared/apresentacao/empresa/empregadores.datatable.component';
import { EmpresaProcessoDatatableComponent } from '../../../shared/apresentacao/empresa/processo.datatable.component';
import { VizinhosEmpresaTableComponent } from '../../../shared/apresentacao/empresa/vizinhos.table.component';

import { VirtualTableComponent } from '../../../shared/apresentacao/virtual.table.component';
import { EmpenhoDatatableComponent } from '../../../shared/apresentacao/empenho.datatable.component';
import { VeiculoDatatableComponent } from '../../../shared/apresentacao/veiculo.datatable.component';
import { AeronaveTableComponent } from '../../../shared/apresentacao/aeronave.table.component';
import { EnderecoDatatableComponent } from '../../../shared/apresentacao/endereco.datatable.component';
import { TelefoneTableComponent } from '../../../shared/apresentacao/telefone.table.component';
import { OperacaoDatatableComponent } from '../../../shared/apresentacao/operacao.datatable.component';
import { RIFComponent } from '../../../shared/apresentacao/rif.component';

import { PesquisaIntegradoRoutesModule } from './pesquisa.integrado.routes';

import { AppSharedModule } from '../../../shared/shared.module';
import { CandidatosFornecidosTableComponent } from 'src/app/shared/apresentacao/pessoa/eleitoral/candidatos.fornecedores.table.component';
import { TCUAcordaoTableComponent } from 'src/app/shared/apresentacao/processo/tcu.acordao.table.component';
import { TCUProcessoTableComponent } from 'src/app/shared/apresentacao/processo/tcu.processo.table.component';
import { TCUCondenacaoTableComponent } from 'src/app/shared/apresentacao/processo/tcu.condenacao.table.component';
import { PGFNDividaAtivaTableComponent } from 'src/app/shared/apresentacao/processo/pgfn.dividaativa.table.component';
import { CrawlersDOETabelaComponent } from 'src/app/shared/apresentacao/crawler/doe.table.component';
import { CrawlersJusbrasilTabelaComponent } from 'src/app/shared/apresentacao/crawler/jusbrasil.table.component';
import { EmbarcacaoDatatableComponent } from 'src/app/shared/apresentacao/embarcacao.datatable.component';
import { ObitosDataviewComponent } from 'src/app/shared/apresentacao/pessoa/pessoa.obito.dataview.component';
import { AmadorDataViewComponent } from 'src/app/shared/apresentacao/pessoa/amador.dataview.component';
import { PessoaImovelTableComponent } from 'src/app/shared/apresentacao/imovel.datatable.component';

import { ZoomComponent } from 'src/app/shared/apresentacao/zoom.component';
import { FichaSujaDatatableComponent } from 'src/app/shared/apresentacao/pessoa/pessoa.ficha_suja.datatable.component';
import { PessoaPEPDatatableComponent } from 'src/app/shared/apresentacao/pessoa/pessoa.pep.datatable.component';

@NgModule({
  declarations: [
    PessoaIntegradoComponent,
    EmpresaIntegradoComponent,

    PessoaAgrupadoComponent,
    PessoaPresoDatalistComponent,
    PessoaFotoCarouselComponent,
    PessoaDataviewComponent,
    PessoaMandadoDataViewComponent,
    PessoaSASPDataViewComponent,
    PessoaProntuarioDataViewComponent,
    AmadorDataViewComponent,
    EmbarcacaoDatatableComponent,
    PessoaObitoDatalistComponent,
    PessoaBeneficioDatatableComponent,
    ObitosDataviewComponent,
    PessoaImovelTableComponent,
    EmpregadoresDatatableComponent,
    ServidorFederalDatatableComponent,
    ServidorEstadualDatatableComponent,
    ServidorMunicipalTableComponent,
    QuadroSocietarioPFDatatableComponent,
    PessoaEmpresaDatatableComponent,
    CrawlersDatatableComponent,
    CrawlersTabelaComponent,
    CrawlersMotorBuscaTabelaComponent,
    CrawlersFacebookTabelaComponent,
    CrawlersInstagramTabelaComponent,
    CrawlersLinkedinTabelaComponent,
    CrawlersEscavadorTabelaComponent,
    CrawlersTransparenciaTabelaComponent,
    CrawlersDOETabelaComponent,
    CrawlersJusbrasilTabelaComponent,

    PessoaQualificacaoComponent,
    FiliacaoTableComponent,

    PessoaEleitoralComponent,
    EmpresaEleitoralComponent,
    BensDatatableComponent,
    DoacoesTableComponent,
    DoadoresTableComponent,
    CandidatoTableComponent,
    GastosTableComponent,
    CandidatosFornecidosTableComponent,

    ConselhoTableComponent,
    PessoaProcessoDatatableComponent,
    ParentescoDatatableComponent,
    VizinhosTableComponent,
    BoletimOcorrenciaDataViewComponent,

    EmpresaDataviewComponent,
    EmpresaContadorTableComponent,
    EmpresaAtividadeEconomicaTableComponent,
    EmpresaFilialDatatableComponent,
    SocioPFDatatableComponent,
    SocioPJDatatableComponent,
    SocioEstrangeiroDatatableComponent,
    QuadroSocietarioPJDatatableComponent,
    EmpresaEstatisticaEmpregadoressDatatableComponent,
    EmpresaProcessoDatatableComponent,
    VizinhosEmpresaTableComponent,

    PGFNDividaAtivaTableComponent,
    TCUAcordaoTableComponent,
    TCUProcessoTableComponent,
    TCUCondenacaoTableComponent,

    VirtualTableComponent,
    EmpenhoDatatableComponent,
    VeiculoDatatableComponent,
    EnderecoDatatableComponent,
    TelefoneTableComponent,
    AeronaveTableComponent,
    OperacaoDatatableComponent,
    RIFComponent,

    ZoomComponent,
    FichaSujaDatatableComponent,
    PessoaPEPDatatableComponent
  ],
  imports: [
    AppSharedModule,
    RelatorioModule,
    PesquisaIntegradoRoutesModule,
  ],
  providers: [
    //RelatorioService,
  ]
})
export class PesquisaIntegradoModule { }
