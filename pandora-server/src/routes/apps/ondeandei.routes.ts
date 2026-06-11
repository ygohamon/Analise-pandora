import { Router } from 'express';

import {
  GuardRotasChecaHash,
  GuardRotasLogado,
  ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
  controllerRegistrosPeriodoVeiculo,
} from '../../controllers/apps/ondeandei/ondeandei.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';
import { getUserData } from '../../services/auth/userdata.service';

const ondeandei: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Onde Andei' da seção 'Apps'
 */
ondeandei.use(GuardRotasLogado, GuardRotasChecaHash);
ondeandei.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.mapaconsumo }));
ondeandei.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
ondeandei.use(cache.connect());

ondeandei.get('/placa/:placa', controllerRegistrosPeriodoVeiculo);

export default ondeandei;
