import { Router } from 'express';

import {
  GuardRotasLogado,
  GuardRotasChecaHash,
  ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
  getInvestigadoCPF,
  getInvestigadoCNPJ,
  getInvestigadoOperacao,
  getInvestigadoNome,
  getInvestigadoRazaoSocial,
  getInvestigadoAlcunha,
} from '../controllers/investigados/investigados.controller';

import { cache } from '../services/apicache.service';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';
import { GuardLimiteAcessoPorUsuario } from '../services/auth/limiters.service';

const investigados: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Investigado' da seção 'Pesquisa'
 */
investigados.use(GuardRotasLogado, GuardRotasChecaHash);
investigados.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.investigado }));

/**
 *  Protege de ataques repetidos
 */
investigados.use(GuardLimiteAcessoPorUsuario);

/**
 * Realiza o cache das rotas abaixo
 */
investigados.use(cache.connect());

investigados.get('/cpf/:cpf', getInvestigadoCPF);
investigados.get('/cnpj/:cnpj', getInvestigadoCNPJ);
investigados.get('/operacao/:operacao', getInvestigadoOperacao);
investigados.get('/nome/:nome', getInvestigadoNome);
investigados.get('/razaosocial/:razaosocial', getInvestigadoRazaoSocial);
investigados.get('/alcunha/:alcunha', getInvestigadoAlcunha);

export default investigados;
