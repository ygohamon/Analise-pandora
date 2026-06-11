import { NgModule } from '@angular/core';

import { RelatorioService } from './relatorio.service';
import { RelatorioUtilsService } from './relatorio.utils';

import { RelatorioSecaoCadastroService } from './secoes/cadastro.relatorio';

import { RelatorioSecaoEnderecosService } from './secoes/enderecos.relatorio';
import { RelatorioSecaoTelefonesService } from './secoes/telefones.relatorio';
import { RelatorioSecaoVeiculosService } from './secoes/veiculos.relatorio';
import { RelatorioSecaoAeronaveService } from './secoes/aeronaves.relatorio';
import { RelatorioSecaoEmpenhosService } from './secoes/empenhos.relatorio';
import { RelatorioSecaoMandadosService } from './secoes/mandados.relatorio';
import { RelatorioSecaoProntuarioService } from './secoes/prontuario.relatorio';
import { RelatorioSecaoOperacoesService } from './secoes/operacoes.relatorio';
import { RelatorioSecaoRIFService } from './secoes/rif.relatorio';
import { RelatorioSecaoTipologiasService } from './secoes/tipologias.relatorio';
import { RelatorioSecaoEleitoralService } from './secoes/eleitoral.relatorio';

import { RelatorioSecaoBeneficiarioService } from './secoes/pf/beneficio.relatorio';
import { RelatorioSecaoEmpregadoresService } from './secoes/pf/empregadores.relatorio';
import { RelatorioSecaoEmpresasPessoaService } from './secoes/pf/empresas.relatorio';
import { RelatorioSecaoObitoService } from './secoes/pf/obito.relatorio';
import { RelatorioSecaoPessoaService } from './secoes/pf/pessoa.relatorio';
import { RelatorioSecaoPrisionalService } from './secoes/pf/prisional.relatorio';
import { RelatorioSecaoQuadroSocietarioService } from './secoes/pf/quadro_societario.relatorio';
import { RelatorioSecaoServidorService } from './secoes/pf/servidor.relatorio';
import { RelatorioSecaoParentescosService } from './secoes/pf/parentescos.relatorio';
import { RelatorioSecaoVizinhosService } from './secoes/pf/vizinhos.relatorio';

import { RelatorioSecaoSociosService } from './secoes/pj/socios.relatorio';
import { RelatorioSecaoEmpresaService } from './secoes/pj/empresa.relatorio';
import { RelatorioSecaoEmpregadosService } from './secoes/pj/empregados.relatorio';
import { RelatorioSecaoPJQuadroSocietarioService } from './secoes/pj/quadro_societario.relatorio';
import { RelatorioSecaoFiliacaoService } from './secoes/pf/filiacao.relatorio';
import { RelatorioSecaoInformacoesVirtuaisService } from './secoes/informacoes.virtuais.relatorio';
import { RelatorioSecaoProcessosService } from './secoes/pf/processos.relatorio';


@NgModule({
    providers: [
        RelatorioService,
        RelatorioUtilsService,

        RelatorioSecaoCadastroService,

        RelatorioSecaoEnderecosService,
        RelatorioSecaoTelefonesService,
        RelatorioSecaoInformacoesVirtuaisService,
        RelatorioSecaoVeiculosService,
        RelatorioSecaoAeronaveService,
        RelatorioSecaoEmpenhosService,
        RelatorioSecaoMandadosService,
        RelatorioSecaoProntuarioService,
        RelatorioSecaoOperacoesService,
        RelatorioSecaoProcessosService,
        RelatorioSecaoRIFService,
        RelatorioSecaoTipologiasService,
        RelatorioSecaoParentescosService,
        RelatorioSecaoVizinhosService,

        RelatorioSecaoFiliacaoService,
        RelatorioSecaoEleitoralService,
        RelatorioSecaoBeneficiarioService,
        RelatorioSecaoEmpregadoresService,
        RelatorioSecaoEmpresasPessoaService,
        RelatorioSecaoObitoService,
        RelatorioSecaoPessoaService,
        RelatorioSecaoPrisionalService,
        RelatorioSecaoQuadroSocietarioService,
        RelatorioSecaoServidorService,

        RelatorioSecaoSociosService,
        RelatorioSecaoEmpresaService,
        RelatorioSecaoEmpregadosService,
        RelatorioSecaoPJQuadroSocietarioService
    ]
})
export class RelatorioModule {}
