import * as  crypto from 'crypto';
import { Router } from 'express';

import * as pessoaModel from '../models/pessoa';
import * as enderecoModel from '../models/endereco';
import * as empresaModel from '../models/empresa';
import * as empenhoModel from '../models/empenho';
import * as veiculoModel from '../models/veiculo';
import * as servidorModel from '../models/servidor';
import * as mandadoModel from '../models/mandado';
import * as telefoneModel from '../models/telefone';
import * as presoModel from '../models/preso';
import * as relacionamentoModel from '../models/relacionamentos';
import * as fotoModel from '../models/foto';
import * as vizinhoModel from '../models/vizinho';
import * as empregadorModel from '../models/empregador';
import * as processoModel from '../models/processo';

import * as pessoaFunction from '../controllers/pessoas/pessoas.functions';

import {
    criaRespostaAPI,
    agrupaEFiltraDuplicados,
    filtraNaoEncontrados,
    print,
    msleep,
    getNomeFuncao,
    controllerError
} from '../utils';

import {
    API_CODES, API_CONFIG, API_MSGS,
} from '../config';

/**
 * Criada para fornecer rotas para medir o desempenho do sistema
 */
const benchmark: Router = Router();

benchmark.get('/simples', function (req, res, next) {
    if (API_CONFIG.CFG_ENV !== 'test') {res.status(200).send('')};

    var randSleep = Math.round(1000 + (Math.random() * 500));
    msleep(randSleep)
    // sleep.usleep(randSleep);

    var numChars = Math.round(5000 + (Math.random() * 5000));
    var randChars = crypto.randomBytes(numChars).toString('hex');
    res.send(randChars);
});

const cpfs = [
    '00000053120',  '00000301043',  '00000720445',  '00000731056',  '00001090291',
    '00001134256',  '00001549707',  '00001856391',  '00002127415',  '00002322625',
    '00002399172',  '00002517396',  '00002519330',  '00002607468',  '00002883147',
    '00002967162',  '00003251470',  '00003253414',  '00003254496',  '00003256430',
    '00003257401',  '00003259455',  '00003260461',  '00003261433',  '00003264459',
    '00003265420',  '00003266400',  '00003267474',  '00003268446',  '00003269418',
    '00003270424',  '00003272478',  '00003273440',  '00003274411',  '00003275493',
    '00003276465',  '00003277437',  '00003278409',  '00003279480',  '00003281469',
    '00003282430',  '00003284484',  '00003285456',  '00003286428',  '00003287408',
    '00003288471',  '00003289443',  '00003290450',  '00003291421',  '00003292401',
    '00003293475',  '00003294447',  '00003295419',  '00003296490',  '00003297462',
    '00003299406',  '00003300439',  '00003302482',  '00003303454',  '00003305406',
    '00003306470',  '00003307441',  '00003308413',  '00003309495',  '00003312445',
    '00003313417',  '00003315460',  '00003316432',  '00003317404',  '00003319458',
    '00003320464',  '00003321436',  '00003322408',  '00003323480',  '00003325423',
    '00003326403',  '00003327477',  '00003329410',  '00003330427',  '00003331407',
    '00003332470',  '00003333442',  '00003334414',  '00003335496',  '00003337430',
    '00003338401',  '00003339483',  '00003342433',  '00003346420',  '00003347400',
    '00003348474',  '00003349446',  '00003350452',  '00003351424',  '00003355411',
    '00003357465',  '00003358437',  '00003359409',  '00003361497',  '00003362469',
];

