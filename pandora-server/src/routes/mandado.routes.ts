import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getMandadosCPF,
} from '../controllers/mandado/mandado.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const mandados: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
mandados.use(GuardRotasLogado, GuardRotasChecaHash);
mandados.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.embarcacao }));
mandados.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
mandados.use(cache.connect());

mandados.get('/cpf/:cpf', getMandadosCPF);

export default mandados;
