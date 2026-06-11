const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, getTime, parseDate, first } from './../../utils';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia.servidor'].fonte;
const rank  = MODEL_PRIORITY['transparencia.servidor'].rank
const grupo = MODEL_PRIORITY['transparencia.servidor'].grupo;

const fnRetorno = resultFoundRaw;

export let getServidorFederalCPF_Transparencia = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/servidores?cpf=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.servidor?.id,
          cpf,

          situacao: d?.servidor?.situacao?.descricao,
          // funcao: d?.servidor?.funcao?.descricao,

          // cargo
          orgaoSuperiorLotacao: first(d?.fichasCargoEfetivo)?.orgaoSuperiorLotacao,
          uorgLotacao: first(d?.fichasCargoEfetivo)?.uorgLotacao,
          orgaoServidorLotacao: first(d?.fichasCargoEfetivo)?.orgaoServidorLotacao,
          dataIngressoOrgao: parseDate(first(d?.fichasCargoEfetivo)?.dataIngressoOrgao),
          orgaoServidorExercicio: first(d?.fichasCargoEfetivo)?.orgaoServidorExercicio,
          uorgExercicio: first(d?.fichasCargoEfetivo)?.uorgExercicio,
          jornadaTrabalho: first(d?.fichasCargoEfetivo)?.jornadaTrabalho,
          cargo: first(d?.fichasCargoEfetivo)?.cargo,
          classeCargo: first(d?.fichasCargoEfetivo)?.classeCargo,
          dataIngressoCargo: parseDate(first(d?.fichasCargoEfetivo)?.dataIngressoCargo),

          // funcao
          funcao: first(d?.fichasFuncao)?.funcao,
          funcaoAtividade: first(d?.fichasFuncao)?.atividade,
          dataIngressoFuncao: first(d?.fichasFuncao)?.dataIngressoFuncao,

          fonte: 'transparencia',
          tipo: 'servidor',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
