import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getTabelaGeralPainelCovidUF
} from '../../controllers/painelcovid/painelcovid.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import {cache} from '../../services/apicache.service';

const painelcovid: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'DNA' da seção 'Apps'
 */
painelcovid.use(GuardRotasLogado, GuardRotasChecaHash);
painelcovid.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.painelcovid }));

/**
 * Realiza o cache das rotas abaixo
 */
painelcovid.use(cache.connect());

painelcovid.get('/tabelageral/:uf', getTabelaGeralPainelCovidUF);

export default painelcovid;
