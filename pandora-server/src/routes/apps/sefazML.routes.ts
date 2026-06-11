import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getItensDiscrepantes,
    getItensDiscrepantesMunicipio,
    getItemNFDetalhado,
    getTopFornecedoresComFiltros,
    getTodasVendasFornecedor,
    getNomesProdutos
} from '../../controllers/sefazML/sefazML.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const sefazML: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Caça Fantasmas' da seção 'Apps'
 */
sefazML.use(GuardRotasLogado, GuardRotasChecaHash);
sefazML.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.sefazML }));

/**
 * Realiza o cache das rotas abaixo
 */
sefazML.use(cache.connect());
sefazML.get('/', getItensDiscrepantes);
sefazML.get('/municipio/:municipio', getItensDiscrepantesMunicipio);
sefazML.get('/item/:idItem', getItemNFDetalhado);
sefazML.get('/topfornecedores/:top', getTopFornecedoresComFiltros)
sefazML.get('/vendasfornecedor/', getTodasVendasFornecedor)
sefazML.get('/produto/', getNomesProdutos)

export default sefazML;
