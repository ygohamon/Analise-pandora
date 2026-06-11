const got = require('got');

import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

import {
  getNomeFuncao,
  modelFactory as mf,
  resultFoundRaw,
  formataDado,
  flat
} from './../../utils';

const modelConfig = getModelConfig('WEBSERVICE_SEDS');

const fonte = MODEL_PRIORITY['boletim_ocorrencia'].fonte;
const rank = MODEL_PRIORITY['boletim_ocorrencia'].rank;
const grupo = MODEL_PRIORITY['boletim_ocorrencia'].grupo;

export const getBoletimOcorrenciaCPF_CODATA = function(cpf: string) {

  const cpfFormatado = formataDado(cpf, '###.###.###-##');
  const nomeFuncao = getNomeFuncao(1, 2);
  const fnRetorno = resultFoundRaw;

  const query = async () => {
    const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
    const gotConfig = {
      timeout,
      retry: 0,
      headers: {
        'Isis-Token': `${modelConfig.get('CODATA_SEDS_TOKEN_ACESSO')}`,
      }
    };

    const resultado = await got(`${modelConfig.get('CODATA_SEDS_URL')}mppb_consulta_parte?cpf=${cpfFormatado}`, gotConfig).json()
    if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
      const dados = resultado.result.data;
      return Promise.all(dados.map(bo => getOcorrenciaCdEnvolvido_CODATA(bo.PAR_CODIGO_ENVOLVIDO, bo.NUMERO_BO)))
        .then(ocorrencias => formataBO(dados, flat(ocorrencias)))
    } else {
      return null;
    }
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

export const getDadosDelegaciaDepartamento_CODATA = function(departamento: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const fnRetorno = resultFoundRaw;

  const query = async () => {
    const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
    const gotConfig = {
      timeout,
      retry: 0,
      headers: {
        'Isis-Token': `${modelConfig.get('CODATA_SEDS_TOKEN_ACESSO')}`,
      }
    };

    const resultado = await got(`${modelConfig.get('CODATA_SEDS_URL')}mppb_lista_delegacias?departamento=${departamento}`, gotConfig).json()
    if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
      return formataDelegacia(resultado.result.data)
    } else {
      return null;
    }
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};

const getOcorrenciaCdEnvolvido_CODATA = async function(cdEnvolvido: string, bo: string) {
  const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
  const gotConfig = {
    timeout,
    retry: 0,
    headers: {
      'Isis-Token': `${modelConfig.get('CODATA_SEDS_TOKEN_ACESSO')}`,
    }
  };

  const resultado = await got(`${modelConfig.get('CODATA_SEDS_URL')}mppb_dados_ocorrencia?cdenvolvido=${cdEnvolvido}&bo=${bo}`, gotConfig).json()
  if (resultado?.status  === 'SUCCESS' && resultado?.result?.data?.length > 0) {
    return resultado.result.data;
  } else {
    return []
  }
};

const formataBO = function (boletins, ocorrencias) {
  return boletins.map(r => {
    return {
      tipoOcorrencia:    r.TIPO_OCORRENCIA,
      numeroBo:          r.NUMERO_BO,
      cpf:               r.PAR_NUMERO_DO_DOCUMENTO,
      nome:              r.PAR_NOME,
      sexo:              r.PAR_SEXO,
      dataNascimento:    r.PAR_DATA_NASCIMENTO,
      qualificacao:      r.PAR_QUALIFICACAO,
      estadoCivil:       r.PAR_ESTADO_CIVIL,
      orientacaoSexual:  r.PAR_ORIENTACAO_SEXUAL,
      genero:            r.PAR_GENERO,
      nacionalidade:     r.PAR_NACIONALIDADE,
      profissao:         r.PAR_PROFISSAO,
      naturalidade:      r.PAR_NATURALIDADE,
      cor:               r.PAR_COR,
      ufParte:           r.PAR_UF,
      escolaridade:      r.PAR_ESCOLARIDADE,
      nomeMae:           r.PAR_MAE,
      nomePai:           r.PAR_PAI,
      foneResidencial:   r.PAR_RESIDENCIAL_FONE,
      cep:               r.PAR_RESIDENCIAL_CEP,
      endereco:          r.PAR_RESIDENCIAL_ENDERECO,
      numero:            r.PAR_RESIDENCIAL_NUMERO,
      bairro:            r.RESIDENCIAL_BAIRRO,
      complemento:       r.PAR_RESIDENCIAL_COMPLEMENTO,
      pontoReferencia:   r.PAR_RESIDENCIAL_REFERENCIA,
      ufEndereco:        r.PAR_RESIDENCIAL_UF,
      alcunha:           r.PAR_ALCUNHA,
      codigoEnvolvido:   r.PAR_CODIGO_ENVOLVIDO,
      dados_ocorrencias: formataOcorrencias(ocorrencias)
    }
  })
}

const formataOcorrencias = function (dados) {
  return dados.map(d => {
    return {
      tipoOcorrencia:           d.TIPO_OCORRENCIA,
      numeroBo:                 d.NUMERO_BO,
      codigoEnvolvido:          d.PAR_CODIGO_ENVOLVIDO,
      numeroDocumento:          d.NUMERO_DO_DOCUMENTO,
      tipoDocumento:            d.TIPO_DOCUMENTO,
      qualificacao:             d.PAR_QUALIFICACAO,
      natureza:                 d.OCO_NATUREZA,
      tipificacao:              d.OCO_TIPIFICACAO,
      situacaoCrime:            d.OCO_SITUACAO_CRIME,
      ocorrenciaLocal:          d.OCO_TIPO_LOCAL,
      ocorrenciaRua:            d.OCO_LOCAL_RUA,
      ocorrenciaBairro:         d.LOC_BAIRRO,
      ocorrenciaCidade:         d.LOC_CIDADE,
      ocorrenciaEstado:         d.LOC_ESTADO,
      ocorrenciaReferencia:     d.OCO_LOCAL_REFERENCIA,
      ocorrenciaAnoRegistro:    d.OCO_ANO_REGISTRO,
      statusOcorrencia:         d.OCO_STATUS,
      dataOcorrencia:           d.OCO_DATA_OCORRENCIA,
      horaOcorrencia:           d.OCO_HORARIO_REGISTRO,
      idDelegaciaCadastro:      d.COD_DELEGACIA_CADASTRO,
      nomeDelegaciaCadastro:    d.NOME_DELEGACIA_CADASTRO,
      idDelegaciaResponsavel:   d.COD_DELEGACIA_RESPONSAVEL,
      nomeDelegaciaResponsavel: d.NOME_DELEGACIA_RESPONSAVEL
    }
  })
}

const formataDelegacia = function (dados) {
  return dados.map(r => {
    return {
      idDepartamento:      r.ID_COD_DEPARTAMENTO,
      codSuperitendencia:  r.COD_SUPERITENDENCIA,
      codSeccional:        r.COD_SECCIONAL,
      codDelegacia:        r.COD_DELEGACIA,
      nomeDepartamento:    r.DEPARTAMENTO_NOME,
      codDepartamentoPai:  r.COD_DEPARTAMENTO_PAI,
      nomeDepartamentoPai: r.DEPARTAMENTO_PAI,
      tipoDepartamento:    r.TIPO_DEPARTAMENTO,
      cidadeDepartamento:  r.DEP_CIDADE
    }
  })
}