const promise_cpf = [
    pessoaModel.getPessoaDetalhadoCPF_ReceitaFull_PF,
    pessoaModel.getPessoaDetalhadoCPF_ReceitaNovo_PessoaFisica,
    pessoaModel.getPessoaDetalhadoCPF_Renach_2016_08,
    pessoaModel.getPessoaDetalhadoCPF_VEP,
    pessoaModel.getPessoaDetalhadoCPF_Sispesquisa_CNH,

    pessoaFunction.procuraPessoaDetalhadoCPF,
    pessoaFunction.procuraPessoaIntegradoCPF,
    pessoaFunction.procuraPessoaSimplificadoCPF,

    relacionamentoModel.getParentescosCPF,

    fotoModel.getFotoCPF_SISDEPEN,
    fotoModel.getFotoCPF_BDImagens,

    vizinhoModel.getVizinhosReceitaNovoCPF,

    enderecoModel.getEnderecoCPF_Sispesquisa_Enderecos,
    enderecoModel.getEnderecoCPF_ReceitaFull_PF,
    enderecoModel.getEnderecoCPF_ReceitaNovo_PessoaFisica,
    enderecoModel.getEnderecoCPF_Renach_2016_08,

    telefoneModel.getTelefoneCPF_ReceitaFull_PF,
    telefoneModel.getTelefoneCPF_Sispesquisa_Telefones,
    telefoneModel.getTelefoneCPF_VEP,

    empresaModel.getEmpresaSimplificadoSocioPFCPF_ReceitaNovo,
    empresaModel.getEmpresaSimplificadoCPFResponsavel_ReceitaNovo,

    veiculoModel.getVeiculoDetalhadoCPF_Renavam_2020,
    veiculoModel.getVeiculoDetalhadoCPF_Sispesquisa_VeiculosNovo,

    empenhoModel.getEmpenhoPagoAnualizadoSimplificadoCPF_BD_SAGRES_SE,
    empenhoModel.getEmpenhoPagoAnualizadoSimplificadoCPF_BD_SAGRES_SM,

    empregadorModel.getEmpregadoresDetalhadoCPF_RAIS,

    servidorModel.getServidorFederalCPF_Sispesquisa_Servidores_Federais,
    servidorModel.getServidorFederalCPF_Sispesquisa_Servidores_Federais_Nordeste,
    servidorModel.getServidorEstadualSimplificadoCPF_BD_Sagres,
    servidorModel.getServidorMunicipalSimplificadoCPF_BD_Sagres,

    presoModel.getPresoDetalhadoCPF_Sispesquisa_Prisional,

    processoModel.getPenaProcessoCPF_VEP,
    processoModel.getProcessoCPF_VEP,
]

const rgs = [
    '000000053120',  '000000301043',  '000000720445',  '000000731056',  '000001090291',
    '000001134256',  '000001549707',  '000001856391',  '000002127415',  '000002322625',
    '000002399172',  '000002517396',  '000002519330',  '000002607468',  '000002883147',
    '000002967162',  '000003251470',  '000003253414',  '000003254496',  '000003256430',
    '000003257401',  '000003259455',  '000003260461',  '000003261433',  '000003264459',
    '000003265420',  '000003266400',  '000003267474',  '000003268446',  '000003269418',
    '000003270424',  '000003272478',  '000003273440',  '000003274411',  '000003275493',
    '000003276465',  '000003277437',  '000003278409',  '000003279480',  '000003281469',
    '000003282430',  '000003284484',  '000003285456',  '000003286428',  '000003287408',
    '000003288471',  '000003289443',  '000003290450',  '000003291421',  '000003292401',
    '000003293475',  '000003294447',  '000003295419',  '000003296490',  '000003297462',
    '000003299406',  '000003300439',  '000003302482',  '000003303454',  '000003305406',
    '000003306470',  '000003307441',  '000003308413',  '000003309495',  '000003312445',
    '000003313417',  '000003315460',  '000003316432',  '000003317404',  '000003319458',
    '000003320464',  '000003321436',  '000003322408',  '000003323480',  '000003325423',
    '000003326403',  '000003327477',  '000003329410',  '000003330427',  '000003331407',
    '000003332470',  '000003333442',  '000003334414',  '000003335496',  '000003337430',
    '000003338401',  '000003339483',  '000003342433',  '000003346420',  '000003347400',
    '000003348474',  '000003349446',  '000003350452',  '000003351424',  '000003355411',
    '000003357465',  '000003358437',  '000003359409',  '000003361497',  '000003362469',
];

const promise_rg = [
    pessoaModel.getPessoaDetalhadoRG_VEP,

    pessoaFunction.procuraPessoaDetalhadoRG,
    pessoaFunction.procuraPessoaIntegradoRG,
    pessoaFunction.procuraPessoaSimplificadoRG,

    telefoneModel.getTelefoneRG_VEP,

    processoModel.getPenaProcessoRG_VEP,
    processoModel.getProcessoRG_VEP,
]

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}



benchmark.get('/random', function (req, res, next) {
    if (API_CONFIG.CFG_ENV !== 'test') {res.status(200).send('')};

    const cpf_index = getRandomInt(0, cpfs.length);
    const promise_index = getRandomInt(0, promise_cpf.length);

    Promise.all([promise_cpf[promise_index](cpfs[cpf_index])])
        // .then(resultados => filtraNaoEncontrados(resultados))
        // .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))

        .then(integrado => res.status(200).send(integrado))
        .catch(error => controllerError(res, error, 'benchmark/random'));
});

benchmark.get('/random', function (req, res, next) {
    if (API_CONFIG.CFG_ENV !== 'test') {res.status(200).send('')};

    const rg_index = getRandomInt(0, rgs.length);
    const promise_index = getRandomInt(0, promise_rg.length);

    Promise.all([promise_rg[promise_index](rgs[rg_index])])
        // .then(resultados => filtraNaoEncontrados(resultados))
        // .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))

        .then(integrado => res.status(200).send(integrado))
        .catch(error => controllerError(res, error, 'benchmark/random'));
});

export default benchmark;
