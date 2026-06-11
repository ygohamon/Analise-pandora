import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getProntuariosAlcunha,
    getProntuariosCPF,
    getProntuariosNome,
    getPronturarioRG
} from '../controllers/prontuarios/prontuarios.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getProntuarioAlcunha_LINCE } from '../models/prontuario';

const prontuarios: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Licitacoes' da seção 'Análise'
 */
prontuarios.use(GuardRotasLogado, GuardRotasChecaHash);
prontuarios.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.prontuario }));

/**
 * Realiza o cache das rotas abaixo
 */
prontuarios.use(cache.connect());

prontuarios.get('/cpf/:cpf', getProntuariosCPF);
prontuarios.get('/nome/:nome', getProntuariosNome);
prontuarios.get('/rg/:rg', getPronturarioRG);
prontuarios.get('/alcunha/:alcunha', getProntuariosAlcunha);


export default prontuarios;
