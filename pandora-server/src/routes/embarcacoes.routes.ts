import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getEmbarcacoesCNPJ,
    getEmbarcacoesCPF,
    getEmbarcacaoNome,
    getEmbarcacaoInscricao
} from '../controllers/embarcacoes/embarcacoes.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const embarcacoes: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
embarcacoes.use(GuardRotasLogado, GuardRotasChecaHash);
embarcacoes.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.embarcacao }));
embarcacoes.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
embarcacoes.use(cache.connect());

embarcacoes.get('/cpf/:cpf', getEmbarcacoesCPF);
embarcacoes.get('/cnpj/:cnpj', getEmbarcacoesCNPJ);
embarcacoes.get('/embarcacao/:embarcacao', getEmbarcacaoNome);
embarcacoes.get('/inscricao/:inscricao', getEmbarcacaoInscricao);


export default embarcacoes;
