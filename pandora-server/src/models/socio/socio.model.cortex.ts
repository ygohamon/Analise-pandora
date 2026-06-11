import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['cortex.quadrosocietario'].fonte;
const rank  = MODEL_PRIORITY['cortex.quadrosocietario'].rank;
const grupo = MODEL_PRIORITY['cortex.quadrosocietario'].grupo;

export const getSocioPFCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
    .then(dado => {
      return (!dado) ? null : dadosSocio(dado.cnpjSocio)
    });
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

const dadosSocio = function(dadosSocio) {
  let dados = dadosSocio.map(d => { return {
    cpf: d.numeroCPF,
    nome: d.nomeSocio,
    percCapital: d.percentualCapitalSocial,
    tipoSocio: d.identificadorSocio,
    vinculo: d.qualificacaoSocio,
    dataEntradaSociedade: d.dataEntradaSociedade,
    paisSocio: d.paisSocioEstrangeiro,
    cpfRepresentanteLegal: d.cpfRepresentanteLegal,
    nomeRepresentanteLegal: d.nomeRepresentanteLegal,
    qualificacaoRepresentanteLegal: d.qualificacaoRepresentanteLegal,
    tipo: 'pj-pf',
    fonte: modelConfig?.sigla
  }});

  return dados;
}
