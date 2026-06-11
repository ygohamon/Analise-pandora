import { Router } from "express";
import { getDadosDetalhamentoCPF, getMandadosEmAbertoPorUF } from "../../controllers/sadep/sadep.controller";
import { cache } from "../../services/apicache.service";
import { ControleAcessoGuard, GuardRotasChecaHash, GuardRotasLogado } from "../../services/auth/authguard.service";

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';
import { getUserData } from "../../services/auth/userdata.service";

const sadep = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'SADEP' da seção 'Apps'
 */
sadep.use(GuardRotasLogado, GuardRotasChecaHash);
sadep.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.sadep }));

/**
 * Realiza o cache das rotas abaixo
 */
sadep.use(cache.connect());

sadep.get('/mandados/uf/:uf', getMandadosEmAbertoPorUF);
sadep.get('/detalhamento/cpf/:cpf', getDadosDetalhamentoCPF);

export default sadep;
