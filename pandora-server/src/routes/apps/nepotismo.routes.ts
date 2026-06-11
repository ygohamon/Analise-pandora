import { Router } from 'express';

import {
    GuardRotasMembro,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getNepotismoUgestora,
    getNepotismoCPF
} from '../../controllers/nepotismo/nepotismo.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import {cache} from '../../services/apicache.service';

const nepotismo: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'INP' da seção 'Apps'
 */
nepotismo.use(GuardRotasLogado, GuardRotasChecaHash);
nepotismo.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.inp }));

/**
 * Realiza o cache das rotas abaixo
 */
nepotismo.use(cache.connect());

nepotismo.get('/orgao', getNepotismoUgestora);
nepotismo.get('/cpf', getNepotismoCPF);

export default nepotismo;
