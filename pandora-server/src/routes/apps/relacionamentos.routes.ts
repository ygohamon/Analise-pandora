import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../../services/auth/authguard.service';

import {
    getRelacionamentosPessoaLista,
    getRelacionamentosPessoaCPF,
    getRelacionamentosTelefoneTelefone,
    getRelacionamentosEmpresaCNPJ,
    getRelacionamentosOrgaoCdugestora,
    getRelacionamentosEndereco,
} from '../../controllers/relacionamentos/relacionamentos.controller';

import { mapeamentoItensAcesso as mpi } from '../../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../../services/auth/controle.acesso';

import { cache } from '../../services/apicache.service';

const relacionamentos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão 
 * para requisitar o item 'Relacionamentos' da seção 'Apps'
 */
relacionamentos.use(GuardRotasLogado, GuardRotasChecaHash);
relacionamentos.use(ControleAcessoGuard({ secao: mps.apps, item: mpi.apps.relacionamentos }));

/**
 * Realiza o cache das rotas abaixo
 */
relacionamentos.use(cache.connect());

relacionamentos.get('/lista/:lista', getRelacionamentosPessoaLista);

relacionamentos.get('/pessoa/', getRelacionamentosPessoaCPF);
relacionamentos.get('/telefone/', getRelacionamentosTelefoneTelefone);
relacionamentos.get('/empresa/', getRelacionamentosEmpresaCNPJ);
relacionamentos.get('/orgao/', getRelacionamentosOrgaoCdugestora);
relacionamentos.get('/endereco/', getRelacionamentosEndereco);

export default relacionamentos;
