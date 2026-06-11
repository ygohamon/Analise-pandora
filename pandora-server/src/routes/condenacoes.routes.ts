import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getCondenacoesCPF,
    getCondenacoesTRF5CPF,
    getCondenacoesTREPBCPF,
} from '../controllers/condenacoes/condenacoes.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const condenacoes: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Condenação' da seção 'Pesquisa'
 */
condenacoes.use(GuardRotasLogado, GuardRotasChecaHash);
condenacoes.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.condenacao }));

/**
 * Realiza o cache das rotas abaixo
 */
condenacoes.use(cache.connect());

condenacoes.get('/cpf/:cpf', getCondenacoesCPF);
condenacoes.get('/trf5/cpf/:cpf', getCondenacoesTRF5CPF);
condenacoes.get('/trepb/cpf/:cpf', getCondenacoesTREPBCPF);

export default condenacoes;
