import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, first, print, formataDado } from './../../utils';

const fonte = MODEL_PRIORITY['credlink.pf'].fonte;
const rank  = MODEL_PRIORITY['credlink.pf'].rank;
const grupo = MODEL_PRIORITY['credlink.pf'].grupo;
const modelConfig = getModelConfig('CREDLINK');
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
  // for (var i in dados){
  //   result.push(formataPessoaDetalhado(dados[i]));
  // }
  result.push(formataPessoaDetalhado(dados[0]));
  return result;
}

const jsonToArraySimple = (dado = {}) => {
  return formataPessoa(dado);
}

const convertToArray = (dado) =>{
  var arr = []
  if (!Array.isArray(dado))
    arr.push(dado);
  else
    arr = dado;
  return arr;
}

//Formatação do Prontuario a ser chamado no front.
const formataPessoa = function (dados) {
  let pessoa = [{
    cpf  : dados?.cpfcnpj,
    nome : dados?.nome,
  }];

  return pessoa;
}

const formataPessoaDetalhado = function(dados) {
  let pessoa = {
    nome                          : dados?.nome,
    cpf                           : dados?.cpfcnpj,
    dataNascimento                : new Date(dados?.nasc),
    obito                         : dados?.obito,
    nomeMae                       : dados?.mae,
    logradouro                    : dados?.endereco,
    bairro                        : dados?.bairro,
    municipio                     : dados?.municipio,
    cep                           : dados?.cep,
    numero                        : dados?.numero,
    uf                            : dados?.uf,
    iptu                          : dados?.iptu,
    emails                        : dados?.emails,
    procon                        : dados?.procon,
  };

  return pessoa;
}

const getPessoaDetalhada = function (_cpfCnpj: string) {

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
        .then(dados => jsonToArray(dados) )
        .then(dados => dados.map(j => Object.assign(j, {tipo: 'credilink', fonte: modelConfig.sigla})))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.CpfcnpjAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

const getPessoaSimplificada = function (_cpfCnpj: string) {

  const cpfCnpj = (_cpfCnpj.length === 11) ?
    formataDado(_cpfCnpj, '###.###.###-##') :
    formataDado(_cpfCnpj, '##.###.###/####-##');

  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    senha: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    cpfcnpj: cpfCnpj
  };

  const processa = (dados) => {
    if (dados.indexOf('Registro Nao Localizado') !== -1) return null;
    else {
      return parser(dados)
        .then(dados => dados?.RESULTADO)
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => jsonToArraySimple(dados) )
        .then(dados => dados.map(j => Object.assign(j, {tipo: 'credilink', fonte})))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.cpfNomeAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export const getPessoaDetalhadoCPF_CREDILINK = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getPessoaDetalhada(cpf);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export const getPessoaSimplificadaCPF_CREDILINK = function(cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getPessoaSimplificada(cpf);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
