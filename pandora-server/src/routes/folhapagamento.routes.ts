import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getFolhaMunicipalCdOrgaoMesAno,
    getFolhaEstadualCdOrgaoMesAno,
} from '../controllers/folhapagamento/folhapagamento.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const folhapagamento: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Folha de Pagamento' da seção 'Pesquisa'
 */
folhapagamento.use(GuardRotasLogado, GuardRotasChecaHash);
folhapagamento.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.folhapagamento }));

/**
 * Realiza o cache das rotas abaixo
 */
folhapagamento.use(cache.connect());

folhapagamento.get('/municipal', getFolhaMunicipalCdOrgaoMesAno);
folhapagamento.get('/estadual', getFolhaEstadualCdOrgaoMesAno);

export default folhapagamento;
