import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, first, print, formataDado } from './../../utils';

const fonte = MODEL_PRIORITY['credlink.pj'].fonte;
const rank  = MODEL_PRIORITY['credlink.pj'].rank;
const grupo = MODEL_PRIORITY['credlink.pj'].grupo;

const modelConfig = getModelConfig('CREDLINK');
const fnRetorno = resultFoundRaw;

const soap = require('soap');
const xml2js = require('xml2js');

const parser = new xml2js
  .Parser({explicitArray: false, trim: true, normalize: true, emptyTag: null})
  .parseStringPromise;

const isObject = obj => Object.prototype.toString.call(obj) === "[object Object]";

const lowerCaseObjectKeys = obj => Object.fromEntries(Object.entries(obj).map(objectKeyMapper));

const objectKeyMapper = ([ key, val ]) =>([
  key.toLowerCase(),
  isObject(val)
    ? lowerCaseObjectKeys(val)
    : val
])

const jsonToArraymanage = (dado = {}) => {
  return formataEmpresaDetalhadoManage(dado)
}

const jsonToArray = (dado = {}) => {
  return formataEmpresaDetalhado(dado);
}

const jsonToArraySimple = (dado = {}) => {
  return formataEmpresa(dado);
}

//Formatação do Prontuario a ser chamado no front.
const formataEmpresa = function (dado) {
  let pessoa = [{
    cnpj                           : dado?.cpfcnpj,
    razaoSocial                    : dado?.nome,
  }];

  return pessoa;
}

const formataEmpresaDetalhadoManage = function(dados) {
  let empresa = dados?.empresa
  let cnaes = empresa?.cnaes_secundarios?.cnae_secundario?.map(j => formataCnae(j))
  cnaes?.push(formataCnae({cnae_secundario_0: empresa?.cnae, desc_cnae_secundario_0: empresa?.desc_cnae, qtd_cnae_secundario: 0}))

  let socios = []

  try {
    socios = dados?.socios?.map(j => formataSocio(j))
  } catch(err) {
    if (dados?.socios && !Array.isArray(dados?.socios))
      socios.push(formataSocio(dados.socios))
  }

  let vizinhos = dados?.vizinhos?.telefone.map(v => formataVizinho(v))
  let pessoa = [{
    cnpj                          : empresa ? empresa?.cnpj : dados?.consulta_ccf619.cpf,
    razaoSocial                   : empresa ? empresa?.razaosocial : dados?.consulta_ccf619.nome_completo,
    dataInicioAtividade           : empresa?.['dt.inicio'],
    enderecoEmpresa               : empresa?.endereco,
    bairro                        : empresa?.bairro,
    municipio                     : empresa?.cidade,
    cep                           : empresa?.cep,
    numero                        : empresa?.numero,
    uf                            : empresa?.uf,
    cnae                          : empresa?.cnae,
    desc_cnae                     : empresa?.desc_cnae,
    situacao                      : empresa?.situacao,
    tipo_filial                   : empresa?.tipo_filial,
    info_restricao                : dados?.consulta_ccf619?.info_restricao,
    restricoes_bancarias          : dados?.consulta_ccf619?.restricoes_bancarias?.restricao?.mensagem ?? '***********',
    restricoes_lojistas           : dados?.consulta_ccf619?.restricoes_lojistas?.restricao?.mensagem ?? '***********',
    cheques_pre_datados           : dados?.consulta_ccf619?.cheques_pre_datados?.cheque?.valor ? '***********' : null,
    alertas                       : dados?.consulta_ccf619?.alertas?.alerta?.mensagem ?? '***********',
    _atividadeeconomica           : cnaes,
    _historico_quadro_societario  : socios,
    _vizinho                      : vizinhos
  }]

  return pessoa;
}

const formataVizinho = function(dado){
  let vizinho = {
    cpfcnpj                     : dado?.cpfcnpj,
    nome                        : dado?.nome,
    logradouro                  : dado?.endereco,
    numero                      : dado?.numero,
    complemento                 : dado?.complemento,
    municipio                   : dado?.cidade,
    telefone                    : dado?.telefone,
    tipo                        : 'vizinho',
    fonte                       : modelConfig.sigla,
    rank                        : 0
  }

  return vizinho;
}

  const formataSocio = function(dado) {
    let socio = {
      nome                : dado?.nomesocio,
      cpf                 : dado?.cpfsocio,
      dataEntradaSociedade: dado?.entradasociedade,
      vinculo             : dado?.cargosociedade,
      tipo                : 'pj-pf',
      fonte               : modelConfig.sigla,
      rank                : 0
    }

    return socio;
  }

  const formataCnae = function(dado){
    let cnae = {
      cnae:       dado['cnae_secundario_' + dado.qtd_cnae_secundario],
      descricao:  dado['desc_cnae_secundario_' + dado.qtd_cnae_secundario],
      tipo:       'cnae',
      fonte:      modelConfig.sigla,
      rank:       0
    }

    return cnae;
  }

  const formataEmpresaDetalhado = function(dados) {
    let dadosEmpresa = [{
      cnpj                          : dados?.cpfcnpj,
      razaoSocial                   : dados?.nome,
      dataInicioAtividade           : dados?.dataabertura,
      enderecoEmpresa               : dados?.endereco,
      bairro                        : dados?.bairro,
      municipio                     : dados?.municipio,
      cep                           : dados?.cep,
      numero                        : dados?.numero,
      uf                            : dados?.uf,
      iptu                          : dados?.iptu,
      operadora                     : dados?.operadora,
      telefone                      : dados?.telefone,
      emails                        : dados?.emails,
      procon                        : dados?.procon,
    }];

    return dadosEmpresa;
  }

  const getEmpresaDetalhada = function (_cpfCnpj: string) {

  const cpfCnpj = (_cpfCnpj.length === 11) ?
    formataDado(_cpfCnpj, '###.###.###-##') :
    formataDado(_cpfCnpj, '##.###.###/####-##');

  const wsdl = modelConfig.get('WSDL')
  const params = {
    usuario: modelConfig.get('usuario'),
    senha: modelConfig.get('senha'),
    sigla: modelConfig.get('sigla'),
    cpfcnpj: cpfCnpj,
    nome : '',
    telefone: ''
  };

  const processa = (dados) => {
    if (dados === 'Nenhum registro encontrado para os parâmetros informados') {
      return null;
    } else {
      return parser(dados)
        .then(dados => dados?.credilink_webservice)
        .then(dados => lowerCaseObjectKeys(dados))
        .then(dados => jsonToArraymanage(dados) )
        .then(dados => dados.map(j => Object.assign(j, {tipo: 'credilink', fonte: modelConfig.sigla})))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.completoHistoricoAAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

  const getEmpresaSimplificada = function (_cpfCnpj: string) {

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
      if (dados === 'Nenhum registro encontrado para os parâmetros informados') return null;
      else {
        return parser(dados)
          .then(dados => dados?.RESULTADO?.REGISTRO)
          .then(dados => lowerCaseObjectKeys(dados))
          .then(dados => jsonToArraySimple(dados) )
          .then(dados => dados.map(j => Object.assign(j, {tipo: 'credilink', fonte})))
      }
    }

    return () => {
      return soap.createClientAsync(wsdl)
        .then(client => client.cnpjcomsociosAsync(params))
        .then(dados => processa(first(dados).return))
    }
  }

export const getEmpresaDetalhadoCNPJ_CREDILINK = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEmpresaDetalhada(cnpj);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export const getEmpresaSimplificadoCNPJ_CREDILINK = function(cnpj: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getEmpresaSimplificada(cnpj);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
