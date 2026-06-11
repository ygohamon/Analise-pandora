
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.pf'].fonte;
const rank   = MODEL_PRIORITY['cortex.pf'].rank;
const grupo  = MODEL_PRIORITY['cortex.pf'].grupo;

export let getPessoaDetalhadoCPF_CORTEX = function (cpf: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoafisica/${cpf}`, cpfUsuario)
    .then(dado => {
      return (!dado) ? null : [{
        cpf: dado?.numeroCPF,
        nome: dado?.nomeCompleto,
        nomeMae: dado?.nomeMae,
        municipio: dado?.municipio,
        uf: dado?.uf,
        dataNascimento: dado?.dataNascimento,
        sexo: dado?.sexo,
        situacaoCadastral: dado?.situacaoCadastral,
        residenteExterior: dado?.identificadorResidenteExterior,
        nomePaisExterior: dado?.paisResidencia,
        estrangeiro: dado?.indicadorEstrangeiro,
        naturezaOcupacao: dado?.naturezaOcupacao,
        ocupacaoPrincipal: dado?.ocupacaoPrincipal,
        ...(!!dado?.anoExercicioOcupacao && dado?.anoExercicioOcupacao !== '0000' && {anoExercicioOcupacao: dado?.anoExercicioOcupacao}),
        ...(!!dado?.anoObito && dado?.anoObito !== '0000' && {anoObito: dado?.anoObito}),
        fonte: modelConfig?.sigla
      }]
    })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getPessoaSimplificadoCPF_CORTEX = function (cpf: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoafisica/${cpf}`, cpfUsuario)
      .then(dado => {
        return (!dado) ? null : [{
          cpf: dado?.numeroCPF,
          nome: dado?.nomeCompleto,
          nomeMae: dado?.nomeMae,
          municipio: dado?.municipio,
          uf: dado?.uf,
          dataNascimento: dado?.dataNascimento,
          sexo: dado?.sexo,
          fonte: modelConfig?.sigla
        }]
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
