import { Router } from 'express';

import {
    GuardRotasLogado,
    GuardRotasChecaHash,
    ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getPessoaDetalhadoCPF,
    getPessoaSimplificadoCPF,
    getPessoaSimplificadoNome,
    getPessoaSimplificadoCNH,
    getPessoaSimplificadoTitulo,
    getPessoaSimplificadoNomePai,
    getPessoaSimplificadoNomeMae,
    getPessoaSimplificadoRG,
    getPessoaIntegradoCPF,
    getPessoaSimplificadoTelefone,
    getVizinhosPessoaCPF,
    getPessoaSimplificadoEndereco,
    getPessoaSimplificadoEmail,
    getPessoaQualificacaoCPF,
    getPessoaIntegradoRG,
    getPessoaQualificacaoRG,
    getPessoaIntegradoNome
} from '../controllers/pessoas/pessoas.controller';

import { cache } from '../services/apicache.service';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';
import { GuardLimiteAcessoPorUsuario } from '../services/auth/limiters.service';
import { getUserData } from '../services/auth/userdata.service';

const pessoas: Router = Router();

/**
 * Protege a Rota para usuários que tenham um token válido e que tenham permissão
 * para requisitar o item 'Pessoa' da seção 'Pesquisa'
 */
pessoas.use(GuardRotasLogado, GuardRotasChecaHash);
pessoas.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.pessoa }));

/**
 *  Protege de ataques repetidos
 */
pessoas.use(GuardLimiteAcessoPorUsuario);

pessoas.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
pessoas.use(cache.connect());

pessoas.get('/detalhado/cpf/:cpf', getPessoaDetalhadoCPF);

pessoas.get('/simplificado/cpf/:cpf', getPessoaSimplificadoCPF);
pessoas.get('/simplificado/nome/:nome', getPessoaSimplificadoNome);
pessoas.get('/simplificado/cnh/:cnh', getPessoaSimplificadoCNH);
pessoas.get('/simplificado/rg/:rg', getPessoaSimplificadoRG);
pessoas.get('/simplificado/titulo/:titulo', getPessoaSimplificadoTitulo);
pessoas.get('/simplificado/nomepai/:nomepai', getPessoaSimplificadoNomePai);
pessoas.get('/simplificado/nomemae/:nomemae', getPessoaSimplificadoNomeMae);
pessoas.get('/simplificado/endereco/:endereco', getPessoaSimplificadoEndereco);
pessoas.get('/simplificado/email/:email', getPessoaSimplificadoEmail);
pessoas.get('/simplificado/telefone/:telefone', getPessoaSimplificadoTelefone);

pessoas.get('/integrado/cpf/:cpf', getPessoaIntegradoCPF);
pessoas.get('/integrado/rg/:rg', getPessoaIntegradoRG);
pessoas.get('/integrado/nome/:nome', getPessoaIntegradoNome);

pessoas.get('/qualificacao/cpf/:cpf', getPessoaQualificacaoCPF);
pessoas.get('/qualificacao/rg/:rg', getPessoaQualificacaoRG);

pessoas.get('/vizinho/cpf/:cpf', getVizinhosPessoaCPF);

export default pessoas;
