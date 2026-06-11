import { resultFoundRaw, modelFactory as mf, getNomeFuncao, first, formataDado } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('CREDLINK');

const fonte_pf   = MODEL_PRIORITY['credilink.pf.email'].fonte;
const rank_pf    = MODEL_PRIORITY['credilink.pf.email'].rank;
const grupo_pf   = MODEL_PRIORITY['credilink.pf.email'].grupo;
const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const soap = require('soap');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({
    explicitArray: false,
    trim: true,
    normalize: true,
    emptyTag: null
  }).parseStringPromise;

const isObject = obj => Object.prototype.toString.call(obj) === "[object Object]"

const lowerCaseObjectKeys = obj => Object.fromEntries(Object.entries(obj).map(objectKeyMapper));

const objectKeyMapper = ([ key, val ]) => ([
  key.toLowerCase(),
  isObject(val) ? lowerCaseObjectKeys(val) : val
])

const jsonToArray = (dados = {}) => {
  var result = [];
  for (var i in dados){
    result.push(formataEmailDetalhado(dados[i]));
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

const formataEmailDetalhado = function(dados) {
  let pessoa = {
    nome  : dados?.nome,
    cpf   : dados?.cpfcnpj,
    email : dados?.emails?.toLowerCase(),
    tipo  : 'email',
    fonte : modelConfig.sigla
  };

  return pessoa;
}


const jsonToArrayPJ = (dados = {}) => {
  var result = [];

  for (var i in dados) {
    result.push(formataEmailDetalhadoPJ(dados[i]));
  }

  return result;
}

const formataEmailDetalhadoPJ = function(dados) {

  let emailEmpresa = {
    nome  : dados?.nome,
    cnpj  : dados?.cpfcnpj,
    email : dados?.emails?.toLowerCase(),
    tipo  : 'email',
    fonte : modelConfig.sigla
  };

  return emailEmpresa;
}

const cleanEmail = function(dados) {
  var dado = dados[0]
  var emails = []
  dados.forEach(element => {
    var e = element.email.split(',')
    if (e[0].toLowerCase() !== 'null') {
      emails.push(...e);
    }
  });

  emails = emails.filter((curr, i) => emails.indexOf(curr) === i)

  dados = []
  if (emails.length > 0) {
    emails.forEach(e => {
      dado.email = e;
      let d = {
        ...dado
      }
      dados.push(d);
    })
  }

  return dados
}

const getEmail = function (_cpfCnpj: string) {

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
    if (dados.indexOf('Registro nao localizado') !== -1) {
      return null;
    } else {
      return parser(dados)
        .then(dados => dados?.RESULTADO?.REGISTRO)
        .then(dados => convertToArray(dados))
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => _cpfCnpj.length === 11 ? jsonToArray(dados) : jsonToArrayPJ(dados) )
        .then(dados=> cleanEmail(dados))
        .then(dados => dados.map(j => Object.assign(j, { tipo: 'email', fonte: modelConfig.sigla })))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.CpfcnpjAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export let getEmailCPF_CREDILINK_PF = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEmail(cpf);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno });
};

const fonte_pj = MODEL_PRIORITY['credilink.pj.email'].fonte;
const rank_pj  = MODEL_PRIORITY['credilink.pj.email'].rank;
const grupo_pj = MODEL_PRIORITY['credilink.pj.email'].grupo;

export let getEmailCNPJ_CREDILINK = function (cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEmail(cnpj);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnChecaTemResultado, fnRetorno });
};

const getEmailPorEmail = function (_email: string) {

  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    password: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    email: _email
  };

  const processa = (dados) => {
    if (dados.indexOf('Registro não localizado') !== -1) return null;
    else {
      return parser(dados)
        .then(dados => dados?.RESULTADO?.REGISTRO)
        .then(dados => convertToArray(dados))
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => dados[0].cpfcnpj.length === 11 ? jsonToArray(dados) : jsonToArrayPJ(dados) )
        .then(dados=> { var arr = []; dados[0].email = _email; arr.push(dados[0]);  return arr; })
        .then(dados => dados.map(j => Object.assign(j, { tipo: 'email', fonte_pf })))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.EmailAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export let getEmailPorEmail_CREDILINK = function(email: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEmailPorEmail(email);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno });
}
