import { db, ISql } from './../../services/db.service';

import { MODEL_PRIORITY, API_CODES } from './../../config';
import { getNomeFuncao, modelFactory as mf, logErroBuscaBD } from './../../utils';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PANDORA');

const fonte = MODEL_PRIORITY['sispesquisa.aplicativo'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.aplicativo'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.aplicativo'].grupo;

export let getAplicativosAutorizados = function () {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ], `
      SELECT
        id,
        nome,
        ativo,
        convert(varchar, data_inicio, 103) as dataInicio,
        convert(varchar, data_fim, 103) as dataExpiracao
      FROM
        ${modelConfig.get('AUTHAPP')}
    `);
  }

return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getAplicativosByToken = function (token) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ], `
      SELECT
        id,
        nome,
        ativo,
        data_inicio as dataInicio,
        data_fim as dataExpiracao
      FROM
        ${modelConfig.get('AUTHAPP')}
      WHERE token = '${token}'
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let criarNovoAppAutorizado = function(nome, dataInicio, dataFim, token, ativo) {
  return db.query([
    ['nome', ISql.VarChar, nome],
    ['dataInicio', ISql.DateTime2, dataInicio],
    ['dataFim', ISql.DateTime2, dataFim],
    ['token', ISql.VarChar, token],
    ['ativo', ISql.Bit, ativo],
    ],`
      INSERT INTO ${modelConfig.get('AUTHAPP')} (nome, token, data_inicio, data_fim, ativo)
      values (@nome, @token, @dataInicio, @dataFim, @ativo)
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: `Aplicativo ${nome} autorizado. Garde as credenciais geradas para o cliente`,
        dados: [nome, token]
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha ao tentar salvar.`, 'criarNovoAppAutorizado');
    });
};

export let atualizarAppAutorizado = function(id, dataInicio, dataFim, ativo) {
  return db.query([
    ['id', ISql.Int, id],
    ['dataInicio', ISql.DateTime2, dataInicio],
    ['dataFim', ISql.DateTime2, dataFim],
    ['ativo', ISql.Bit, ativo],
    ],`
      UPDATE ${modelConfig.get('AUTHAPP')}
      SET data_inicio = @dataInicio, data_fim=@dataFim, ativo=@ativo
      where id = @id
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: `Aplicativo atualizado`,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha ao tentar salvar.`, 'atualizarAppAutorizado');
    });
};
