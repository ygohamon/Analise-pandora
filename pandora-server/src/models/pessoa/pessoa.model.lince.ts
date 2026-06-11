import { lince as lic } from "../../services/misc/lince.service";
import { MODEL_PRIORITY } from "./../../config";

import {
  getNomeFuncao,
  limpaNumero,
  modelFactory as mf,
  resultFoundRaw
} from "./../../utils";

import { getModelConfig } from "../../config.models";

const modelConfig = getModelConfig("WEBSERVICE_LINCE");

const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY["lince.pessoa"].fonte;
const rank = MODEL_PRIORITY["lince.pessoa"].rank;
const grupo = MODEL_PRIORITY["lince.pessoa"].grupo;

export let getPessoaSimplificadoCPF_LINCE = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = async () => {
    const resultado = await lic.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-cpf/${cpf}`);

    // Validação para caso a consulta retorne nenhum prontuario, lembrando que a API do cortex
    if(!resultado) {
      return null;
    }

    resultado.prontuario.cpf = limpaNumero(cpf);
    return formataProntuario(resultado.prontuario);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte,
    rank,
    grupo,
    fnRetorno,
  });
}

export let getPessoaSimplificadoNome_LINCE = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lic.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-name/${nome}`);

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

export let getPessoaSimplificadoRG_LINCE = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lic.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-rg/${rg}`);

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

//Formatação do Prontuario a ser chamado no front.
const formataProntuario = function (dados) {
  let prontuario = [{
    cpf                           : dados?.cpf,
    nome                          : dados?.nome,
    nomeMae                       : dados?.mae,
    dataNascimento                : dados?.data_nasc,
    rg                            : dados?.rg,
    municipio                     : dados?.enderecos.map(function(cid){ return cid.cidade;}),
    uf                            : dados?.enderecos.map(function(cid){ return cid.estado;}),
    sexo                          : dados?.sexo,
    fonte                         : modelConfig?.sigla
  }];

  return prontuario;
}

const formataProntuarioLista = function (dados) {
  return dados.map(d => ({
    nome                          : d?.nome,
    dataNascimento                : d?.data_nasc,
    cpf                           : d?.cpf,
    rg                            : d?.rg,
    orgao                         : d?.orgao_exp,
    nomePai                       : d?.pai,
    nomeMae                       : d?.mae,
    enderecos                     : d?.enderecos,
    logradouro                    : d?.enderecos.map(function(cid){ return cid.logradouro;}),
    bairro                        : d?.enderecos.map(function(cid){ return cid.bairro;}),
    municipio                     : d?.enderecos.map(function(cid){ return cid.cidade;}),
    uf                            : d?.enderecos.map(function(cid){ return cid.estado;}),
    vulgo                         : d?.vulgo,
    comparsas                     : d?.comparsas,
    faccao                        : d?.faccao,
    atividade                     : d?.principal_atividade_criminosa,
    cabelo                        : d?.cabelo,
    olhos                         : d?.olhos,
    cutis                         : d?.cutis,
    barba                         : d?.barba,
    cicatriz                      : d?.cicatriz,
    tatuagem                      : d?.tatuagem,
    dataAtualizacao               : d?.updated_at,
    naturalidade                  : d?.naturalidade,
    sexo                          : d?.sexo,
    conjuge                       : d?.conjuge,
    ocupacaoPrincipal             : d?.profissao,
    geometry                      : d?.geometry,
    falecido                      : d?.falecido,
    imagens                       : d?.imagens,
    fonte                         : modelConfig?.sigla,
  })
  );
}
