import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getLicitacoesCNPJ,
    getLicitacoesCPF,
    getLicitacoesDadosLicitacao,
} from '../controllers/licitacoes/licitacoes.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const licitacoes: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
licitacoes.use(GuardRotasLogado, GuardRotasChecaHash);
licitacoes.use(ControleAcessoGuard({ secao: mps.analise, item: mpi.analise.licitacoes }));

/**
 * Realiza o cache das rotas abaixo
 */
licitacoes.use(cache.connect());

licitacoes.get('/cnpj/:cnpj', getLicitacoesCNPJ);
licitacoes.get('/cpf/:cpf', getLicitacoesCPF);
licitacoes.get('/dados', getLicitacoesDadosLicitacao);

export default licitacoes;
