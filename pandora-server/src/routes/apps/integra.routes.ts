import { Router } from 'express';
import * as multer from 'multer';

import {
    GuardRotasMembro,
    GuardRotasPerfilAdmin,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import { 
    cadastraRequisicaoIntegra,
    listaRequisicoesIntegra,
    finalizaRequisicoesIntegra,
    downloadAnexoRequisicoesIntegra,
    getPromotoriasMPPB
} from '../../controllers/integra/integra.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//const upload = multer({dest: './uploads'});

const integra: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Integra' da seção 'Apps'
 */
integra.use(GuardRotasLogado, GuardRotasChecaHash);
integra.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.integra }));

integra.post('/', upload.any(), cadastraRequisicaoIntegra);


/**
 * Protege a Rota para administradores
 */
integra.use(GuardRotasPerfilAdmin, GuardRotasChecaHash);

integra.get('/', listaRequisicoesIntegra);
integra.patch('/finaliza/:id', finalizaRequisicoesIntegra);
integra.get('/anexo/:id', downloadAnexoRequisicoesIntegra);
integra.get('/promotorias/:promotoria', getPromotoriasMPPB);

export default integra;
