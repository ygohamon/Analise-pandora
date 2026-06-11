import * as soap from 'soap';

import { createHash } from 'crypto';
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CODES, API_MSGS } from './../../config';

import {
    resultFoundRaw,
    logErroBuscaBD,
    criaRespostaAPI,
    getNomeFuncao,
    modelFactory as mf
} from '../../utils';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_IPC');
const modelImagens = getModelConfig('BD_IMAGENS');

const fonte  = MODEL_PRIORITY['ipc.foto'].fonte;
const rank   = MODEL_PRIORITY['ipc.foto'].rank;
const grupo  = MODEL_PRIORITY['ipc.foto'].grupo;

export const getFotoCPF_IPC = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);

  const fnRetorno = resultFoundRaw;
  const fnChecaTemResultado = (r) => r.length !== 0;
  const fnProcessaDadosEncontrados = (fotos) => {
    salvaFotosBD(cpf, fotos);
    return fotos;
  }

  const cpfFormatado = cpf.slice(0,3)+"."+cpf.slice(3,6)+"."+cpf.slice(6,9)+"-"+cpf.slice(9);
  const query = () => Promise_getFotos_IPC('CPF', cpfFormatado);

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno, fnProcessaDadosEncontrados });
}

const checaFotoExiste = function (hash: string) {

  return db.query([
    ['hash', ISql.VarChar, hash],
    ],`
      SELECT TOP 1 1
      FROM ${modelImagens.get('IMAGENS')} I
      WHERE I.HASH = @hash
    `)
    .then(result => { return (!result.length) ? false : true })
    .catch(error => { return false });
}

const insertFotosBD = function (cpf: string, hash: string, de_hash: string, de_img: string, img: string) {

  return db.query([
    ['cpf', ISql.VarChar, cpf],
    ['hash', ISql.VarChar, hash],
    ['de_hash', ISql.VarChar, de_hash],
    ['de_img', ISql.VarChar, de_img],
    ['img', ISql.VarChar, img],
    ['fonte', ISql.VarChar, modelConfig.sigla],
    ],`INSERT
          INTO ${modelImagens.get('IMAGENS')} (cpf, hash, tp_hash, tp_img, img_base64, fonte)

      SELECT @cpf, @hash, TPH.tp_hash, TPI.tp_img, @img, @fonte
      FROM ${modelImagens.get('TP_IMAGEM')} TPI
      OUTER APPLY (
          SELECT tp_hash
          FROM ${modelImagens.get('TP_HASH')}
          WHERE DE_HASH = @de_hash
      ) TPH
      WHERE DE_IMG = @de_img
    `)
    .then(result => {
        return {
            status: API_CODES.CODE_SUCESSO,
            msg: 'Foto cadastrada com sucesso.'
        }
    })
    .catch(error => { return logErroBuscaBD(error, `Falha na insercao da foto de ${cpf}.`, 'insertFotosBD'); });
}

const salvaFotosBD = function (cpf: string, fotos) {

  return Promise.all(fotos.map(foto => {
    const hash    = createHash('sha256').update(Buffer.from(foto.img, 'base64')).digest('hex');
    const de_hash = 'SHA256';
    const de_img = foto.tipo;
    const img = foto.img;

    return checaFotoExiste(hash).then(existe => {
        if (!existe) {
          return insertFotosBD(cpf, hash, de_hash, de_img, img).then(() => true);
        }
        return false;
    });
  }))
  .then(() => true);
}


const Promise_createClientIPC = function () {
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
}

const Promise_getFotos_IPC = function (tipoPesquisa: string, valorPesquisa: string){
  return Promise_createClientIPC()
    .then(client => Promise_clientPesquisarFotos(client, tipoPesquisa, valorPesquisa))
    .catch(error => {throw error;})
}

const Promise_clientPesquisarFotos = function(client, tipoPesquisa, valorPesquisa) {
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
          if (result && result.PesquisarResult) {
            const codigo = result.PesquisarResult.Pessoa[0].Codigo;
            const promiseFotos = Promise.all([
              Promise_getFotoFace_IPC(codigo, valorPesquisa),
              Promise_getFotoAssinatura_IPC(codigo, valorPesquisa),
            ])
            .then(fotos => {
              let result = [];

              if (fotos[0]) {
                const foto = {
                  img: fotos[0],
                  tipo: 'face',
                  fonte: modelConfig.sigla,
                };
                result = result.concat(foto);
              }
              if (fotos[1]) {
                const foto = {
                  img: fotos[1],
                  tipo: 'assinatura',
                  fonte: modelConfig.sigla,
                };
                result = result.concat(foto);
              }

              return result;
            });
            resolve(promiseFotos);
          } else {
            resolve([]);
          }
        }
      },
      { timeout: modelConfig.get('IPC_REQUEST_TIMEOUT') }
    );
  });
};

const Promise_getFotoAssinatura_IPC = function (codigo: string, valorPesquisa: string) {
  return Promise_createClientIPC()
    .then(client => Promise_obterImagem(client, codigo, 'Assinatura'))
    .catch(error => { logErroBuscaBD(error, `Falha na busca pela foto de ${valorPesquisa}.`, 'Promise_getFotoAssinatura_IPC'); return null; })
}

const Promise_getFotoFace_IPC = function (codigo: string, valorPesquisa: string){
  return Promise_createClientIPC()
    .then(client => Promise_obterImagem(client, codigo, 'Face'))
    .catch(error => { logErroBuscaBD(error, `Falha na busca pela foto de ${valorPesquisa}.`, 'Promise_getFotoFace_IPC'); return null;})
}

const Promise_obterImagem = function(client, codigo, tipo) {
  return new Promise((resolve, reject) => {
    const params = {
      chaveAcesso: modelConfig.get('IPC_CHAVE_ACESSO'),
      codigo: codigo,
      tipo: tipo,
    };

    client.ObterImagem(params, (err, result, raw, soapHeader) => {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(result.ObterImagemResult);
        }
      },{ timeout: modelConfig.get('IPC_REQUEST_TIMEOUT') }
    );
  });
};
