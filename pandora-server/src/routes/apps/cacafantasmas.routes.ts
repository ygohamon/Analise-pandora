import { Router } from 'express';

import { 
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getTipologiasCacafantasmasUgestora,
    getOrgaoSagresMunicipal
} from '../../controllers/cacafantasmas/cacafantasmas.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const cacafantasmas: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Caça Fantasmas' da seção 'Apps'
 */
cacafantasmas.use(GuardRotasLogado, GuardRotasChecaHash);
cacafantasmas.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.cacafantasmas }));

cacafantasmas.get('/orgao/municipal/:orgao', getOrgaoSagresMunicipal);

/**
 * Realiza o cache das rotas abaixo
 */
cacafantasmas.use(cache.connect());

cacafantasmas.get('/cdugestora/:cdugestora', getTipologiasCacafantasmasUgestora);

export default cacafantasmas;
