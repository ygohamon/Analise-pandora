import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getImoveisCPF,
    getImoveisCNPJ,
} from '../controllers/imoveis/imoveis.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const imoveis: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
imoveis.use(GuardRotasLogado, GuardRotasChecaHash);
imoveis.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.imovel }));

/**
 * Realiza o cache das rotas abaixo
 */
imoveis.use(cache.connect());

imoveis.get('/cpf/:cpf', getImoveisCPF);
imoveis.get('/cnpj/:cnpj', getImoveisCNPJ);

export default imoveis;
