import * as _ from 'underscore';
import * as ss from 'string-similarity';
import * as rp from 'request-promise-native';
var fs = require('fs');
import { createHash } from 'crypto';
import moment = require('moment');

import * as logModel from './models/log';
import { NovoLog } from './schemas/log.schema';

import {
    API_CODES,
    API_MSGS,
    API_CONFIG,
    LOG_CODES,
    LOG_SECOES
} from './config';

import { BenchmarkService } from './services/benchmark.service';
import { cache } from './services/cache.service';
import { logger } from './services/log.service';
import * as jwt from './services/auth/jwt.service';
import { db } from './services/db.service';
import { ModelConfig } from './schemas/model.config.schema';

/**
 * Converte uma string em formato normal para o formato base64.
 *
 * @param str_base64
 */
export let btoa = function (str: string) {
    return Buffer.from(str, 'binary').toString('base64');
}

/**
 * Converte uma string em formato base64 para o formato normal.
 *
 * @param str_base64
 */
export let atob = function (str_base64: string) {
    return Buffer.from(str_base64, 'base64').toString('binary');
}

/**
 * Remove os espaços em branco antes e depois da string.
 *
 * @param str
 */
export let strip = function (str: string) {
  return (!str || typeof str !== 'string') ? null : str.trim();
}

/**
 * Converte a string para letras maiusculas.
 *
 * @param str
 */
export let upperCase = function (str: string) {
  return (!str || typeof str !== 'string') ? null : str.toUpperCase();
}

/**
 * Converte a string para letras minusculas.
 *
 * @param str
 */
export let lowerCase = function (str: string) {
  return (!str || typeof str !== 'string') ? null : str.toLowerCase();
}

/**
 * Converte uma string para float.
 *
 * @param str
 */
export let fromBrtoFloat = function (str: string) {
  if (typeof str === 'number') {return str;}

  return (!str || typeof str !== 'string') ? null : parseFloat(str.replace('.', '').replace(',', '.'));
}


// Remove as Stop Words do nome da pessoa e espaços em branco
export let trataRequisicaNome = function(nomeCompleto: string){
    // Filtra caracteres especiais do texto
    nomeCompleto = removerAcentos(nomeCompleto).replace(/[^\w\s]/gi, '');

    const stopWords = ["DA", "DAS", "DE", "DES", "DO", "DOS", "E", "OU"];
    return nomeCompleto.split(" ").filter(nome => stopWords.indexOf(nome.toUpperCase()) === -1 && nome !== "");
};

export let comparaString = function(a: string, b: string) : number{
  if (a === null || b === null) { return 0; }
  return ss.compareTwoStrings(a.toLowerCase(), b.toLowerCase());
}

