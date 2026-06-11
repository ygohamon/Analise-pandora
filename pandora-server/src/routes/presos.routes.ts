import { Router } from 'express';

import {
    GuardRotasPerfilPrivado,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getPrisionalDetalhadoCPF,
    getPrisionalSimplificadoVulgo,
    getPrisionalSimplificadoNome,
    getPrisionalSimplificadoCPF,
    getPrisionalSimplificadoCNC,
    getPrisionalDetalhadoCNC,
    getPrisionalSimplificadoNomeMae
} from '../controllers/presos/presos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const presos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Preso' da seção 'Pesquisa'
 */
presos.use(GuardRotasLogado, GuardRotasChecaHash);
presos.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.preso }));

/**
 * Realiza o cache das rotas abaixo
 */
presos.use(cache.connect());

presos.get('/detalhado/cpf/:cpf', getPrisionalDetalhadoCPF);
presos.get('/detalhado/cnc/:cnc', getPrisionalDetalhadoCNC);

presos.get('/simplificado/vulgo/:vulgo', getPrisionalSimplificadoVulgo);
presos.get('/simplificado/nome/:nome', getPrisionalSimplificadoNome);
presos.get('/simplificado/cpf/:cpf', getPrisionalSimplificadoCPF);
presos.get('/simplificado/cnc/:cnc', getPrisionalSimplificadoCNC);
presos.get('/simplificado/nomemae/:nomemae', getPrisionalSimplificadoNomeMae);

export default presos;
