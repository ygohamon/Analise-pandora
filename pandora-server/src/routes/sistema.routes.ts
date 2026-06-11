import { Router } from 'express';

import {
    GuardRotasPerfilAdmin,
    GuardRotasChecaHash
} from '../services/auth/authguard.service';

import {
    getListaPerfis,
    getListaPermissoes,
    getListaAcessos,
    getListaGrupos,
    postEnviarEmail,
    getAPICachePerformance,
    clearAPICache,
    getAPICacheInfo,
    getDBServiceInfo,
    getModelCacheInfo,
    clearModelCache,
    getMailInfo,
    clearLimiteAcessoUsuario,
    getLimiteAcessoUsuarioInfo,
    clearLimiteAcessoIP,
    getLimiteAcessoIPInfo,
    getLimiteAcessoIPHistorico,
    getLimiteAcessoIPBlacklist,
    getLimiteAcessoUsuarioHistorico
} from '../controllers/sistema/sistema.controller';

const sistema: Router = Router();

// As outras rotas precisam de autorização para serem executadas
sistema.use(GuardRotasPerfilAdmin, GuardRotasChecaHash);

sistema.get('/perfil', getListaPerfis);
sistema.get('/permissao', getListaPermissoes);
sistema.get('/acesso', getListaAcessos);
sistema.get('/grupo', getListaGrupos);

/**
 * Mail Service
 */
sistema.post('/mail/enviar', postEnviarEmail);
sistema.get('/mail/info', getMailInfo);

/**
 * DBService
 */
sistema.get('/db/info', getDBServiceInfo);

/**
 * APICache Service
 */
sistema.get('/apicache/performance', getAPICachePerformance);
sistema.get('/apicache/clear/:key?', clearAPICache);
sistema.get('/apicache/info', getAPICacheInfo);

/**
 * ModelCache Service
 */
sistema.get('/modelcache/info', getModelCacheInfo);
sistema.get('/modelcache/clear/:key?', clearModelCache);

/**
 * Limite de acesso
 */
sistema.get('/limitesacesso/ip/historico/:key?', getLimiteAcessoIPHistorico);
sistema.get('/limitesacesso/ip/blacklist', getLimiteAcessoIPBlacklist);
sistema.get('/limitesacesso/ip/:key?', getLimiteAcessoIPInfo);
sistema.delete('/limitesacesso/ip/:key?', clearLimiteAcessoIP);

sistema.get('/limitesacesso/usuario/historico/:key?', getLimiteAcessoUsuarioHistorico);
sistema.get('/limitesacesso/usuario/:key?', getLimiteAcessoUsuarioInfo);
sistema.delete('/limitesacesso/usuario/:key?', clearLimiteAcessoUsuario);

export default sistema;

