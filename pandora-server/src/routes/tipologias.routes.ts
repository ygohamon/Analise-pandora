import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getTipologiaSimplificadoCPF,
    getTipologiaSimplificadoCNPJ
} from '../controllers/tipologias/tipologias.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';


const tipologias: Router = Router();

tipologias.use(GuardRotasLogado, GuardRotasChecaHash);
tipologias.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.tipologia }));

/**
 * Realiza o cache das rotas abaixo
 */
tipologias.use(cache.connect());

tipologias.get('/simplificado/cpf/:cpf', getTipologiaSimplificadoCPF);
tipologias.get('/simplificado/cnpj/:cnpj', getTipologiaSimplificadoCNPJ);

export default tipologias;
