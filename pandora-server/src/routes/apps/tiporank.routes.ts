import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getTipologiaSimplificadoUFMunicipio,
    getMunicioUF
} from '../../controllers/tiporank/tiporank.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const tiporank: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'TipoRank' da seção 'Apps'
 */
tiporank.use(GuardRotasLogado, GuardRotasChecaHash);
tiporank.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.tiporank }));

/**
 * Realiza o cache das rotas abaixo
 */
tiporank.use(cache.connect());

tiporank.get('/uf/:uf/municipio/:municipio', getTipologiaSimplificadoUFMunicipio);
tiporank.get('/uf/:uf', getMunicioUF);

export default tiporank;
