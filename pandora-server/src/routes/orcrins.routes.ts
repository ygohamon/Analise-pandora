import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
  getDadosOrganizacoesCriminosas,
  getOrganizacoesCriminosas_HIRI
} from '../controllers/orcrins/orcrim.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';


const orcrins: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
orcrins.use(GuardRotasLogado, GuardRotasChecaHash);
orcrins.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.orcrim }));

/**
 * Realiza o cache das rotas abaixo
 */
orcrins.use(cache.connect());

orcrins.get('/', getOrganizacoesCriminosas_HIRI);

orcrins.get('/orcrim/:orcrim', getDadosOrganizacoesCriminosas);

export default orcrins;
