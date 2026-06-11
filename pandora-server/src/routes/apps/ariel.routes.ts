import { Router } from 'express';

import { 
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    identificaPessoaFotoCapturada,
} from '../../controllers/ariel/ariel.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const ariel: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Caça Fantasmas' da seção 'Apps'
 */
ariel.use(GuardRotasLogado, GuardRotasChecaHash);
ariel.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.ariel }));

/**
 * Realiza o cache das rotas abaixo
 */
ariel.use(cache.connect());
ariel.post('/foto', identificaPessoaFotoCapturada);

export default ariel;
