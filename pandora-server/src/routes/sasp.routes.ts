import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getSASPAlcunha,
    getSASPCPF, 
    getSASPNome, 
    getSASPRG
} from '../controllers/sasp/sasp.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const sasp: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
sasp.use(GuardRotasLogado, GuardRotasChecaHash);
sasp.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.investigado }));

/**
 * Realiza o cache das rotas abaixo
 */
sasp.use(cache.connect());

sasp.get('/cpf/:cpf', getSASPCPF);
sasp.get('/nome/:nome', getSASPNome);
sasp.get('/rg/:rg', getSASPRG);
sasp.get('/alcunha/:alcunha', getSASPAlcunha);

export default sasp;
