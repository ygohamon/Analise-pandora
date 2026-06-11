
import { db, ISql } from '../../../services/db.service';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../../utils';

const modelConfig = getModelConfig('BD_YELLOWPAGES');

const fonte = 'BD_YELLOWPAGES';
const rank = 0;
const grupo = 'yellowpages';

const ATRIBUTOS_DETALHADO = `
  nome
  ,razaoSocial
  ,cnpj
  ,endereco
  ,telefone
  ,email
  ,sistemaSolicitacaoJudicical
  ,obs
  ,procedimentoSolicitacaoJudicial
  ,contatoTecnicoJuridico
  ,dataRegistro
  ,'${modelConfig?.sigla}' as fonte
`;

export const getDadosYellowPagesRazaoSocial = function(razaoSocial: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['RAZAOSOCIAL', ISql.VarChar, razaoSocial],
    ],`
      SELECT
        ${ATRIBUTOS_DETALHADO}
      FROM ${modelConfig.get('YELLOWPAGES')}
      WHERE nome LIKE '%' + @RAZAOSOCIAL + '%'
        OR razaoSocial LIKE '%' + @RAZAOSOCIAL + '%'
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getDadosYellowPagesCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CNPJ', ISql.VarChar, cnpj],
    ],`
      SELECT
        ${ATRIBUTOS_DETALHADO}
      FROM ${modelConfig.get('YELLOWPAGES')}
      WHERE cnpj = @CNPJ
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
