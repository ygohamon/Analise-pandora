import * as soap from 'soap';

import {
    MODEL_PRIORITY,
    API_CODES,
    API_MSGS
} from './../../config';

import {
    resultFoundRaw,
    criaRespostaAPI,
    limpaNumero,
    modelFactory as mf,
    getNomeFuncao,
    formataDado
} from '../../utils';

import { getModelConfig } from '../../config.models';
import { normalizaNumero } from '.';

const modelConfig = getModelConfig('WEBSERVICE_IPC');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['ipc.telefone'].fonte;
const rank   = MODEL_PRIORITY['ipc.telefone'].rank;
const grupo  = MODEL_PRIORITY['ipc.telefone'].grupo;

export let getTelefoneSimplificadoCPF_IPC = function (cpf: string){
  const cpfFormatado = formataDado(cpf, '###.###.###-##');
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getTelefone_IPC;

  const fnProcessaDadosEncontrados = function (result) {
    return result
      .reduce((acc, registro) => {
        acc.push(
          { telefone: registro.telefone, cpf: registro.cpf, fonte: registro.fonte },
          { telefone: registro.celular, cpf: registro.cpf, fonte: registro.fonte }
        );
        return acc;
      }, [])
      .filter(r => r.telefone !== null)
      .map(dado => {
        const processado = normalizaNumero('', dado.telefone);
        const {telefone, ...resto} = dado;
        if (typeof processado === 'object') {
          return Object.assign(resto, {telefone: processado.numero, ddd: processado.ddd})
        } else {
          return Object.assign(resto, {telefone: processado, ddd: ''})
        }
      })
  }

  return mf.call(null, query, nomeFuncao, ['CPF', cpfFormatado], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno, fnProcessaDadosEncontrados });
}

const Promise_createClientIPC = function() {
  return new Promise((resolve, reject) => {
    soap.createClient(modelConfig.get('IPC_WSDL_URL'), (error, client: any) => {
      if (error) {
        reject(error);
        return;
      } else {
        resolve(client);
      }
    });

    setTimeout(() => {
      reject(criaRespostaAPI(API_CODES.CODE_RECURSO_NAO_ENCONTRADO, API_MSGS.MSG_IPC_TIMEOUT));
    }, modelConfig.get('IPC_CREATE_CLIENT_TIMEOUT'));
  });
};

const Promise_clientPesquisarSimplificado = function(client, tipoPesquisa: string, valorPesquisa: string) {
  return new Promise((resolve, reject) => {
    const params = {
      chaveAcesso: modelConfig.get('IPC_CHAVE_ACESSO'),
      tipoPesquisa: tipoPesquisa,
      valorPesquisa: valorPesquisa,
    };

    client.Pesquisar(params, (err, result, raw, soapHeader) => {
        if (err) {
          reject(err);
          return;
        } else {
          let dados;
          if (result && result.PesquisarResult) {
            dados = result.PesquisarResult.Pessoa.map(registro => {
              let { TelefoneConvencional, TelefoneMovel, CPF } = registro;
              return {
                cpf: CPF ? limpaNumero(CPF) : null,
                telefone: TelefoneConvencional ? limpaNumero(TelefoneConvencional) : null,
                celular: TelefoneMovel ? limpaNumero(TelefoneMovel) : null,
                fonte: modelConfig.sigla,
              };
            });
          } else {
            dados = [];
          }
          resolve(dados);
        }
      },
      { timeout: modelConfig.get('IPC_REQUEST_TIMEOUT') }
    );
  });
};

const Promise_getTelefone_IPC = function(tipoPesquisa: string, valorPesquisa: string) {
  return Promise_createClientIPC()
    .then((client: any) => Promise_clientPesquisarSimplificado(client, tipoPesquisa, valorPesquisa))
    .catch(error => {
      throw error;
    });
};
