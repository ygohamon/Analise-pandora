import {resultFoundRaw, modelFactory as mf, getNomeFuncao, first, formataDado } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('CREDLINK');

const fonte_pf   = MODEL_PRIORITY['credilink.pf.vizinho'].fonte;
const rank_pf    = MODEL_PRIORITY['credilink.pf.vizinho'].rank;
const grupo_pf   = MODEL_PRIORITY['credilink.pf.vizinho'].grupo;

const fonte_pj   = MODEL_PRIORITY['credilink.pj.vizinho'].fonte;
const rank_pj    = MODEL_PRIORITY['credilink.pj.vizinho'].rank;
const grupo_pj   = MODEL_PRIORITY['credilink.pj.vizinho'].grupo;
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

const jsonToArrayManage = (dados = {}) => {
  var result = []
  for (var i in dados){
    if (dados[i].cpfcnpj.length == 11){
      result.push(formataEnderecoDetalhado(dados[i]))
    }else{
      result.push(formataEnderecoDetalhadoPJ(dados[i]))
    }
  }

  result = result.sort(function (a, b) {
    if (a.nome > b.nome) {
      return 1;
    }
    if (a.nome < b.nome) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  return result;
}

const removeVizinhosDuplicados = (result = []) => {
  var aux = []

  for (var i in result){
    for (var i2 in aux){
      if (result[i]['cpf'])
        if (result[i]['cpf'] === aux[i2]['cpf'] && result[i]['numero'] === aux[i2]['numero'] && result[i]['cep'] === aux[i2]['cep']){
          aux.pop();
        }
      else
        if (result[i]['cnpj'] === aux[i2]['cnpj'] && result[i]['numero'] === aux[i2]['numero'] && result[i]['cep'] === aux[i2]['cep']){
          aux.pop();
        }
    }
    aux.push(result[i]);
  }

  return aux
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
  if (!Array.isArray(dado))
    arr.push(dado);
  else
    arr = dado;
  return arr;
}

const formataEnderecoDetalhado = function(dados) {
  let pessoa = {
    nome                          : dados?.nome,
    cpf                           : dados?.cpfcnpj,
    logradouro                    : dados?.endereco,
    numero                        : dados?.numero,
    complemento                   : dados?.complemento,
    bairro                        : dados?.bairro,
    cep                           : dados?.cep,
    municipio                     : dados?.cidade,
    uf                            : dados?.uf,
    fonte                         : modelConfig.sigla
  };

  return pessoa;
}

const jsonToArrayPJ = (dados = {}) => {
  var result = [];
  for (var i in dados){
    result.push(formataEnderecoDetalhadoPJ(dados[i]));
  }
  return result;
}

const formataEnderecoDetalhadoPJ = function(dados) {
  let pessoa = {
    nome                          : dados?.nome,
    cnpj                          : dados?.cpfcnpj,
    logradouro                    : dados?.endereco,
    numero                        : dados?.numero,
    complemento                   : dados?.complemento,
    bairro                        : dados?.bairro,
    cep                           : dados?.cep,
    municipio                     : dados?.cidade,
    uf                            : dados?.uf,
    fonte                         : modelConfig.sigla
  };

  return pessoa;
}

const getEndereco = function (_cpfCnpj: string) {
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
        .then(dados => _cpfCnpj.length === 11 ? jsonToArray(dados) : jsonToArrayPJ(dados))
    }
  }
  return soap.createClientAsync(wsdl)
    .then(client => client.CpfcnpjAsync(params))
    .then(dados => processa(first(dados).return))
}

export let getVizinhoCPF_CREDILINK_PF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const promisse = getEndereco(cpf)
  .then(dados =>  dados)
  .then(dados => dados.map(getVizinhos))
  .then(ends => Promise.all(ends))
  .then(ends => { var arr = []; ends.forEach(end => arr.push(...end)); return arr;  } )
  .then(removeVizinhosDuplicados)

  var query = () => {
    return promisse;
  }
  var arr = []
  arr.push(mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnChecaTemResultado, fnRetorno }))
  return arr
};

export let getVizinhoCNPJ_CREDILINK_PJ = function (cnpj: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEndereco(cnpj);
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnChecaTemResultado, fnRetorno });
};

//tipopesq
// 1 - vizinhos do mesmo endereço ( ideal para predios ou localizar moradores no mesmo endereço )
// 2 - vizinhos da esquerda
// 3 - vizinhos da direita
const getVizinhos = function (endereco) {
  const _numero = parseInt(endereco.numero, 10);
  const _offset = 10;

  const _numeroInicial = _numero ? _numero - _offset : ''
  const _numeroFinal = _numero ? _numero + _offset : ''

  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    password: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    logradouro: endereco.logradouro,
    numeroinicial:  _numeroInicial,
    numerofinal:  _numeroFinal,
    cidade: endereco.municipio,
    uf: endereco.uf,
    complemento:'',
    bairro:endereco.bairro,
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
        .then(dados => dados.map(j => j.cpf ? Object.assign(j, {tipo: 'PF', fonte_pf}) : Object.assign(j, {tipo: 'PJ', fonte_pj})))
    }
  }

  return soap.createClientAsync(wsdl)
    .then(client => client.EnderecoAsync(params))
    .then(dados => first(dados).return)
    .then(dados => processa(dados))
}
