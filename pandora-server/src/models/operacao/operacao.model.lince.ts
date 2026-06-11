import { lince } from "../../services/misc/lince.service";
import { MODEL_PRIORITY } from "../../config";

import {
  getNomeFuncao,
  modelFactory as mf,
  resultFoundRaw,
} from "../../utils";

import { getModelConfig } from "../../config.models";

const modelConfig = getModelConfig("WEBSERVICE_LINCE");

const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY["lince.orcrins"].fonte;
const rank = MODEL_PRIORITY["lince.orcrins"].rank;
const grupo = MODEL_PRIORITY["lince.orcrins"].grupo;

// Formatação da Orcrim a ser chamado no Component,
// ++ Lembrando que html não chama essa formatação ele -
// - chama parametros da propria api ++

const formataSIMPLIFICADOArray = function (dados) {
  return dados.map(d =>
  ({
    nome: d?.nome,
    dataNascimento: d?.data_nasc,
    cpf: d?.cpf,
    rg: d?.rg,
    orgao: d?.orgao_exp,
    nomePai: d?.pai,
    nomeMae: d?.mae,
    municipio: d?.enderecos.map(function (cid) { return cid.cidade; }),
    uf: d?.enderecos.map(function (cid) { return cid.estado; }),
    comparsas: d?.comparsas,
    faccao: d?.faccao,
  })
  );
}

const formataSIMPLIFICADO = function (d) {
  let orcrim = [{
    nome: d?.nome,
    dataNascimento: d?.data_nasc,
    cpf: d?.cpf,
    rg: d?.rg,
    orgao: d?.orgao_exp,
    nomePai: d?.pai,
    nomeMae: d?.mae,
    municipio: d?.enderecos.map(function (cid) { return cid.cidade; }),
    uf: d?.enderecos.map(function (cid) { return cid.estado; }),
    comparsas: d?.comparsas,
    faccao: d?.faccao,
  }];
  return orcrim;
}

const formataDETALHADO = function (dados) {
  let orcrim = [{
    nome                          : dados?.nome,
    dataNascimento                : dados?.data_nasc,
    cpf                           : dados?.cpf,
    rg                            : dados?.rg,
    emissorRg                     : dados?.orgao_exp,
    nomePai                       : dados?.pai,
    nomeMae                       : dados?.mae,
    vulgo                         : dados?.vulgo,
    comparsas                     : dados?.comparsas,
    faccao                        : dados?.faccao,
    atividade                     : dados?.principal_atividade_criminosa,
    cabelo                        : dados?.cabelo,
    olhos                         : dados?.olhos,
    cutis                         : dados?.cutis,
    barba                         : dados?.barba,
    cicatriz                      : dados?.cicatriz,
    tatuagem                      : dados?.tatuagem,
    updated_at                    : dados?.updated_at,
    naturalidade                  : dados?.naturalidade,
    sexo                          : dados?.sexo === 'M' ? 'MASCULINO' : 'FEMININO',
    endereco                      : dados?.enderecos,
    conjuge                       : dados?.conjuge,
    profissao                     : dados?.profissao,
    falecido                      : dados?.falecido,
    imagens                       : dados?.imagens,
    info                          : dados?.informacoes_adicionais,
    fonte                         : modelConfig?.sigla
  }];
  return orcrim;
}

const formataDETALHADOArray = function (dados) {
  return dados.map(d => ({
      nome                          : d?.nome,
      dataNascimento                : d?.data_nasc,
      cpf                           : d?.cpf,
      rg                            : d?.rg,
      emissorRg                     : d?.orgao_exp,
      nomePai                       : d?.pai,
      nomeMae                       : d?.mae,
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
      naturalidade                  : d?.naturalidade,
      sexo                          : d?.sexo === 'M' ? 'MASCULINO' : 'FEMININO',
      endereco                      : d?.enderecos,
      conjuge                       : d?.conjuge,
      profissao                     : d?.profissao,
      falecido                      : d?.falecido,
      idade                         : d?.idade,
      imagens                       : d?.imagens,
      info                          : d?.informacoes_adicionais,
      fonte                         : modelConfig?.sigla,
  }));
}

export let getOrganizacaoCriminosaLince = function (orcrim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-orcrim?orcrim=${orcrim}`);
    var arr1 = resultado.prontuarios
    arr1.filter(function (item) {
      if (item.rg === 'NÃO INFORMADO') { return item.rg = ''; }
    })
    if (!resultado) return null;
    return formataSIMPLIFICADOArray(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo,
    fnRetorno,
  });
}



export let getProntuarioSimplificado_CPF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    //Constante que ira pesquisar todos os prontuarios apartir de um determinado CPF
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-cpf/${cpf}`);
    // Validação para caso a consulta retorne nenhum prontuario, lembrando que a API do cortex
    if(!resultado) return null;
    
    return formataSIMPLIFICADO(resultado.prontuario);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo: 'prontuario',
    fnRetorno,
  });
}

export let getProntuarioDetalhado_Alcunha = function (nome: string){

    const nomeFuncao = getNomeFuncao(1, 2);
    const query = async () => {
      //Constante que ira pesquisar todos os prontuarios apartir de um determinado CPF
      const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-cognomen/${nome}`);
      // Validação para caso a consulta retorne nenhum prontuario, lembrando que a API do cortex
      if(!resultado) return null;
      
      return formataDETALHADOArray(resultado.prontuarios);
    };
  
    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
      fonte: 'lince',
      rank,
      grupo: 'prontuario',
      fnRetorno,
    });
  }

export let getProntuarioSimplificado_Nome = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-name/${nome}`);
    if (!resultado) return null;
    return formataSIMPLIFICADOArray(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo: 'prontuario',
    fnRetorno,
  });
}

export let getProntuarioSimplificado_RG = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-rg/${rg}`);
    if (!resultado) return null;
    return formataSIMPLIFICADOArray(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo: 'prontuario',
    fnRetorno,
  });
}

export let getProntuarioDetalhado_CPF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    //Constante que ira pesquisar todos os prontuarios apartir de um determinado CPF
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-cpf/${cpf}`);
    // Validação para caso a consulta retorne nenhum prontuario, lembrando que a API do cortex
    if(!resultado) return null;
    return formataDETALHADO(resultado.prontuario);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo: 'prontuario',
    fnRetorno,
  });
}

export let getProntuarioDetalhado_Nome = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-name/${nome}`);
    if (!resultado) return null;
    return formataDETALHADOArray(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo: 'prontuario',
    fnRetorno,
  });
}

export let getProntuarioDetalhado_RG = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const resultado = await lince.get(`${modelConfig.get('LINCE_URL')}/api/external/prontuarios/search-by-rg/${rg}`);
    if (!resultado) return null;
    return formataDETALHADOArray(resultado.prontuarios);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte: 'lince',
    rank,
    grupo: 'prontuario',
    fnRetorno,
  });
}
