import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    validaCPF,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    LOG_SECOES,
    LOG_TIPOS_BUSCA,
    API_MSGS
} from '../../config';

import { procuraBoletimOcorrenciaPorCPF } from './boletimocorrencia.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.BOLETIMOCORRENCIA.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.BOLETIMOCORRENCIA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

/**
 *
 * @param req
 * @param res
 */
export let getBoletimOcorrenciaPorCPF = function(req: Request, res: Response) {
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraBoletimOcorrenciaPorCPF, cpf)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

// /**
//  *
//  * @param req
//  * @param res
//  */
// export let getDadosDelegacia = function (req: Request, res: Response) {
//     let departamento = req.params.departamento;

//     if (API_CONFIG.CFG_ENV == 'production') {
//         logModel.salvaLogPorId(new Log(
//             {
//                 ip: req.headers['x-real-ip'],
//                 usuario_id: getId_Token(req.headers['authorization']),
//                 tipo: LOG_CODES.TIPO_PESQUISA,
//                 mensagem: `${API_CONFIG.CFG_NOME_SISTEMA} - ${LOG_MSGS.BOLETIM_OCORRENCIA_DADOS_DELEGACIA}: departamento: ${departamento}`,
//                 user_agent: req.headers['user-agent']
//             })
//         );
//     }

//     Promise.all([boletimocorrenciaModel.getDadosDelegacia(departamento)])
//         .then(dadosDelegacia => res.status(200).send(dadosDelegacia))
//         .catch(error => res.status(500).send(criaRespostaAPI(API_CODES.CODE_ERRO_500, API_MSGS.MSG_ERRO_500)));
// }
