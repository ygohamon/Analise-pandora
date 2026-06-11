import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
  controllerDadosYellowPagesCNPJ,
  controllerDadosYellowPagesRazaoSocial,
} from '../../controllers/apps/yellowpages/yellowpages.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const yellowpages: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'yellowpages' da seção 'Apps'
 */
yellowpages.use(GuardRotasLogado, GuardRotasChecaHash);
yellowpages.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.yellowpages }));

/**
 * Realiza o cache das rotas abaixo
 */
yellowpages.use(cache.connect());

yellowpages.get('/cnpj/:cnpj', controllerDadosYellowPagesCNPJ);
yellowpages.get('/razaosocial/:razaosocial', controllerDadosYellowPagesRazaoSocial);

export default yellowpages;
