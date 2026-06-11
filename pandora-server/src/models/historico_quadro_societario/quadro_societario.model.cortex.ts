
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.quadrosocietario'].fonte;
const rank   = MODEL_PRIORITY['cortex.quadrosocietario'].rank;
const grupo  = MODEL_PRIORITY['cortex.quadrosocietario'].grupo;

export let getHistoricoQuadroPFDetalhadoCPF_CORTEX = function (cpf: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cpf}/listagemsocio`, cpfUsuario)
      .then(dados => dados.map(dado => ({
        cnpj: dado?.numeroCNPJ,
        razaoSocial: dado?.razaoSocial,
        nomeFantasia: dado?.nomeFantasia,
        cpf: dado?.numeroCPF,
        nome: dado?.nomeSocio,
        vinculo: dado?.qualificacaoSocio,
        dataEntradaSociedade: dado?.dataEntradaSociedade,
        tipo: 'pf',
        fonte: modelConfig?.sigla
      })))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
