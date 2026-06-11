import { Router } from 'express';

import {
    GuardRotasPerfilPrivado,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getTCE_ContaBancaria,
    getTCE_Empenho,
    getTCE_EmpenhoAnulacao,
    getTCE_EmpenhoSuplementacao,
    getTCE_Licitacao,
    getTCE_Pagamento,
    getTCE_PagamentoAnulado,
    getTCE_PagamentoExtraOrcamentario,
    getTCE_PagamentoOrcamentario,
    getTCE_PagamentoOrcamentarioAnulado,
    getTCE_PagamentoRestituicaoReceita,
    getTCE_PagamentoRestosPagar,
    getTCE_PagamentoRetencao
} from '../controllers/tce/tce.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const servicoscodata: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Boletim de Ocorrência' da seção 'Pesquisa'
 */
servicoscodata.use(GuardRotasLogado, GuardRotasChecaHash);
servicoscodata.use(ControleAcessoGuard({ secao: mps.analise, item: mpi.analise.tce }));

/**
 * Realiza o cache das rotas abaixo
 */
servicoscodata.use(cache.connect());

servicoscodata.get('/conta_bancaria/:data',                 getTCE_ContaBancaria);
servicoscodata.get('/empenho/:data',                        getTCE_Empenho);
servicoscodata.get('/empenho_anulacao/:data',               getTCE_EmpenhoAnulacao);
servicoscodata.get('/empenho_suplementacao/:data',          getTCE_EmpenhoSuplementacao);
servicoscodata.get('/licitacao/:data',                      getTCE_Licitacao);
servicoscodata.get('/pagamento/:data',                      getTCE_Pagamento);
servicoscodata.get('/pagamento_anulado/:data',              getTCE_PagamentoAnulado);
servicoscodata.get('/pagamento_extra_orcamentario/:data',   getTCE_PagamentoExtraOrcamentario);
servicoscodata.get('/pagamento_orcamentario/:data',         getTCE_PagamentoOrcamentario);
servicoscodata.get('/pagamento_orcamentario_anulado/:data', getTCE_PagamentoOrcamentarioAnulado);
servicoscodata.get('/pagamento_restituicao_receita/:data',  getTCE_PagamentoRestituicaoReceita);
servicoscodata.get('/pagamento_restos_pagar/:data',         getTCE_PagamentoRestosPagar);
servicoscodata.get('/pagamento_retencao/:data',             getTCE_PagamentoRetencao);

export default servicoscodata;
