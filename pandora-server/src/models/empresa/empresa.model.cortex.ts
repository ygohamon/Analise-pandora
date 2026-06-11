
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.pj'].fonte;
const rank   = MODEL_PRIORITY['cortex.pj'].rank;
const grupo  = MODEL_PRIORITY['cortex.pj'].grupo;


export let getEmpresaDetalhadoCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
    .then(dado => {
      return (!dado) ? null : [{
        cnpj: dado?.cnpj,
        razaoSocial: dado?.razaoSocial,
        nomeFantasia: dado?.nomeFantasia,
        dataInicioAtividade: dado?.dataInicioAtividade,
        municipio: dado?.municipio,
        uf: dado?.uf,
        matriz: dado?.indicadorMatrizFilial,
        situacaoCadastral: dado?.situacaoCadastral,
        dataSituacaoCadastral: dado?.dataSituacaoCadastral,
        porte: dado?.porteEmpresa,
        naturezaJuridica: dado?.naturezaJuridica,
        cnaeFiscal: dado?.cnaeFiscal,
        cnaeSecundario: dado?.cnaeSecundario,
        capitalSocial: dado?.capitalSocialEmpresa?.replace(/^0+/, ''),
        cpfResponsavel: dado?.cpfResponsavel,
        nomeResponsavel: dado?.nomeResponsavel,
        fonte: modelConfig?.sigla
      }]
    })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getEmpresaSimplificadoCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
      .then(dado => {
        return (!dado) ? null : [{
          cnpj: dado?.cnpj,
          razaoSocial: dado?.razaoSocial,
          nomeFantasia: dado?.nomeFantasia,
          dataInicioAtividade: dado?.dataInicioAtividade,
          municipio: dado?.municipio,
          uf: dado?.uf,
          fonte: modelConfig?.sigla
        }]
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}


export let getEmpresaSimplificadoCPFResponsavel_CORTEX = function (cpf: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cpf}/listagemresponsavel`, cpfUsuario)
      .then(dados => dados.map(dado => ({
        cnpj: dado?.cnpj,
        razaoSocial: dado?.razaoSocial,
        nomeFantasia: dado?.nomeFantasia,
        dataInicioAtividade: dado?.dataInicioAtividade,
        municipio: dado?.municipio,
        uf: dado?.uf,
        vinculo: 'responsavel',
        fonte: modelConfig?.sigla
      })))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export let getEmpresaSimplificadoCPFContador_CORTEX = function (cpf: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cpf}/listagemcontador`, cpfUsuario)
      .then(dados => dados.map(dado => ({
        cnpj: dado?.numeroCNPJ,
        razaoSocial: dado?.razaoSocial,
        nomeFantasia: dado?.nomeFantasia,
        municipio: dado?.municipio,
        uf: dado?.ufSgl,
        vinculo: 'contador',
        fonte: modelConfig?.sigla
      })))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};
