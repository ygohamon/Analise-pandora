import { Router } from 'express';

import { 
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getTopPessoaCNPJ,
    getTopPessoaCPF
} from '../../controllers/simba/simba.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const simba: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Caça Fantasmas' da seção 'Apps'
 */
simba.use(GuardRotasLogado, GuardRotasChecaHash);
simba.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.simba }));

/**
 * Realiza o cache das rotas abaixo
 */
simba.use(cache.connect());

simba.get('/top/cpf/:cpf', getTopPessoaCPF);
simba.get('/top/cnpj/:cnpj', getTopPessoaCNPJ);

export default simba;
