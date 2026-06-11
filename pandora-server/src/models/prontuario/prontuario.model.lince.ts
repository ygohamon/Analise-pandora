import { lince } from "../../services/misc/lince.service";
import { MODEL_PRIORITY } from "./../../config";

import {
  flat,
  first,
  second,
  getNomeFuncao,
  limpaNumero,
  modelFactory as mf,
  resultFoundRaw,
} from "./../../utils";

import { getModelConfig } from "../../config.models";

const modelConfig = getModelConfig("WEBSERVICE_LINCE");

const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY["lince.prontuarios"].fonte;
const rank = MODEL_PRIORITY["lince.prontuarios"].rank;
const grupo = MODEL_PRIORITY["lince.prontuarios"].grupo;

export let getProntuarioCPF_LINCE = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-cpf/${cpf}`);

    if(!resultado) {
      return null;
    }

    return formataProntuario(resultado.prontuario);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte,
    rank,
    grupo,
    fnRetorno,
  });
}

export let getProntuarioNome_LINCE = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-name/${nome}`);
    if (!resultado) return null;
    return formataProntuarioLista(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte,
    rank,
    grupo,
    fnRetorno,
  });
}

export let getProntuarioAlcunha_LINCE = function (alcunha: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-cognomen/${alcunha}`);
    if(!resultado) return null;

    return formataProntuarioLista(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte,
    rank,
    grupo,
    fnRetorno,
  });
}

export let getProntuarioRG_LINCE = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-rg/${rg}`);
    if (!resultado) return null;
    return formataProntuarioLista(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte,
    rank,
    grupo,
    fnRetorno,
  });
}

// Formatação do Prontuario a ser chamado no Component,
// ++ Lembrando que html não chama essa formatação ele -
// - chama parametros da propria api ++

const formataProntuario = function (dados) {
  let prontuario = [{
    nome                          : dados?.nome,
    data                          : dados?.data_nasc,
    cpf                           : dados?.cpf,
    rg                            : dados?.rg,
    orgao                         : dados?.orgao_exp,
    pai                           : dados?.pai,
    mae                           : dados?.mae,
    enderecos                     : dados?.enderecos,
    vulgo                         : dados?.vulgo,
    comparsas                     : dados?.comparsas,
    faccao                        : dados?.faccao,
    atividade                     : dados?.principal_atividade_criminosa,
    cidade                        : dados?.enderecos.map(function(cid){ return cid.cidade;}),
    cabelo                        : dados?.cabelo,
    olhos                         : dados?.olhos,
    cutis                         : dados?.cutis,
    barba                         : dados?.barba,
    cicatriz                      : dados?.cicatriz,
    tatuagem                      : dados?.tatuagem,
    updated_at                    : dados?.updated_at,
    naturalidade                  : dados?.naturalidade,
    sexo                          : dados?.sexo === 'M' ? 'MASCULINO' : 'FEMININO',
    conjuge                       : dados?.conjuge,
    profissao                     : dados?.profissao,
    falecido                      : dados?.falecido,
    imagens                       : dados?.imagens,
    info                          : dados?.informacoes_adicionais,
    fonte                         : modelConfig?.sigla
  }];

  return prontuario;
}

const formataProntuarioLista = function (dados) {
  return dados.map(d => ({
    nome                          : d?.nome,
    data                          : d?.data_nasc,
    cpf                           : d?.cpf,
    rg                            : d?.rg,
    orgao                         : d?.orgao_exp,
    pai                           : d?.pai,
    mae                           : d?.mae,
    enderecos                     : d?.enderecos,
    vulgo                         : d?.vulgo,
    comparsas                     : d?.comparsas,
    faccao                        : d?.faccao,
    atividade                     : d?.principal_atividade_criminosa,
    cidade                        : d?.enderecos.map(function(cid){ return cid.cidade;}),
    cabelo                        : d?.cabelo,
    olhos                         : d?.olhos,
    cutis                         : d?.cutis,
    barba                         : d?.barba,
    cicatriz                      : d?.cicatriz,
    tatuagem                      : d?.tatuagem,
    naturalidade                  : d?.naturalidade,
    sexo                          : d?.sexo === 'M' ? 'MASCULINO' : 'FEMININO',
    conjuge                       : d?.conjuge,
    profissao                     : d?.profissao,
    falecido                      : d?.falecido,
    idade                         : d?.idade,
    imagens                       : d?.imagens,
    info                          : d?.informacoes_adicionais,
    fonte                         : modelConfig?.sigla,
  })
  );
}
