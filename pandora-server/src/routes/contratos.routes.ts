import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
  getContratosCNPJ,
  getContratosCPF,
  getContratosNuContrato,
  getContratosNuLicitacao,
} from '../controllers/contratos/contratos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const contratos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'contratos' da seção 'Análise'
 */
contratos.use(GuardRotasLogado, GuardRotasChecaHash);
contratos.use(ControleAcessoGuard({ secao: mps.analise, item: mpi.analise.contratos }));

/**
 * Realiza o cache das rotas abaixo
 */
contratos.use(cache.connect());

contratos.get('/cnpj/:cnpj', getContratosCNPJ);
contratos.get('/cpf/:cpf', getContratosCPF);
contratos.get('/nulicitacao/:nulicitacao', getContratosNuLicitacao);
contratos.get('/nucontrato/:nucontrato', getContratosNuContrato);

export default contratos;
