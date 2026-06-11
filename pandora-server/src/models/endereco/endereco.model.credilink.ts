import { db, ISql } from '../../services/db.service';
import {resultFoundRaw, modelFactory as mf, getNomeFuncao, first, formataDado } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('CREDLINK');

const fonte_pf = MODEL_PRIORITY['credilink.pf.endereco'].fonte;
const rank_pf  = MODEL_PRIORITY['credilink.pf.endereco'].rank;
const grupo_pf = MODEL_PRIORITY['credilink.pf.endereco'].grupo;

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const soap = require('soap');
const xml2js = require('xml2js');

const parser = new xml2js
  .Parser({explicitArray: false, trim: true, normalize: true, emptyTag: null})
  .parseStringPromise;

const isObject = obj => Object.prototype.toString.call(obj) === "[object Object]"

const lowerCaseObjectKeys = obj => Object.fromEntries(Object.entries(obj).map(objectKeyMapper))

const objectKeyMapper = ([ key, val ]) => ([
  key.toLowerCase(),
  isObject(val)
    ? lowerCaseObjectKeys(val)
    : val
])

const jsonToArrayManage = (dados = {}) => {
  var result = []
  for (var i in dados){
    if (dados[i].cpfcnpj.length == 11){
      result.push(formataEnderecoDetalhado(dados[i]))
    }else{
      result.push(formataEnderecoDetalhadoPJ(dados[i]))
    }
  }
  return result
}

const jsonToArray = (dados = {}) => {
  var result = [];
  for (var i in dados){
    result.push(formataEnderecoDetalhado(dados[i]));
  }

  return result;
}

const convertToArray = (dado) =>{
  var arr = []
  if (!Array.isArray(dado)) {
    arr.push(dado);
  } else {
    arr = dado;
  }

  return arr;
}

const formataEnderecoDetalhado = function(dados) {
  if (dados?.endereco == 'NULL') {
    return null;
  }

  let enderecoPessoa = {
    nome                          : dados?.nome,
    cpf                           : dados?.cpfcnpj,
    logradouro                    : dados?.endereco,
    numero                        : dados?.numero.replace('NULL', ''),
    complemento                   : dados?.complemento.replace('NULL', ''),
    bairro                        : dados?.bairro,
    cep                           : dados?.cep.replace('NULL', ''),
    municipio                     : dados?.cidade,
    uf                            : dados?.uf,
    fonte                         : modelConfig.sigla
  };

  return enderecoPessoa;
}

const jsonToArrayPJ = (dados = {}) => {
  var result = [];
  for (var i in dados){
    result.push(formataEnderecoDetalhadoPJ(dados[i]));
  }
  return result;
}

const formataEnderecoDetalhadoPJ = function(dados) {
  if (dados?.endereco == 'NULL') {
    return null;
  }

  let enderecoEmpresa = {
    nome        : dados?.nome,
    cnpj        : dados?.cpfcnpj,
    logradouro  : dados?.endereco,
    numero      : dados?.numero,
    complemento : dados?.complemento.replace('NULL', ''),
    bairro      : dados?.bairro,
    cep         : dados?.cep.replace('NULL', ''),
    municipio   : dados?.cidade,
    uf          : dados?.uf,
    fonte       : modelConfig.sigla
  };

  return enderecoEmpresa;
}

const getEndereco = function (_cpfCnpj: string, tipo: string, fonte: string) {

  const cpfCnpj = (_cpfCnpj.length === 11) ?
    formataDado(_cpfCnpj, '###.###.###-##') :
    formataDado(_cpfCnpj, '##.###.###/####-##');

  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    password: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    cpfcnpj: cpfCnpj
  };

  const processa = (dados) => {

    if (dados.indexOf('Registro não localizado') !== -1) {
      return null;
    }

    return parser(dados)
      .then(dados => dados?.RESULTADO?.REGISTRO)
      .then(dados => convertToArray(dados))
      .then(dados => lowerCaseObjectKeys(dados))
      .then(dados => _cpfCnpj.length === 11 ? jsonToArray(dados) : jsonToArrayPJ(dados) )
      .then(dados => dados.map(j => Object.assign(j, {tipo: tipo, fonte})));
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.CpfcnpjAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export let getEnderecoCPF_CREDILINK_PF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEndereco(cpf, "PF", modelConfig.sigla);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno });
};

const fonte_pj   = MODEL_PRIORITY['credilink.pj.endereco'].fonte;
const rank_pj    = MODEL_PRIORITY['credilink.pj.endereco'].rank;
const grupo_pj   = MODEL_PRIORITY['credilink.pj.endereco'].grupo;

export let getEnderecoCNPJ_CREDILINK = function (cnpj: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEndereco(cnpj, "PJ", modelConfig.sigla);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnChecaTemResultado, fnRetorno });
};

const getEnderecoPorEndereco = function (logradouro: string, numero: string = null, municipio: string = null, uf: string = null) {

  const wsdl = modelConfig.get('WSDL');
  const params = {
    usuario: modelConfig.get('usuario'),
    password: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    logradouro: logradouro,
    numeroinicial:  numero,
    numerofinal:  numero,
    cidade: municipio,
    uf: uf,
    complemento:'',
    bairro:'',
    nome:''
  };

  const processa = (dados) => {
    if (dados.indexOf('CL-099:null') !== -1) {
      return [];
    } else {
      return parser(dados)
        .then(dados => dados?.RESULTADO?.REGISTRO)
        .then(dados => convertToArray(dados))
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => jsonToArrayManage(dados))
        .then(dados => dados.map(j => j.cpf ? Object.assign(j, { tipo: 'PF', fonte_pf }) : Object.assign(j, { tipo: 'PJ', fonte_pj })))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.EnderecoAsync(params))
      .then(dados => first(dados).return)
      .then(dados => processa(dados))
  }
}

export let getEnderecoPorEndereco_CREDILINK = function(logradouro: string, numero: string = null, municipio: string = null, uf: string = null){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEnderecoPorEndereco(logradouro, numero, municipio, uf);

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno });
}
