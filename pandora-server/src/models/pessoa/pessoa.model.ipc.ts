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

const fonte  = MODEL_PRIORITY['ipc'].fonte;
const rank   = MODEL_PRIORITY['ipc'].rank;
const grupo  = MODEL_PRIORITY['ipc'].grupo;

export let getPessoaSimplificadoNome_IPC = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaSimplificado_IPC;

  return mf.call(null, query, nomeFuncao, ['Nome', nome], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaSimplificadoRG_IPC = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaSimplificado_IPC;

  return mf.call(null, query, nomeFuncao, ['RG', rg], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaSimplificadoNomePai_IPC = function (nomePai: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaSimplificado_IPC;

  return mf.call(null, query, nomeFuncao, ['NomePai', nomePai], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaSimplificadoNomeMae_IPC = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaSimplificado_IPC;

  return mf.call(null, query, nomeFuncao, ['NomeMae', nomeMae], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaSimplificadoCPF_IPC = function (cpf: string){
  const cpfFormatado = cpf.slice(0,3)+"."+cpf.slice(3,6)+"."+cpf.slice(6,9)+"-"+cpf.slice(9);

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaSimplificado_IPC;

  return mf.call(null, query, nomeFuncao, ['CPF', cpfFormatado], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaDetalhadoCPF_IPC = function (cpf: string){
  const cpfFormatado = cpf.slice(0,3)+"."+cpf.slice(3,6)+"."+cpf.slice(6,9)+"-"+cpf.slice(9);

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaDetalhado_IPC;

  return mf.call(null, query, nomeFuncao, ['CPF', cpfFormatado], modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaDetalhadoRG_IPC = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = Promise_getPessoaDetalhado_IPC;

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

    setTimeout(() => reject(criaRespostaAPI(API_CODES.CODE_RECURSO_NAO_ENCONTRADO, API_MSGS.MSG_IPC_TIMEOUT)), modelConfig.get('IPC_CREATE_CLIENT_TIMEOUT'))
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
              let { Nome, NomeMae, DataNascimento, CPF, RG, Cidade, Estado } = registro;
              return {
                nome: Nome ? Nome : null,
                nomeMae: NomeMae ? NomeMae : null,
                municipio: Cidade ? Cidade : null,
                uf: Estado ? Estado : null,
                cpf: CPF ? limpaNumero(CPF) : null,
                rg: RG ? limpaNumero(RG) : null,
                dataNascimento: DataNascimento ? DataNascimento : null,
                fonte: modelConfig?.sigla
              };
            });
          } else {
            dados = [];
          }

          resolve(dados);
        }
      }, { timeout: modelConfig.get('IPC_REQUEST_TIMEOUT') }
    );
  });
};

const Promise_clientPesquisarDetalhado = function (client, tipoPesquisa: string, valorPesquisa: string){
    return new Promise((resolve, reject) => {
        const params = {
            chaveAcesso: modelConfig.get('IPC_CHAVE_ACESSO'),
            tipoPesquisa: tipoPesquisa,
            valorPesquisa: valorPesquisa
        }

        client.Pesquisar(params, (err, result, raw, soapHeader) => {
            if (err) {
                reject(err);
                return
            } else {
                let dados;
                if (result && result.PesquisarResult) {
                    dados = result.PesquisarResult.Pessoa.map(registro => {
                        let { Nome, RG, DataExpedicao, NomeMae, NomePai, Naturalidade, UFNaturalidade, DataNascimento, CPF, Cidade, Estado } = registro;
                        return {
                            nome:           (Nome)      ? Nome : null,
                            rg:             (RG)        ? RG : null,
                            nomeMae:        (NomeMae)   ? NomeMae : null,
                            nomePai:        (NomePai    ? NomePai : null),
                            cpf:            (CPF)       ? limpaNumero(CPF) : null,
                            municipio:      (Cidade)    ? Cidade : null,
                            uf:             (Estado)    ? Estado : null,
                            dataExpedicao:  (DataExpedicao)     ? DataExpedicao : null,
                            naturalidade:   (Naturalidade)      ? Naturalidade : null,
                            ufNaturalidade: (UFNaturalidade)    ? UFNaturalidade : null,
                            dataNascimento: (DataNascimento)    ? DataNascimento : null,
                            fonte:          modelConfig?.sigla
                        };
                    });
                } else {
                    dados = [];
                }
                resolve(dados);
            }
        }, { timeout: modelConfig.get('IPC_REQUEST_TIMEOUT') })
    });
}

const Promise_getPessoaSimplificado_IPC = function(tipoPesquisa: string, valorPesquisa: string) {
  return Promise_createClientIPC()
    .then((client: any) => Promise_clientPesquisarSimplificado(client, tipoPesquisa, valorPesquisa))
};

const Promise_getPessoaDetalhado_IPC = function(tipoPesquisa: string, valorPesquisa: string) {
  return Promise_createClientIPC()
    .then((client: any) => Promise_clientPesquisarDetalhado(client, tipoPesquisa, valorPesquisa))
};
