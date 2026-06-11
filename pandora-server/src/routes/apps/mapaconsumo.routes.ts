import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getGeoCoordenadasEmpresasCPF,
} from '../../controllers/geocoordenadas/geocoordenadas.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const mapaconsumo: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Mapa Consumo' da seção 'Apps'
 */
mapaconsumo.use(GuardRotasLogado, GuardRotasChecaHash);
mapaconsumo.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.mapaconsumo }));

/**
 * Realiza o cache das rotas abaixo
 */
mapaconsumo.use(cache.connect());

mapaconsumo.get('/', getGeoCoordenadasEmpresasCPF);

export default mapaconsumo;
