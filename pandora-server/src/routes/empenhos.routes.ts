import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
  getEmpenhosCNPJ,
  getEmpenhosCPF,
} from '../controllers/empenhos/empenhos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const empenhos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Empenhos' da seção 'Análise'
 */
empenhos.use(GuardRotasLogado, GuardRotasChecaHash);
empenhos.use(ControleAcessoGuard({ secao: mps.analise, item: mpi.analise.empenhos }));

/**
 * Realiza o cache das rotas abaixo
 */
empenhos.use(cache.connect());

empenhos.get('/cnpj/:cnpj', getEmpenhosCNPJ);
empenhos.get('/cpf/:cpf', getEmpenhosCPF);

export default empenhos;
