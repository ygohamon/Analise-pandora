import { Router } from 'express';

import {
    GuardRotasPerfilAdmin,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getLogs,
    getRankings,
    getRecursosMaisUtilizados,
    getUsuariosQuePesquisaramValores,
    getTokensValidos,
    getEstatisticasUso,
    getRegistrosNaoEncontrados,
    getLogsAcessoUsuario
} from '../controllers/logs/logs.controller';

const logs: Router = Router();

/**
 * Protege a Rota para administradores
 */
logs.use(GuardRotasPerfilAdmin, GuardRotasChecaHash);

logs.get('/', getLogs);

logs.get('/rankings', getRankings);
logs.get('/recursos', getRecursosMaisUtilizados);
logs.get('/usuarios', getUsuariosQuePesquisaramValores);
logs.get('/tokens', getTokensValidos);
logs.get('/utilizacao', getEstatisticasUso);
logs.get('/naoencontrados', getRegistrosNaoEncontrados);
logs.get('/usuario/:usuario', getLogsAcessoUsuario)

export default logs;
