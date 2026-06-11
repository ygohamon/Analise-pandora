import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getTelefoneSimplificadoCPF,
    getTelefoneSimplificadoNome,
    getTelefoneSimplificadoCNPJ,
    getTelefoneSimplificadoTelefone,
    getTelefoneSimplificadoRazaoSocial,
    setTelefoneCPFSimplificado,
    getTelefoneBuscaProfundaTelefone
} from '../controllers/telefones/telefones.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const telefones: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Telefone' da seção 'Pesquisa'
 */
telefones.use(GuardRotasLogado, GuardRotasChecaHash);
telefones.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.telefone }));
telefones.use(getUserData);

telefones.get('/simplificado/cpf/:cpf', cache.connect(), getTelefoneSimplificadoCPF);
telefones.get('/simplificado/nome/:nome', cache.connect(), getTelefoneSimplificadoNome);
telefones.get('/simplificado/cnpj/:cnpj', cache.connect(), getTelefoneSimplificadoCNPJ);
telefones.get('/simplificado/telefone/:telefone', cache.connect(), getTelefoneSimplificadoTelefone);
telefones.get('/simplificado/buscaprofunda/telefone/:telefone', cache.connect(), getTelefoneBuscaProfundaTelefone);
telefones.get('/simplificado/razaosocial/:razaosocial', cache.connect(), getTelefoneSimplificadoRazaoSocial);

/**
 * Protege a Rota para usuários que tenham permissão para postar o item 'Cadastro Telefone' da seção 'Operações'
 */
telefones.use(ControleAcessoGuard({ secao: mps.cadastro, item: mpi.cadastro.telefone }));
telefones.post('/', setTelefoneCPFSimplificado);

export default telefones;
