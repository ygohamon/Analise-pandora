import { Router } from 'express';

import {
    GuardRotasPerfilPrivado,
    GuardRotasChecaHash,
    GuardRotasLogado,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getEmpresaDetalhadoCNPJ,
    getEmpresaSimplificadoCNPJ,
    getEmpresaSimplificadoRazaoSocial,
    getEmpresaSimplificadoNomeFantasia,
    getEmpresaSimplificadoSocioPFCPF,
    getEmpresaSimplificadoSocioPFNome,
    getEmpresaSimplificadoSocioPJCNPJ,
    //getEmpresaSimplificadoSocioPJRazaoSocial,
    getEmpresaIntegradoCNPJ,
    getEmpresaSimplificadoLogradouro,
    getEmpresaSimplificadoEmail,
    getEmpresaSimplificadoTelefone,
} from '../controllers/empresas/empresas.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const empresas: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Pessoa' da seção 'Pesquisa'
 */
empresas.use(GuardRotasLogado, GuardRotasChecaHash);
empresas.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.empresa }));
empresas.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
empresas.use(cache.connect());

empresas.get('/detalhado/cnpj/:cnpj', getEmpresaDetalhadoCNPJ);

empresas.get('/simplificado/cnpj/:cnpj', getEmpresaSimplificadoCNPJ);
empresas.get('/simplificado/razaosocial/:razaosocial', getEmpresaSimplificadoRazaoSocial);
empresas.get('/simplificado/nomefantasia/:nomefantasia', getEmpresaSimplificadoNomeFantasia);
empresas.get('/simplificado/endereco/:endereco', getEmpresaSimplificadoLogradouro);
empresas.get('/simplificado/email/:email', getEmpresaSimplificadoEmail);
empresas.get('/simplificado/telefone/:telefone', getEmpresaSimplificadoTelefone);

empresas.get('/simplificado/sociopf_cpf/:cpf', getEmpresaSimplificadoSocioPFCPF);
empresas.get('/simplificado/sociopf_nome/:nome', getEmpresaSimplificadoSocioPFNome);

empresas.get('/simplificado/sociopj_cnpj/:cnpj', getEmpresaSimplificadoSocioPJCNPJ);
//empresas.get('/simplificado/sociopj_razaosocial/:razaosocial', getEmpresaSimplificadoSocioPJRazaoSocial);

empresas.get('/integrado/cnpj/:cnpj', getEmpresaIntegradoCNPJ);

export default empresas;
