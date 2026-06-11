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
    getNomeFuncao
} from '../../utils';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_IPC');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['ipc.endereco'].fonte;
const rank  = MODEL_PRIORITY['ipc.endereco'].rank;
const grupo = MODEL_PRIORITY['ipc.endereco'].grupo;

export let getEnderecoCPF_IPC = function (cpf: string){
  const cpfFormatado = cpf.slice(0,3)+"."+cpf.slice(3,6)+"."+cpf.slice(6,9)+"-"+cpf.slice(9);

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getEndereco_IPC;

  return mf.call(null, query, nomeFuncao, ['CPF', cpfFormatado], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getEnderecoRG_IPC = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getEndereco_IPC;

  return mf.call(null, query, nomeFuncao, ['RG', rg], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
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

    // Se a consulta demorar mais que o modelConfig.get('IPC_CREATE_CLIENT_TIMEOUT') ele rejeita
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

    client.Pesquisar(params,(err, result, raw, soapHeader) => {
        if (err) {
          reject(err);
          return;
        } else {
          let dados;
          if (result && result.PesquisarResult) {
            dados = result.PesquisarResult.Pessoa.map(registro => {
              let { Nome, Logradouro, Numero, Bairro, Cidade, Estado, CEP, CPF, RG } = registro;
              return {
                rg: RG ? RG : null,
                cpf: CPF ? limpaNumero(CPF) : null,
                nome: Nome ? Nome.toUpperCase() : null,
                logradouro: Logradouro ? Logradouro.toUpperCase() : null,
                numero: Numero ? Numero : null,
                bairro: Bairro ? Bairro.toUpperCase() : null,
                municipio: Cidade ? Cidade.toUpperCase() : null,
                uf: Estado ? Estado.toUpperCase() : null,
                cep: CEP ? CEP : null,
                fonte: modelConfig?.sigla,
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

const Promise_getEndereco_IPC = function(tipoPesquisa: string, valorPesquisa: string) {
  return Promise_createClientIPC()
    .then((client: any) => Promise_clientPesquisarSimplificado(client, tipoPesquisa, valorPesquisa))
    .catch(error => {
      throw error;
    });
};