export let somaArr = function(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export let first = function(arr) {
  if (!arr) return null;
  if (!arr.length) return null;

  return arr[0];
}

export let second = function(arr) {
  if (!arr) return null;
  if (!arr.length) return null;

  return arr[1];
}

export let last = function(arr) {
  if (!arr) return null;
  if (!arr.length) return null;

  return arr[arr.length - 1];
}

export const formataDado = function(dado: string, mask: string) {
  if (!dado) { return dado; }
  if (dado.length !== mask.replace(/[^#]/g, '').length) { return dado; }

  let i = 0,
  v = dado.toString();
  return mask.replace(/#/g, _ => v[i++]);
}

/**
 * Extrai a hora do sistema
 */
export const getTime = function(formato: string = null) {
  return (!formato) ? moment().format('YYYY-MM-DDTHH:mm:ss') : moment().format(formato);
}

/**
 * Realiza o parse de uma string contendo uma data segundo o formato definido
 *
 * @param data
 * @param format
 */
export const parseDate = function(data: string, format: string = 'DD/MM/YYYY') {
  if(!data) return data;

  return moment(data, format);
}


export let criaRespostaAPI = function(status: string, msg: string, dados: any = null){
  return { status, msg, dados};
}

/**
 * Transforma um array de nomes em uma única string utilizavel na
 * função de text search do BD.
 *
 * ['JOSE', 'ANTONIO', 'SILVA'] => 'JOSE AND ANTONIO AND SILVA'
 *
 * @param nomes
 */
export let toTextSearch = function(nomes: string[]){

  let nomeFormatado = "";
  for(let i = 0 ; i < nomes.length-1 ; i++){
    nomeFormatado += nomes[i] + " AND ";
  }
  nomeFormatado += nomes[nomes.length-1];

  return nomeFormatado;
}

export let toTextSearchLince = function(nomes: string[]){

  let nomeFormatado = "";
  for(let i = 0 ; i < nomes.length-1 ; i++){
    nomeFormatado += nomes[i] + " ";
  }
  nomeFormatado += nomes[nomes.length-1];

  return nomeFormatado;
}

export let trataResultado = function(resultado: Object){

  return Object.keys(resultado).reduce((obj, key) => {
    obj[key] = typeof resultado[key] === 'string' ? resultado[key].trim() : resultado[key];
    return obj;
  }, {});
};

/**
 * Retorno quando o model não encontra dados
 *
 * @param message
 * @param fonte
 */
export let resultNotFound = function(message: string, fonte: string){
  return {
    status: API_CODES.CODE_RECURSO_NAO_ENCONTRADO,
    resultado: {
      fonte: fonte,
      dados: []
    }
  };
}

/**
 * Retorno da consulta do model e processamento nos dados recidos
 *
 * @param dados
 * @param fonte
 * @param rank
 * @param grupo
 */
export let resultFound = function (dados: any[], fonte: string, rank: number =1, grupo: string ='') {
  return {
    status: API_CODES.CODE_RECURSO_ENCONTRADO,
    resultado: {
      fonte: fonte,
      rank:  rank,
      grupo: grupo,
      dados: dados.map(d => trataResultado(d))
    }
  };
}

/**
 * Retorno da consulta do model
 *
 * @param dados
 * @param fonte
 * @param rank
 * @param grupo
 */
export let resultFoundRaw = function (dados: any, fonte: string, rank: number =1, grupo: string ='') {
  return {
    status: API_CODES.CODE_RECURSO_ENCONTRADO,
    resultado: {
      fonte,
      rank,
      grupo,
      dados
    }
  };
}

export let logErroBuscaBD = function (error, menssagem:string = null, nomeFuncao:string = null, params = null){

  if (nomeFuncao){ logger.error(`Erro: ${nomeFuncao}`); }
  if (menssagem) { logger.error(menssagem); }
  if (error) { logger.error(`${error?.code} - ${error?.name} - ${error?.message}`); }
  if (params) { logger.error(`Params: ${JSON.stringify(params)}`); }
  if (API_CONFIG.CFG_ENV !== 'production') {
    logger.debug('STACK', {error});
  }

  return {
    status: API_CODES.CODE_ERRO_500,
    resultado: {
      fonte: nomeFuncao,
      dados: menssagem
    }
  }
}

/**
 * Remove os resultados que não tiverem status igual a API_CODES.CODE_RECURSO_ENCONTRADO
 *
 * @param arrayResultados - Resultado das buscas do Promise.all contido em cada controller.
 */
export let filtraNaoEncontrados = function (arrayResultados: any[]){
  // Filtra apenas os resultados encontrados
  const _resultados = arrayResultados.filter(r => r !== null).filter(r => r.status === API_CODES.CODE_RECURSO_ENCONTRADO);
  return (_resultados.length) ? _resultados : [{status: API_CODES.CODE_RECURSO_NAO_ENCONTRADO, resultado: {dados: []} }]
}

export let filtraNulos = function (lista: any []) {
  return lista.filter(l => l !== null);
}

const regraEmailDuplicado = (r) => r.email;
const regraVeiculoDuplicado = (r) => r.renavam + r.tipoDado + r.anoRegistro + r.periodo;
const regraPessoaDuplicada = (r) => r.cpf;
const regraEmpresaDuplicada = (r) => r.cnpj;
const regraTelefoneDuplicado = (r) => r.ddd + r.telefone;
const getEndereco = (r) => r.cpf + '-' +r.cnpj + ' ' + r.logradouro + ' ' + r.numero + ' ' + r.cep;

const filtraParecidos =  (lista, regraComparacao, paramSemelhanca=0.8) => {
  let listaUnicos = [];
  for (let i = 0; i < lista.length; i++){
    let atual = regraComparacao(lista[i]);

    // Se existe algo na lista
    if (listaUnicos.length){
        let achouIgual = false;
        for (let j = 0 ; j < listaUnicos.length && !achouIgual; j++){
          let comp = regraComparacao(listaUnicos[j]);
          let v = ss.compareTwoStrings(atual,  comp);

          if (v > paramSemelhanca)
            achouIgual = true;
        }

        if (!achouIgual)
          listaUnicos.push(lista[i]);
    } else
      listaUnicos.push(lista[i]);
  }

  return listaUnicos;
}

const agrupaDados = function (dados, regraDuplicidade) {
  const agrupamento = _.groupBy(dados, regraDuplicidade);

  // Quanto menor o valor de rank, maior a prioridade
  const dadosOrdenados = _.sortBy(dados, r => r.rank);

  return _.uniq(dadosOrdenados, regraDuplicidade)
    .map(d => ({
        ...d,
        relevancia: agrupamento[regraDuplicidade(d)].length,
        // Pega o menor ranking entre os dados (mais relevante)
        rank: _.min(agrupamento[regraDuplicidade(d)], d => d.rank).rank,
        fonte: _.uniq(agrupamento[regraDuplicidade(d)].map(d => d.fonte))
    }))
    .filter(i => i !== null);
}

export let agrupaEFiltraDuplicados = function (arrayResultados: any[], filtro = ['telefone', 'endereco', 'pessoa', 'empresa']){
  const dados = arrayResultados.filter(dado => dado.status === API_CODES.CODE_RECURSO_ENCONTRADO);

  if (!dados.length){
    return criaRespostaAPI(API_CODES.CODE_RECURSO_NAO_ENCONTRADO, API_MSGS.MSG_RECURSO_NAO_ENCONTRADO)
  }

  // Agrupa os resultados por tipo de grupo
  const gruposEncontrados = _.groupBy(arrayResultados, r => r.resultado.grupo);
  return {
    status: API_CODES.CODE_RECURSO_ENCONTRADO,
    dados: _.map(gruposEncontrados, (value, grupo) => {
      const dadosComRank = flat(value.map(resultadoModel => {
        const dadosModel = resultadoModel.resultado.dados;
        const rankModel = resultadoModel.resultado.rank;

        return dadosModel.map(d => ({...d, rank: rankModel}));
      }));

      let resultado = {};

      if (grupo === "pessoa" && filtro.includes('pessoa')) {
        resultado[grupo] = agrupaDados(dadosComRank, regraPessoaDuplicada);
      } else if (grupo === "empresa" && filtro.includes('empresa')) {
        resultado[grupo] = agrupaDados(dadosComRank, d => regraEmpresaDuplicada);
      } else if (grupo === "endereco" && filtro.includes('endereco')) {
        resultado[grupo] = filtraParecidos(dadosComRank, getEndereco, 0.95);
      } else if (grupo === "telefone" && filtro.includes('telefone')) {
        resultado[grupo] = agrupaDados(dadosComRank, regraTelefoneDuplicado);
      } else if (grupo === "veiculo" && filtro.includes('veiculo')) {
        resultado[grupo] = agrupaDados(dadosComRank, d => regraVeiculoDuplicado);
      } else if (grupo === "virtual" && filtro.includes('virtual')) {
        resultado[grupo] = agrupaDados(dadosComRank, d => regraEmailDuplicado);
      } else {
        resultado[grupo] = dadosComRank;
      }

      return resultado;
    })
  };
}

// {
//         "status": "OK",
//         "dados": [
//             {
//                 "nome_grupo": [
//                     {
//                         "key_0": "value_0",
//                         "key_1": "value_1"
//                     }
//                 ]
//             }
//         ]
// }

// { status: string, dados: Array<any>}
export let desagrupa = function (obj ) {
    if (obj?.dados?.length){
        obj.dados = obj.dados.reduce((acc, grupoAtual) => {
            let nomegrupo = _.keys(grupoAtual)[0];
            return (acc) ? acc.concat(grupoAtual[nomegrupo]) : grupoAtual[nomegrupo];
        }, []);
    }

    return obj;
}

export let limitaNumeroResultados = function (obj ) {
  if (obj && obj.dados.length){
      obj.dados = obj.dados.slice(0, API_CONFIG.SERVER_MAX_RESULTS);
  }

  return obj;
}

export let print =  function (data, header=null){
    if (header){
        logger.debug(header);
    }
    logger.debug(JSON.stringify(data, null, 4));

    return data;
}

// Transforma um array de arrays em array
export let flat = function (array){
    return [].concat.apply([], array);
}

export let removerAcentos = function (s){
  if (!s) return '';

  const mapa={"â":"a","Â":"A","à":"a","À":"A","á":"a","Á":"A","ã":"a","Ã":"A","Ç":"C","ç":"c","ê":"e","Ê":"E","è":"e","È":"E","é":"e","É":"E","î":"i","Î":"I","ì":"i","Ì":"I","í":"i","Í":"I","õ":"o","Õ":"O","ô":"o","Ô":"O","ò":"o","Ò":"O","ó":"o","Ó":"O","ü":"u","Ü":"U","û":"u","Û":"U","ú":"u","Ú":"U","ù":"u","Ù":"U"};
  return s.replace(/[\W\[\] ]/g,function(a){return mapa[a]||a})
};

export let removeNaoCaracter = function (s) {
  if (!s) return null;

  return s.replace(/[^\w\s]/g, '').trim();
}

let validaForcaSenha = function (senha) {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(senha);
}

export let validaTrocaSenha = function (dados) {
    if (dados.senhanova !== dados.senhanova2) {
        return criaRespostaAPI(API_CODES.CODE_PASSWORD_INVALIDO, 'Os valores da senha nova precisam ser iguais.');
    } else if (dados.senhaantiga === dados.senhanova) {
        return criaRespostaAPI(API_CODES.CODE_PASSWORD_INVALIDO, 'A senha nova não pode ser igual a senha atual.');
    } else if ( !validaForcaSenha(dados.senhanova) ) {
        return criaRespostaAPI(API_CODES.CODE_PASSWORD_INVALIDO, 'A senha nova deve conter ao menos 8 caracteres, os quais devem ser pelo menos: um caractere maiúsculo, um minúsculo, um número e um caractere especial.');
    } else {
        return criaRespostaAPI(API_CODES.CODE_SUCESSO, 'Senha válida');
    }
}

export let validaGoogleRecaptcha = function(recaptcha, isTest = false) {
  if (isTest) {
    return promisify(true);
  }

  return rp({
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    form: { secret: API_CONFIG.GOOGLE_RECAPTCHA_SECRET_KEY, response: recaptcha },
    timeout: 2000,
    json: true,
  }).then(resultado => {
    return resultado.success ? true : false;
  });
};

export let getId_Token = function(authHeader) {
    if (!authHeader) { return null; }

    let token = jwt.getTokenFromHeader(authHeader);
    if (!token) { return null; }

    const {status, payload, error} = <any>jwt.verify(token);

    if (status) {
        return payload.user.id;
    } else {
        return null;
    }
}

/**
 * Registra um recurso não encontrado.
 *
 * @param registros
 * @param item
 * @param chave
 * @param valor
 */
export let registraNaoEncontrados = function (registros, item, chave, valor) {
    if (registros[0].status === API_CODES.CODE_RECURSO_NAO_ENCONTRADO) {
        const code = API_CODES.CODE_RECURSO_NAO_ENCONTRADO;
        const log = new NovoLog({ip: 'internal', usuario: API_CONFIG.CFG_NOME_SISTEMA, secao: LOG_SECOES.PESQUISA.NOME, code, item, chave, valor})
        logRequisicao(log, true);
    }
    return registros;
}

/**
 * Gera uma lista de permutações do nome de uma pessoa.
 *
 * @param nomeCompleto
 */
export let geraListaNomes = function (nomeCompleto): Array<string> {
    var nomes = trataRequisicaNome(nomeCompleto).join(' ').split(" ");
    var lista = [];

    lista.push(nomeCompleto);

    var primeiroNome = nomes[0];
    nomes.slice(1).forEach(sobrenome => {
        lista.push(primeiroNome + ' ' + sobrenome);
    });

    return lista;
};

export let printTempoExecucao = function (tempoInicial: BenchmarkService, nomeFuncao){
    if (API_CONFIG.CFG_ENV !== 'production') {
        logger.verbose(`${nomeFuncao} - terminou em ${tempoInicial.elapsed()} ms`);
    }
}

export let thenTempoExecucao = function (data, tempoInicial: BenchmarkService, nomeFuncao){
    if (API_CONFIG.CFG_ENV !== 'production') {
      logger.verbose(`${nomeFuncao} - terminou em ${tempoInicial.elapsed()} ms`);
    }
    return data;
}

export let checaCPF = function (cpf: string) {
    if (!cpf) { return null; }

    cpf = limpaNumero(cpf)
    if (!validaCPF(cpf)) { return null; }

    return cpf;
}

export let validaCPF = function (cpf: string) {
    if (!cpf) { return false; }

    cpf = cpf.replace(/[^\d]+/g, '');
    // Elimina CPFs invalidos conhecidos
    if (cpf.length !== 11 ||
        cpf === '00000000000' ||
        cpf === '11111111111' ||
        cpf === '22222222222' ||
        cpf === '33333333333' ||
        cpf === '44444444444' ||
        cpf === '55555555555' ||
        cpf === '66666666666' ||
        cpf === '77777777777' ||
        cpf === '88888888888' ||
        cpf === '99999999999') { return false; }

    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i++) {
        add += parseInt(cpf.charAt(i), 10) * (10 - i);
    }
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) { rev = 0; }
    if (rev !== parseInt(cpf.charAt(9), 10)) { return false; }

    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++) {
        add += parseInt(cpf.charAt(i), 10) * (11 - i);
    }
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) { rev = 0; }
    if (rev !== parseInt(cpf.charAt(10), 10)) { return false; }

    return true;
}

export let checaCNPJ = function (cnpj: string) {
    if (!cnpj) { return null; }

    cnpj = limpaNumero(cnpj);
    if (!validaCNPJ(cnpj)) { return null; }

    return cnpj;
}

export let validaCNPJ = function (cnpj) {
    if (!cnpj) { return false; }
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) { return false; }

    // Elimina CNPJs invalidos conhecidos
    if (cnpj === '00000000000000' ||
        cnpj === '11111111111111' ||
        cnpj === '22222222222222' ||
        cnpj === '33333333333333' ||
        cnpj === '44444444444444' ||
        cnpj === '55555555555555' ||
        cnpj === '66666666666666' ||
        cnpj === '77777777777777' ||
        cnpj === '88888888888888' ||
        cnpj === '99999999999999') { return false; }

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) { pos = 9; }
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0), 10)) { return false; }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) { pos = 9; }
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1), 10)) { return false; }

    return true;
}

