
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_EMBARCACOES');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte  = MODEL_PRIORITY['bd_embarcacoes.re'].fonte;
const rank   = MODEL_PRIORITY['bd_embarcacoes.re'].rank;
const grupo  = MODEL_PRIORITY['bd_embarcacoes.re'].grupo;

const ATRIBUTOS_DETALHADO_PF = `
  TRIM(CPF_CNPJ) as cpfCnpj,
  TRIM(PF.Nome) as nome,
  TRIM(Descricao) as descricao,
  Valor as valor,
  DataEmissaNFe as dataAquisicao,
  '${modelConfig.get('FONTE_FISCO')}' as fonte
`;

const ATRIBUTOS_DETALHADO_PJ = `
  TRIM(CPF_CNPJ) as cpfCnpj,
  TRIM(PJ.RazaoSocial) as nome,
  TRIM(Descricao) as descricao,
  Valor as valor,
  DataEmissaNFe as dataAquisicao,
  '${modelConfig.get('FONTE_FISCO')}' as fonte
`;

export let getEmbarcacaoCPF_BD_Embarcacao_RE = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO_PF}
        FROM ${modelConfig.get('FISCO')} E
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (E.CPF_CNPJ = PF.CPF)
        WHERE cpf_cnpj = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmbarcacaoCNPJ_BD_Embarcacao_RE = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO_PJ}
        FROM ${modelConfig.get('FISCO')} E
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (E.CPF_CNPJ = PJ.CNPJ)
        WHERE cpf_cnpj = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
