import { db, ISql } from '../../services/db.service';
import {resultFoundRaw, modelFactory as mf, getNomeFuncao, first, formataDado } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('CREDLINK');

const fonte_pf   = MODEL_PRIORITY['credilink.pf.telefone'].fonte;
const rank_pf    = MODEL_PRIORITY['credilink.pf.telefone'].rank;
const grupo_pf   = MODEL_PRIORITY['credilink.pf.telefone'].grupo;
const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const got = require('got');
const soap = require('soap');
const xml2js = require('xml2js');
const parser = new xml2js
  .Parser({explicitArray: false, trim: true, normalize: true, emptyTag: null})
  .parseStringPromise;

const isObject = obj =>
Object.prototype.toString.call(obj) === "[object Object]"

const lowerCaseObjectKeys = obj =>
Object.fromEntries(Object.entries(obj).map(objectKeyMapper))

const objectKeyMapper = ([ key, val ]) =>
([
  key.toLowerCase(),
  isObject(val)
    ? lowerCaseObjectKeys(val)
    : val
])

const jsonToArray = (dados = {}) => {
  var result = [];
  for (var i in dados){
    result.push(formataTelefoneDetalhado(dados[i]));
  }
  return result;
}

const convertToArray = (dado) =>{
  var arr = []
  if (!Array.isArray(dado))
    arr.push(dado);
  else
    arr = dado;
  return arr;
}

const formataTelefoneDetalhado = function(dados) {
  if (dados?.telefone === 'NULL') {
    return {};
  }

  let telefonePessoa = {
    nome                          : dados?.nome,
    cpf                           : dados?.cpfcnpj,
    operadora                     : dados?.operadora,
    ddd                           : dados?.telefone.substring(0,2),
    telefone                      : dados?.telefone.substring(2),
    whatsapp                      : dados?.whatsapp,
    fonte                         : modelConfig.sigla
  };

  return telefonePessoa;
}

const jsonToArrayPJ = (dados = {}) => {
  var result = [];
  for (var i in dados){
    result.push(formataTelefoneDetalhadoPJ(dados[i]));
  }
  return result;
}

const formataTelefoneDetalhadoPJ = function(dados) {

  if (dados?.telefone === 'NULL') {
    return {};
  }

  let telefoneEmpresa = {
    nome      : dados?.nome,
    cnpj      : dados?.cpfcnpj,
    operadora : dados?.operadora !== 'NULL' ? dados?.operadora : '',
    ddd       : dados?.telefone.substring(0, 2),
    telefone  : dados?.telefone.substring(2),
    whatsapp  : dados?.whatsapp !== 'NULL' ? dados?.whatsapp : '',
    fonte     : modelConfig.sigla
  };

  return telefoneEmpresa;
}

const getTelefone = function (_cpfCnpj: string) {

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
    if (dados.indexOf('Registro Nao Localizado') !== -1) return null;
    else {
      return parser(dados)
        .then(dados => dados?.RESULTADO?.REGISTRO)
        .then(dados => convertToArray(dados))
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => _cpfCnpj.length === 11 ? jsonToArray(dados) : jsonToArrayPJ(dados) )
        .then(dados => dados.map(j => Object.assign(j, {tipo: 'credilink', fonte_pf})))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.CpfcnpjAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export let getTelefoneCPF_CREDILINK_PF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getTelefone(cpf);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno });
};

const fonte_pj   = MODEL_PRIORITY['credilink.pj.telefone'].fonte;
const rank_pj    = MODEL_PRIORITY['credilink.pj.telefone'].rank;
const grupo_pj   = MODEL_PRIORITY['credilink.pj.telefone'].grupo;

export let getTelefoneCNPJ_CREDILINK = function (cnpj: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getTelefone(cnpj);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnChecaTemResultado, fnRetorno });
};

const getTelefonePorTelefone = function (_telefone: string) {

  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    password: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    telefone: _telefone };

  const processa = (dados) => {
    if (dados.indexOf('Registro Nao Localizado') !== -1) return null;
    else {
      return parser(dados)
        .then(dados => dados?.RESULTADO?.REGISTRO)
        .then(dados => convertToArray(dados))
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => dados[0].cpfcnpj.length === 11 ? jsonToArray(dados) : jsonToArrayPJ(dados) )
        .then(dados => dados.map(j => Object.assign(j, {tipo: 'credilink', fonte_pf})))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.TelefoneAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export let getTelefonePorTelefone_CREDILINK = function(telefone: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getTelefonePorTelefone(telefone);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno });
}
