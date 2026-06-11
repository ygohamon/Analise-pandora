import { Router } from 'express';

import { 
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import { 
    getGeoCoordenadasEmpresasCPF,
} from '../controllers/geocoordenadas/geocoordenadas.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const geocoordenadas: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Geocoordenadas' da seção 'Pesquisa'
 */
geocoordenadas.use(GuardRotasLogado, GuardRotasChecaHash);
geocoordenadas.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.geocoordenada }));

/**
 * Realiza o cache das rotas abaixo
 */
geocoordenadas.use(cache.connect());

geocoordenadas.get('/mapaconsumo', getGeoCoordenadasEmpresasCPF);

export default geocoordenadas;
