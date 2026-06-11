import { Router } from 'express';

import {
    GuardRotasChecaHash,
    GuardRotasOperacoes,
    ControleAcessoGuard,
    GuardRotasLogado
} from '../services/auth/authguard.service';

import {
    getEnderecoSimplificadoCNPJ,
    getEnderecoSimplificadoCPF,
    getEnderecoSimplificadoLogradouro,
    setEnderecoCPFSimplificado
} from '../controllers/enderecos/enderecos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const enderecos: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido
 */
enderecos.use(GuardRotasLogado, GuardRotasChecaHash);
enderecos.use(getUserData);

/**
 * Protege a Rota para usuários que tenham permissão para requisitar o item 'Endereço' da seção 'Pesquisa'
 */
enderecos.get('/simplificado/cpf/:cpf', ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.endereco }), cache.connect(), getEnderecoSimplificadoCPF);
enderecos.get('/simplificado/cnpj/:cnpj', ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.endereco }), cache.connect(), getEnderecoSimplificadoCNPJ);
enderecos.get('/simplificado/logradouro/:logradouro', ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.endereco }), cache.connect(), getEnderecoSimplificadoLogradouro);
//telefones.get('/simplificado/nome/:nome', getTelefoneSimplificadoNome);
//telefones.get('/simplificado/razaosocial/:razaosocial', getTelefoneSimplificadoRazaoSocial);

/**
 * Protege a Rota para usuários que tenham permissão para postar o item 'Cadastro Endereço' da seção 'Operações'
 */
enderecos.use(ControleAcessoGuard({ secao: mps.cadastro, item: mpi.cadastro.endereco }));
enderecos.post('/', setEnderecoCPFSimplificado);

export default enderecos;
