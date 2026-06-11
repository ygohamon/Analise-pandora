import { Router } from 'express';

import { 
    GuardRotasPerfilPrivado,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import { 
    getBoletimOcorrenciaPorCPF    
} from '../controllers/boletimocorrencia/boletimocorrencia.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';

const servicoscodata: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Boletim de Ocorrência' da seção 'Pesquisa'
 */
servicoscodata.use(GuardRotasLogado, GuardRotasChecaHash);
servicoscodata.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.codata }));

/**
 * Realiza o cache das rotas abaixo
 */
servicoscodata.use(cache.connect());

servicoscodata.get('/consulta_boletim_ocorrencia/cpf/:cpf', getBoletimOcorrenciaPorCPF);
// servicoscodata.get('/consulta_dados_delegacia/departamento/:departamento', getDadosDelegacia);

export default servicoscodata;