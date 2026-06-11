import { Router } from 'express';

import {
    GuardRotasChecaHash, GuardRotasLogado, ControleAcessoGuard
} from '../services/auth/authguard.service';

import {
    getVeiculoDetalhadoCNPJ,
    getVeiculoDetalhadoCPF,
    getVeiculoDetalhadoChassi,
    getVeiculoDetalhadoPlaca,
    getVeiculoDetalhadoRenavam,
    getVeiculoDetalhadoNome
} from '../controllers/veiculos/veiculos.controller';

import { mapeamentoItensAcesso as mpi } from '../services/auth/controle.acesso';
import { mapeamentoSecoesAcesso as mps } from '../services/auth/controle.acesso';

import { cache } from '../services/apicache.service';
import { getUserData } from '../services/auth/userdata.service';

const veiculos: Router = Router();

veiculos.use(GuardRotasLogado, GuardRotasChecaHash);
veiculos.use(ControleAcessoGuard({ secao: mps.pesquisa, item: mpi.pesquisa.veiculo }));
veiculos.use(getUserData);

/**
 * Realiza o cache das rotas abaixo
 */
veiculos.use(cache.connect());

veiculos.get('/detalhado/cnpj/:cnpj', getVeiculoDetalhadoCNPJ);
veiculos.get('/detalhado/cpf/:cpf', getVeiculoDetalhadoCPF);
veiculos.get('/detalhado/nome/:nome', getVeiculoDetalhadoNome);
veiculos.get('/detalhado/chassi/:chassi', getVeiculoDetalhadoChassi);
veiculos.get('/detalhado/placa/:placa', getVeiculoDetalhadoPlaca);
veiculos.get('/detalhado/renavam/:renavam', getVeiculoDetalhadoRenavam);

export default veiculos;
