const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, parseDate, getTime } from './../../utils';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia_processo'].fonte;
const rank  = MODEL_PRIORITY['transparencia_processo'].rank
const grupo = MODEL_PRIORITY['transparencia_processo'].grupo;

const fnRetorno = resultFoundRaw;

export let getTransparenciaAcordoLenienciaCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/acordos-leniencia?cnpjSancionado=${cnpj}`, config)
      .json()
      .then(dados => dados.map(d => Object.assign(d, {dataConsulta: getTime(), fonte: 'transparencia', tipo: 'acordo_leniencia'})))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

const processaCNEP = function (d) {
  return {
    id: d?.id,
    dataReferencia: parseDate(d?.dataReferencia),
    dataInicioSancao: parseDate(d?.dataInicioSancao),
    dataFimSancao: parseDate(d?.dataFimSancao),
    dataPublicacaoSancao: parseDate(d?.dataPublicacaoSancao),
    dataTransitadoJulgado: parseDate(d?.dataTransitadoJulgado),
    dataOrigemInformacao: parseDate(d?.dataOrigemInformacao),

    tipoSancao: d?.tipoSancao?.descricaoResumida,
    fonteSancao: d?.fonteSancao?.nomeExibicao,
    dispositivo: d?.legislacao?.fundamentacaoLegal,

    valorMulta: d?.valorMulta?.replace('.','')?.replace(',','.'),
    textoPublicacao: d?.textoPublicacao,
    numeroProcesso: d?.numeroProcesso,

    municipio: d?.pessoa?.municipio?.nomeIBGE,
    uf: d?.pessoa?.municipio?.uf?.sigla,
    fonte: 'transparencia',
    tipo: 'cnep',
    dataConsulta: getTime()
  }
}

export let getTransparenciaCNEP_CNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/cnep?cnpjSancionado=${cnpj}`, config)
      .json()
      .then(dados => dados.map(d => processaCNEP(d)))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

export let getTransparenciaCNEP_CPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/cnep?codigoSancionado=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => processaCNEP(d)))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

export let getTransparenciaCEAF_CPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/ceaf?cpfSancionado=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          dataPublicacao: parseDate(d?.dataPublicacao),
          dataReferencia: parseDate(d?.dataReferencia),

          processo: d?.punicao.processo,
          tipoSancao: d?.tipoPunicao?.descricao,
          orgaoLotacao: d?.orgaoLotacao?.nomeSemAcento,
          ufLotacao: d?.ufLotacaoPessoa?.uf?.sigla,
          cargo: d?.cargoEfetivo,
          cargoComissao: d?.cargoComissao,
          fundamentacao: d?.fundamentacao.map(f => f.codigo).join(' / '),

          municipio: d?.pessoa?.municipio?.nomeIBGEsemAcento,
          uf: d?.pessoa?.municipio?.uf?.sigla,
          fonte: 'transparencia',
          tipo: 'ceaf',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

export let getTransparenciaCEPIM_CNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/cepim?cnpjSancionado=${cnpj}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          dataReferencia: parseDate(d?.dataReferencia),

          motivo: d?.motivo,
          orgaoSuperior: d?.orgaoSuperior?.orgaoMaximo?.nome,

          convenioCodigo: d?.convenio?.codigo,
          convenioObjeto: d?.convenio?.objeto,
          convenioNumero: d?.convenio?.numero,

          municipio: d?.pessoaJuridica?.municipio?.nomeIBGE,
          uf: d?.pessoaJuridica?.municipio?.uf?.sigla,
          fonte: 'transparencia',
          tipo: 'cepim',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};


const processaCEIS = function (d) {
  return {
    id: d?.id,
    dataReferencia: parseDate(d?.dataReferencia),
    dataInicioSancao: parseDate(d?.dataInicioSancao),
    dataFimSancao: parseDate(d?.dataFimSancao),
    dataPublicacaoSancao: parseDate(d?.dataPublicacaoSancao),
    dataTransitadoJulgado: parseDate(d?.dataTransitadoJulgado),
    dataOrigemInformacao: parseDate(d?.dataOrigemInformacao),

    orgaoSancionador: d?.orgaoSancionador?.nome,
    tipoSancao: d?.tipoSancao?.descricaoResumida,
    fonteSancao: d?.fonteSancao?.nomeExibicao,
    dispositivo: d?.legislacao?.fundamentacaoLegal,

    // valorMulta: d?.valorMulta?.replace('.','')?.replace(',','.'),
    textoPublicacao: d?.textoPublicacao,
    detalhamentoPublicacao: d?.detalhamentoPublicacao,
    numeroProcesso: d?.numeroProcesso,

    municipio: d?.pessoa?.municipio?.nomeIBGE,
    uf: d?.pessoa?.municipio?.uf?.sigla,
    fonte: 'transparencia',
    tipo: 'ceis',
    dataConsulta: getTime()
  }
}

export let getTransparenciaCEIS_CNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/ceis?codigoSancionado=${cnpj}`, config)
      .json()
      .then(dados => dados.map(d => processaCEIS(d)))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

export let getTransparenciaCEIS_CPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/ceis?codigoSancionado=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => processaCEIS(d)))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
