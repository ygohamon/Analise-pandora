import * as rp from 'request-promise-native';
import * as _ from 'underscore';

import * as pessoa from './../pessoa';
import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao, resultFoundRaw, flat } from '../../utils';

const modelConfig = getModelConfig('WEBSERVICE_TJPB');
const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['tjpb.processo'].fonte;
const rank  = MODEL_PRIORITY['tjpb.processo'].rank;
const grupo = MODEL_PRIORITY['tjpb.processo'].grupo;


//
// SISTEMAS DO WEBSERVICE DO TJPB
//

// [
//     {
//         "codigo": "1",
//         "nome": "Controle de Processo Judiciais",
//         "sigla": "CPJ",
//         "descricao": "Sistema de processos judiciais do segundo grau",
//         "relacional": false,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "2"
//         ]
//     },
//     {
//         "codigo": "2",
//         "nome": "E-JUS - Juizados",
//         "sigla": "EJUS",
//         "descricao": "Sistema de processos judiciais de juizados especiais e turmas recursais",
//         "relacional": true,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "1",
//             "3"
//         ]
//     },
//     {
//         "codigo": "3",
//         "nome": "Processo Judicial Eletrônico - 1º Grau",
//         "sigla": "PJE1G",
//         "descricao": "Sistema de processos judiciais digitais criado pelo CNJ utilizado no primeiro grau de jurisdição",
//         "relacional": true,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "1"
//         ]
//     },
//     {
//         "codigo": "4",
//         "nome": "Processo Judicial Eletrônico - 2º Grau",
//         "sigla": "PJE2G",
//         "descricao": "Sistema de processos judiciais digitais criado pelo CNJ utilizado no segundo grau de jurisdição",
//         "relacional": true,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "2"
//         ]
//     },
//     {
//         "codigo": "5",
//         "nome": "SISCOM - STI",
//         "sigla": "SISCOM",
//         "descricao": "Sistema de processos judiciais do primeiro grau",
//         "relacional": false,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "1",
//             "3"
//         ]
//     },
//     {
//         "codigo": "6",
//         "nome": "SISCOM-W",
//         "sigla": "SISCOMW",
//         "descricao": "Sistema de processos judiciais do primeiro grau que substituirá o SISCOM",
//         "relacional": true,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "1"
//         ]
//     },
//     {
//         "codigo": "7",
//         "nome": "VEP Virtual",
//         "sigla": "VEP",
//         "descricao": "Sistema de processos judiciais das varas de execuções penais",
//         "relacional": true,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "1"
//         ]
//     },
//     {
//         "codigo": "8",
//         "nome": "Turmas Recursais dos Magistrados",
//         "sigla": "TRM",
//         "descricao": "Sistemas de processos judiciais físicos das turmas recursais",
//         "relacional": false,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "4"
//         ]
//     },
//     {
//         "codigo": "9",
//         "nome": "E-JUS - Turmas Recursais",
//         "sigla": "EJUS_TR",
//         "descricao": "Sistema de processos judiciais de juizados especiais e turmas recursais",
//         "relacional": true,
//         "situacao": "ATIVO",
//         "codigosJurisdicoes": [
//             "4"
//         ]
//     },
// ]

// identificando os codigos de pessoas no banco do TJPB via cpf:
let getCodigoNomeCPFSistema = function (nome: string, cpf: string, sistema: number) {

  let options = {
    json: true,
    timeout: modelConfig.get('TJPB_WEBSERVICE_TIMEOUT'),
    url: `${modelConfig.get('TJPB_WEBSERVICE_URL')}/${sistema}/pessoas?nome=${nome}&nomeSanitizado=SIM&tipoPessoa=F&numeroPessoaRF=${cpf}&codigosClasses=&codigosSituacoesProcessos=&codigosUnidadesJudiciarias=&codigosPolos=&codigosSituacoesParte=`
  }

  return rp(options)
    .then(res => res.filter(cod => !cod.nenhumProcesso).map(cod => { return { codigo: cod.codigoPessoa, sistema: sistema}}))
    .catch(error => { return [] } );
    //}).catch(error => { throw new Error(`Erro ao executar WS do TJPB (codigosPessoaCPF: ${cpf}, sistema: ${sistema})`); });
}

let getCodigosPessoa = function (nome: string, cpf: string, sistemas) {

  let codigosNome = sistemas.map(sistema => getCodigoNomeCPFSistema(nome, '', sistema))
  // let codigosCPF = sistemas.map(sistema => getCodigoNomeCPFSistema('', cpf, sistema))
  // let codigos = codigosNome.concat(codigosCPF)
  let codigos = codigosNome;

  return Promise.all(codigos)
      .then(codigos => codigos.filter(c => _.size(c) > 0))
      .then(codigos => flat(codigos))
}

let getProcessoNumeroProcesso = function (processoSimplificado, sistema) {

  return rp({
    json: true,
    timeout: modelConfig.get('TJPB_WEBSERVICE_TIMEOUT'),
    url: `${modelConfig.get('TJPB_WEBSERVICE_URL')}/${sistema}/processos/${processoSimplificado.numero}`
  })
  .then(p => {
    return {
      numero: p?.numero,
      numeroAntigo: p?.numeroAntigo,
      classe: p?.classe?.descricao,
      assunto: p?.assuntoPrincipal?.descricao,
      gratuito: p?.gratuito,
      unidadeJudiciaria: p?.unidadeJudiciaria?.descricao,
      dataDistribuicao: p.dataDistribuicaoInstant,
      sigilo: p?.sigilo,
      status: p?.status?.descricao,
      transitouJulgado: p.transitouEmJulgado,
      valorAcao: p.valorAcao,
      sistema: p?.sistema?.sigla,
      tipo: 'processo_tjpb',
      fonte: modelConfig.sigla
    }
  })
  .catch(error => { return []; });
}

let trataProcessosPorCodigo = function (processosPorCodigo, sistema) {

  let processos = processosPorCodigo.map(p => getProcessoNumeroProcesso(p, sistema));
  return Promise.all(processos)
    .then(codigos => flat(codigos))
}

let getProcessoCodigoPessoa = function (codigoPessoa: {codigo: string, sistema: number}) {

  const codigo = codigoPessoa.codigo;
  const sistema = codigoPessoa.sistema;

  let options =  {
    json: true,
    timeout: modelConfig.get('TJPB_WEBSERVICE_TIMEOUT'),
    url: `${modelConfig.get('TJPB_WEBSERVICE_URL')}/${sistema}/processos?codigoPessoa=${codigo}&tipoPessoa=F&codigosClasses=&codigosSituacoesProcessos=&codigosUnidadesJudiciarias=&codigosPolos=&codigosSituacoesParte=`
  }

  return rp(options)
    .then(processosPorCodigo => trataProcessosPorCodigo(processosPorCodigo, sistema))
    .catch(error => { return []; });
}

let getProcessosCodigoPessoa = function (codigosPessoa: Array<any>) {

  const codigosProcesso = codigosPessoa.map(c => getProcessoCodigoPessoa(c))
  return Promise.all(codigosProcesso)
    .then(processos => flat(processos))
}

export let getProcessoCPF_TJPB = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const sistemas = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // let sistemas = [6, 7];

  const query = () => {
    return pessoa.getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(r => r.resultado?.dados[0]?.nome)
      .then(nome => getCodigosPessoa(nome, cpf, sistemas))
      .then(codigosPessoa => getProcessosCodigoPessoa(codigosPessoa));
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
