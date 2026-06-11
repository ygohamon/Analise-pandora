import { Router } from 'express';

import {
    GuardRotasPerfilPrivado,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getObitoDetalhadoCPF,
    getObitoSimplificadoCPF,
    getObitoSimplificadoNome
} from '../controllers/obitos/obitos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const obitos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Obito' da seção 'Pesquisa'
 */
obitos.use(GuardRotasLogado, GuardRotasChecaHash);
obitos.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.obito }));
obitos.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
obitos.use(cache.connect());

obitos.get('/detalhado/cpf/:cpf', getObitoDetalhadoCPF);
obitos.get('/simplificado/cpf/:cpf', getObitoSimplificadoCPF);
obitos.get('/simplificado/nome/:nome', getObitoSimplificadoNome);

export default obitos;