export const validaUF = function (uf: string) {
  if (!uf || typeof uf !== 'string') { return null;}

  const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  return ufs.includes(uf.toUpperCase());
}

/**
 * Recebe o logradouro, filtra palavras como 'av', 'rua', etc e converte
 * para uma lista de palavras.
 * @param logradouro
 */
export let filtraLogradouro = function (logradouro: string) {
    if (!logradouro) { return []; }

    // Filtra caracteres especiais do texto
    logradouro = removerAcentos(logradouro).replace(/[^\w\s]/gi, '');

    const stopWords = ["AV", "AV.", "AVENIDA", "R", "R.", "RUA", "DA", "DAS", "DE", "DES", "DO", "DOS", "E"];
    const lista = logradouro.toUpperCase().split(' ');

    return lista.filter(l => stopWords.indexOf(l) === -1 && l !== "");
}

export let agrupaControleAcessos = function (lista) {
    let grupos = _.groupBy(lista, l => l.ID_SECAO);
    const attr = Object.keys(grupos)[0];

    const r = {};
    r[attr] = grupos[attr].map(r => r.ID_ITEM);

    return r;
}

/**
 *  Aguarda n milisegundos
 *
 * @param n
 */
export let msleep = function (n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
/**
 *  Aguarda n segundos
 *
 * @param n
 */
export let sleep = function (n) {
    msleep(n*1000);
}

const posProcessamentoModel = async function (dado: any[], extra) {
  let { fonte, rank, grupo, fnRetorno, fnProcessaDadosEncontrados, print } = extra;

  if(!!print) {
    logger.debug(`Print ModelFactory`);
    logger.debug(JSON.stringify(dado, null, 2));
  }

  // Model desabilitado
  if (dado === null) {
    return null;
  } else if (!!dado.length) {

    // Aplica uma função para processamento dos dados se disponivel
    const _dados = (!fnProcessaDadosEncontrados) ? dado : fnProcessaDadosEncontrados(dado);

    // Se a função de processamento está disponível ele avalia se o conjunto de dados resultante
    // ainda contem dados, se não houver mais dados retorna como NOTFOUND
    if (!!fnProcessaDadosEncontrados && !_dados.length) {
      return resultNotFound(null, fonte);
    }

    // Se não tiver definida uma função diferente para montar o resultado
    // assume que é a função padrão resultFound
    return (!fnRetorno) ? resultFound(_dados, fonte, rank, grupo) : fnRetorno(_dados, fonte, rank, grupo);
  } else {
    return resultNotFound(null, fonte);
  }
}

/**
 * Função que cria um model genérico que checa se o model está habilitado ou não e
 * consulta se o dado requisitado já existe na cache.
 *
 * Se houver, retorna o dado encontrado.
 * Caso não haja, realiza a consulta e a insere na cache.
 *
 * @param fn - Função que chama a consulta que busca os dados.
 * @param nomeFuncao - Nome associada a consulta ( serve como chave para o cache )
 * @param args - Argumentos necessários a consulta 'fn'.
 * @param modelFlag - Flag que indica qual o parametro para habilitar o model
 * @param params - Flag que indica flags a serem passadas para o cache ou model
 * @param extra - Informações extras que padronizam o retorno do model - Pode conter diversos objetos
 *
 */
export let modelFactory = async function (fn: Function, nomeFuncao: string, args, modelConfig: ModelConfig, extra: { fonte: string, grupo: string, rank: number, print: boolean, fnRetorno: Function, fnProcessaDadosEncontrados: Function } = null){

  if(modelConfig?.ativado){
    const tempoInicial = new BenchmarkService();

    let dado = await cache.get(nomeFuncao, args, modelConfig?.params);
    if (!dado) {
      try {
        dado = await fn.apply(null, args);
        await cache.set(nomeFuncao, args, dado, modelConfig?.params);
      } catch (err) {
        logErroBuscaBD(err, `Falha com parâmetros ${Array.from(args)}.`, nomeFuncao)
        return promisify(null);
      }
    }

    printTempoExecucao(tempoInicial, nomeFuncao);
    return (extra) ? posProcessamentoModel(dado, extra) : dado;
  } else {
    return promisify(null);
  }
}

/**
 * Controller padrão
 *
 * @param log
 * @param fn
 * @param args
 */
export let controllerFactory = function (log, fn, ...args){

  let first;
  if (!log) {
    first = fn.apply(null, args)
  } else {
    first = logRequisicao(log)
      .then(() => fn.apply(null, args))
  }

  return first
    .then(dados => agrupaEFiltraDuplicados(dados))
    .then(dados => desagrupa(dados))
    // .then(dados => limitaNumeroResultados(dados))
}

/**
 * Faz o tratamento dos erros que ocorrem no controller
 *
 * @param res - Response do Framework express
 * @param error - Objeto de erro
 * @param nomeFuncao - Nome da função que deu erro
 */
export const controllerError = function(res, error, nomeFuncao) {
  logErroBuscaBD(error, null, nomeFuncao)
  return res.status(500).send(criaRespostaAPI(API_CODES.CODE_ERRO_500, API_MSGS.MSG_ERRO_500))
}

export const respostaSucesso = function(mensagem) {
  return criaRespostaAPI(API_CODES.CODE_SUCESSO, mensagem)
}

export let logRequisicao = function (log: NovoLog, salvaPorLogin=false, print=false, force=false) {
    if (API_CONFIG.CFG_ENV === 'production' || force) {
        if (salvaPorLogin) {
            return logModel.salvaLogPorLogin(log);
        } else {
            return logModel.salvaLogPorId(log);
        }
    } else {
        if (print) {
            logger.info(JSON.stringify(log, null, 2));
        }
    }

    return promisify(null);
}

/**
 * Remove tudo da string exceto os números.
 *
 * @param num
 */
export let limpaNumero = function (num) {
    return num.replace(/[^0-9]/g,'');
}

export let ajusteOrcrim = function (orcrim) {
  if(orcrim == "OKAIDA"){
    return orcrim = "Al-Qaeda (\"Okaida\")"
  } else if (orcrim == "EUA") {
    return orcrim = "Estados unidos"
  } else {
    return orcrim;
  }
} 
/**
 * Checa se é um email.
 *
 * @param email
 */
export let validaEmail = function (email: string) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Gera o SHA256 da string.
 *
 * @param dado
 */
export let sha256 = function (dado) {
    return createHash('SHA256').update(dado).digest('hex');
}

/**
 * Gera o MD5 da string.
 *
 * @param dado
 */
export let md5 = function (dado) {
    return createHash('md5').update(dado).digest('hex');
}

/**
 * Gera o SHA1 da string.
 *
 * @param dado
 */
export let sha1 = function (dado) {
    return createHash('sha1').update(dado).digest('hex');
}

/**
 * Função que gera uma senha aleatória
 *
 * @param length
 */
export let gerarSenha = function (length) {
    let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*-+ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let senha = "";

    for (let x = 0; x < length; x++) {
        let i = Math.floor(Math.random() * chars.length);
        senha += chars.charAt(i);
    }

    return senha;
}

export const promisify = function(value) {
  return new Promise(resolve => resolve(value));
}

/**
 * Pega o nome da função dentro do escopo que foi chamado.
 *
 * @param nivel
 * @param posicao
 */
export const getNomeFuncao = function(nivel: number=1, posicao:number =2){

  const funcoes = new Error().stack.match(/at (.*?) /g)
    .map(dado => dado.replace('at ', '').replace('Object.', '').trim())

  return funcoes[nivel];
}

export const normalizePort = function (val: any): number | string | boolean {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }

  return false;
}

export const getIpRequest = function(request) {
  return (!request.headers['x-real-ip']) ? request.ip : request.headers['x-real-ip'];
}

/**
 * Polyfill do Promise.allSettled
 * @param promises
 */
export const allSettled = function (promises) {
  let mappedPromises = promises.map((p) => {
    return p
      .then((value) => {
        return {
          status: 'fulfilled',
          value,
        };
      })
      .catch((reason) => {
        return {
          status: 'rejected',
          reason,
        };
      });
  });
  return Promise.all(mappedPromises);
};

export const processAllSettled = function (dados) {
  return dados
    .filter(d => d.status === 'fulfilled')
    .map(d => d.value)
}

