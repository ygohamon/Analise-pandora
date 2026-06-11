import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getEmpresaDetalhadoCNPJ
} from '../../controllers/dna/dna.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import {cache} from '../../services/apicache.service';

const dna: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'DNA' da seção 'Apps'
 */
dna.use(GuardRotasLogado, GuardRotasChecaHash);
dna.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.dna }));

/**
 * Realiza o cache das rotas abaixo
 */
dna.use(cache.connect());

dna.get('/cnpj/:cnpj', getEmpresaDetalhadoCNPJ);

export default dna;
