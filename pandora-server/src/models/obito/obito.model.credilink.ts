import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, first, print, formataDado } from './../../utils';

const fonte = MODEL_PRIORITY['credilink.obito'].fonte;
const rank  = MODEL_PRIORITY['credilink.obito'].rank;
const grupo = MODEL_PRIORITY['credilink.obito'].grupo;
const modelConfig = getModelConfig('CREDLINK');
const fnRetorno = resultFoundRaw;

const got = require('got');
const soap = require('soap');
const xml2js = require('xml2js');

const parser = new xml2js
  .Parser({explicitArray: false, trim: true, normalize: true, emptyTag: null})
  .parseStringPromise;

const isObject = obj => Object.prototype.toString.call(obj) === "[object Object]";

const lowerCaseObjectKeys = obj => Object.fromEntries(Object.entries(obj).map(objectKeyMapper));

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
    result.push(formataObito(dados[i]));
  }
  return result;
}

const formataObito = function (dado) {
  let obito = {
    obito_cpf                     : dado?.nu_cpf,
    obito_dataLavratura           : dado?.dt_lavrat,
    obito_dataNascimento          : dado?.dt_nasc,
    obito_dataObito               : dado?.dt_obito,
    obito_livro                   : dado?.livro,
    obito_folha                   : dado?.folha,
    obito_termo                   : dado?.termo,
    obito_nome                    : dado?.nomefalecido,
    obito_nomeMae                 : dado?.nm_mae_falecido,
    obito_nomePai                 : dado?.nm_pai_falecido,
    obito_cnpjServentia           : dado?.id_cartorio,
    obito_nomeFantasia            : dado?.nm_cartorio,
    obito_municipioServentia      : dado?.cidade,
    obito_endereco                : dado?.endereco_cartorio,
    obito_cep                     : dado?.nu_cep,
    obito_numeroTelefonePrincipal : dado?.telefone_cartorio,
    fonte                         : modelConfig?.sigla
  }

  return obito;
}

const convertToArray = (dado) =>{
  var arr = []
  if (!Array.isArray(dado))
    arr.push(dado);
  else
    arr = dado;
  return arr;
}

const getObito = function (_cpf: string) {
  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    password: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    cpf: formataDado(_cpf, '###.###.###-##') };

  const processa = (dados) => {
    return parser(dados)
      .then(dados => dados?.RESULTADO?.REGISTRO)
      .then(dados => dados ? convertToArray(dados) : null)
      .then(dados => dados ? lowerCaseObjectKeys(dados) : null)
      .then(dados => dados ? jsonToArray(dados) : null )
      .then(dados => dados ? dados.map(j => Object.assign(j, { tipo: 'credilink', fonte: modelConfig.sigla })) : null )

  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.ObitoAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export const getObitoCPF_CREDILINK = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getObito(cpf);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};
