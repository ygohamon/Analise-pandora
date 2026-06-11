import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
  getAditivosCNPJ,
  getAditivosCPF,
  getAditivosNuLicitacao
} from '../controllers/aditivos/aditivos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const aditivos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'aditivos' da seção 'Análise'
 */
aditivos.use(GuardRotasLogado, GuardRotasChecaHash);
aditivos.use(ControleAcessoGuard({ secao: mps.analise, item: mpi.analise.aditivos }));

/**
 * Realiza o cache das rotas abaixo
 */
aditivos.use(cache.connect());

aditivos.get('/cnpj/:cnpj', getAditivosCNPJ);
aditivos.get('/cpf/:cpf', getAditivosCPF);
aditivos.get('/nulicitacao/:nulicitacao', getAditivosNuLicitacao);

export default aditivos;
