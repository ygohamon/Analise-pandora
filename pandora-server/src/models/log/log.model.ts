
import { db, ISql } from './../../services/db.service';
import { NovoLog } from './../../schemas/log.schema';
import { resultFound, logErroBuscaBD, respostaSucesso } from './../../utils';
import { MODEL_PRIORITY, API_CODES, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PANDORA');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['sispesquisa.logs'].fonte;
const rank = MODEL_PRIORITY['sispesquisa.logs'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.logs'].grupo;

export const getLogs = function(quantidade: number, offset: number) {
  if (!quantidade) {
    quantidade = 100;
  }
  if (!offset) {
    offset = 0;
  }

  return db.query([
    ['QTD', ISql.Int, quantidade],
    ['OFFSET', ISql.Int, offset],
    ],`
      SELECT
          ip, usuario, secao, item, chave, valor, tipo, code, mensagem,
          url, user_agent as userAgent, os, browser, device, processo, data_hora as dataHora

      FROM ${modelConfig.get('LOG')}
      ORDER BY data_hora DESC
      OFFSET @OFFSET ROWS FETCH NEXT @QTD ROWS ONLY
    `)
    .then(result => {
      return resultFound(result, fonte, rank, grupo);
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos logs.`, 'getLogs');
    });
};

export const salvaLogPorLogin = function(log: NovoLog) {
  return db.query([
      ['IP', ISql.VarChar, log.ip],
      ['USUARIO', ISql.VarChar, log.usuario],
      ['SECAO', ISql.VarChar, log.secao],
      ['ITEM', ISql.VarChar, log.item],
      ['CHAVE', ISql.VarChar, log.chave],
      ['VALOR', ISql.VarChar, log.valor],
      ['TIPO', ISql.VarChar, log.tipo],
      ['CODE', ISql.VarChar, log.code],
      ['MENSAGEM', ISql.VarChar, (log.mensagem) ? log.mensagem.slice(0, 499): null],
      ['URL', ISql.VarChar, log.url],
      ['USER_AGENT', ISql.VarChar, log.user_agent],
      ['OS', ISql.VarChar, log.os],
      ['BROWSER', ISql.VarChar, log.browser],
      ['DEVICE', ISql.VarChar, log.device],
      ['PROCESSO', ISql.VarChar, log.processo],
      ['DATA_HORA', ISql.VarChar, log.data_hora],
    ],`
      INSERT INTO ${modelConfig.get('LOG')}

      VALUES
      (
          @IP, @USUARIO, @SECAO, @ITEM, @CHAVE,
          @VALOR, @TIPO, @CODE, @MENSAGEM,
          @URL, @USER_AGENT, @OS, @BROWSER, @DEVICE,
          @PROCESSO, @DATA_HORA
      )
    `)
    .then(() => respostaSucesso('Log cadastrado com sucesso.'))
    .catch(error => {
      logErroBuscaBD(error, `Falha no cadastro do log.`, 'salvaLogPorLogin');
    });
};

export const salvaLogPorId = function(log: NovoLog) {
  return db.query([
    ['IP', ISql.VarChar, log.ip],
    ['USUARIO_ID', ISql.VarChar, log.usuario_id],
    ['SECAO', ISql.VarChar, log.secao],
    ['ITEM', ISql.VarChar, log.item],
    ['CHAVE', ISql.VarChar, log.chave],
    ['VALOR', ISql.VarChar, log.valor],
    ['TIPO', ISql.VarChar, log.tipo],
    ['CODE', ISql.VarChar, log.code],
    ['MENSAGEM', ISql.VarChar, (log.mensagem) ? log.mensagem.slice(0, 499): null],
    ['URL', ISql.VarChar, log.url],
    ['USER_AGENT', ISql.VarChar, log.user_agent],
    ['OS', ISql.VarChar, log.os],
    ['BROWSER', ISql.VarChar, log.browser],
    ['DEVICE', ISql.VarChar, log.device],
    ['PROCESSO', ISql.VarChar, log.processo],
    ['DATA_HORA', ISql.VarChar, log.data_hora],
    ],`
      INSERT INTO ${modelConfig.get('LOG')}

      (
          IP, USUARIO, SECAO, ITEM, CHAVE,
          VALOR, TIPO, CODE, MENSAGEM,
          URL, USER_AGENT, OS, BROWSER, DEVICE,
          PROCESSO, DATA_HORA
      )

      SELECT
          @IP, login, @SECAO, @ITEM, @CHAVE,
          @VALOR, @TIPO, @CODE, @MENSAGEM,
          @URL, @USER_AGENT, @OS, @BROWSER, @DEVICE,
          @PROCESSO, @DATA_HORA

      FROM ${modelConfig.get('USUARIO')}
      WHERE id=@USUARIO_ID
    `)
    .then(() => respostaSucesso('Log cadastrado com sucesso.'))
    .catch(error => {
      logErroBuscaBD(error, `Falha no cadastro do log.`, 'salvaLogPorId');
    });
};

export const getTokensValidos = function() {
  const duracaoToken = API_CONFIG.JWT_TOKEN_TEMPO_EXPIRACAO;

  return db.query([
    ],`
      SELECT
          ip,
          usuario,
          tipo,
          data_hora as dataHora,
          DATEADD(SECOND, ${duracaoToken}, data_hora) as validade,
          user_agent

      FROM ${modelConfig.get('LOG')}
      WHERE secao='SISTEMA'
          AND (tipo='LOGIN EXTERNO' OR tipo='LOGIN')
          AND data_hora >= DATEADD(SECOND, -${duracaoToken}, GETDATE())
      ORDER BY data_hora desc
        `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos tokens validos.`, 'getTokensValidos');
    });
};

export const getRankingUso = function(duracao: string, top = '100') {
  let filtro_duracao = '';
  let filtro_top = '';

  if (duracao) {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())`;
  }

  if (top) {
    filtro_top = `TOP ${top}`;
  }

  return db.query([
    ],`
      SELECT ${filtro_top}
          LOWER(usuario) as usuario, COUNT(usuario) as qtd
      FROM ${modelConfig.get('LOG')}
      WHERE secao <> 'SISTEMA'
          ${filtro_duracao}
      GROUP BY usuario
      ORDER BY qtd desc
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos rankings.`, 'getRankingUsoSIAP');
    });
};

export const getRecursosMaisPesquisados_Pesquisa = function(duracao: string) {
  let filtro_duracao = '';
  if (duracao && duracao != '-1') {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, getdate())`;
  }

  return db.query([
    ],`
      SELECT item as recurso, COUNT(*) as qtd
      FROM ${modelConfig.get('LOG')}
      WHERE secao = 'PESQUISA'
          ${filtro_duracao}
      GROUP BY item
      ORDER BY qtd DESC
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos recursos usados.`, 'getRecursosMaisPesquisados_Pesquisa');
    });
};

export const getRecursosEChavesMaisPesquisados_Pesquisa = function(duracao: string) {
  let filtro_duracao = '';
  if (duracao) {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())`;
  }

  return db.query([
    ],`
      SELECT item as recurso, chave, COUNT(*) as qtd
      FROM ${modelConfig.get('LOG')}
      WHERE secao = 'PESQUISA'
          ${filtro_duracao}
      GROUP BY item, chave
      ORDER BY qtd DESC
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos recursos e chaves mais usados.`, 'getRecursosEChavesMaisPesquisados_Pesquisa');
    });
};

export const getCPFsMaisPesquisados_Pesquisa = function(duracao: string, top = '100') {
  let filtro_duracao = '';
  if (duracao) {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())`;
  }

  return db.query([
    ],`
      ;WITH CPFS_MAIS_PESQUISADOS(CPF, QTD)
      AS
      (
          SELECT TOP ${top} valor, COUNT(*) as qtd
          FROM ${modelConfig.get('LOG')}
          WHERE secao = 'PESQUISA' AND item = 'PESSOA' AND chave = 'CPF'
              ${filtro_duracao}
          GROUP BY valor
          ORDER BY qtd DESC
      )

      SELECT C.CPF as cpf, PF.Nome as nome, C.QTD as qtd
      FROM CPFS_MAIS_PESQUISADOS C
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (C.CPF = PF.CPF)
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos CPFs mais usados.`, 'getCPFsMaisPesquisados_Pesquisa');
    });
};

export const getCNPJsMaisPesquisados_Pesquisa = function(duracao: string, top = '100') {
  let filtro_duracao = '';
  if (duracao) {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())`;
  }

  return db.query([
    ],`
      ;WITH CNPJS_MAIS_PESQUISADOS(CNPJ, QTD)
      AS
      (
          SELECT TOP ${top} valor, COUNT(*) as qtd
          FROM ${modelConfig.get('LOG')}
          WHERE secao = 'PESQUISA' AND item = 'EMPRESA' AND chave = 'CNPJ'
              ${filtro_duracao}
          GROUP BY valor
          ORDER BY qtd DESC
      )

      SELECT C.CNPJ as cnpj, PJ.NomeFantasia as nomeFantasia, PJ.RazaoSocial as razaoSocial, C.QTD as qtd
      FROM CNPJS_MAIS_PESQUISADOS C
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (C.CNPJ = PJ.CNPJ)
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos CNPJs mais usados.`, 'getCNPJsMaisPesquisados_Pesquisa');
    });
};

export const getValoresMaisPesquisados_Pesquisa = function(duracao: string, top = '100', multiusuario: string = null) {
  let filtro_duracao = '';
  let filtro_multiusuario = '';

  if (duracao) {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())`;
  }
  if (multiusuario) {
    filtro_multiusuario = `HAVING COUNT(DISTINCT usuario) > 1`;
  }

  return db.query([
    ],`
      SELECT TOP ${top} chave, UPPER(valor) as valor, COUNT(*) as qtd
      FROM ${modelConfig.get('LOG')}
      WHERE secao = 'PESQUISA'
          ${filtro_duracao}
      GROUP BY chave, valor
          ${filtro_multiusuario}
      ORDER BY qtd DESC
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos valores mais usados.`, 'getValoresMaisPesquisados_Pesquisa');
    });
};

export const getUsuariosQuePesquisaram_Pesquisa = function(duracao: string, dados = null) {
  let filtro_duracao = '';
  if (duracao) {
    filtro_duracao = `AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())`;
  }

  return db.query([
    ['CHAVE', ISql.NVarChar, dados.chave],
    ['VALOR', ISql.NVarChar, dados.valor],
    ],`
      SELECT usuario, COUNT(*) as qtd
      FROM ${modelConfig.get('LOG')}
      WHERE secao = 'PESQUISA' AND chave = @CHAVE AND valor = @VALOR
          ${filtro_duracao}
      GROUP BY usuario
      ORDER BY qtd DESC
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos valores mais usados.`, 'getValoresMaisPesquisados_Pesquisa');
    });
};

export const getQuantidadePesquisas = function(duracao: string) {
  const duracaoToken = API_CONFIG.JWT_TOKEN_TEMPO_EXPIRACAO;
  return db.query([
    ],`
      SELECT
          DATEFROMPARTS ( YEAR(data_hora),  MONTH(data_hora), DAY(data_hora) ) as data,
          count(*) as qtd

      FROM ${modelConfig.get('LOG')}
      WHERE secao='PESQUISA' AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())
      GROUP BY YEAR(data_hora), MONTH(data_hora), DAY(data_hora)
      ORDER BY YEAR(data_hora) desc, MONTH(data_hora) desc, DAY(data_hora) desc
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pela quantidade de pesquisas.`, 'getQuantidadePesquisas');
    });
};

export const getQuantidadeLogins = function(duracao: string) {
  const duracaoToken = API_CONFIG.JWT_TOKEN_TEMPO_EXPIRACAO;
  return db.query([
    ],`
      SELECT
          DATEFROMPARTS ( YEAR(data_hora),  MONTH(data_hora), DAY(data_hora) ) as data,
          count(*) as qtd

      FROM ${modelConfig.get('LOG')}
      WHERE secao='SISTEMA' AND tipo IN ('LOGIN', 'TENTATIVA DE LOGIN', 'LOGIN EXTERNO')
          AND data_hora >= DATEADD(Day, -${duracao}, GETDATE())
      GROUP BY YEAR(data_hora), MONTH(data_hora), DAY(data_hora)
      ORDER BY YEAR(data_hora) desc, MONTH(data_hora) desc, DAY(data_hora) desc
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pela quantidade de logins.`, 'getQuantidadeLogins');
    });
};

export const getCPFsNaoEncontrados = function() {
  return db.query([
    ],`
      ;WITH CPFS_NAO_ENCONTRADOS(CPF)
      AS
      (
          SELECT valor
          FROM ${modelConfig.get('LOG')}
          WHERE secao = 'PESQUISA' AND item = 'PESSOA' AND chave = 'CPF' AND code = 'ENOTFOUND'
      )
      , EXISTE_NA_BASE(CPF)
      AS
      (
          SELECT C.CPF as cpf
          FROM CPFS_NAO_ENCONTRADOS C
              INNER JOIN ${modelReceita.get('PF')} PF ON (C.CPF = PF.CPF)
      )
      , RESULTADO(CPF)
      AS
      (
          SELECT CPF as cpf
          FROM CPFS_NAO_ENCONTRADOS

          EXCEPT

          SELECT CPF as cpf
          FROM EXISTE_NA_BASE
      )

      SELECT CPF as cpf, 'cpf' as tipo
      FROM RESULTADO
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos cpfs inexistentes.`, 'getCPFsNaoEncontrados');
    });
};

export const getCNPJsNaoEncontrados = function() {
  return db.query([
    ],`
      ;WITH CNPJS_NAO_ENCONTRADOS(CNPJ)
      AS
      (
          SELECT valor
          FROM ${modelConfig.get('LOG')}
          WHERE secao = 'PESQUISA' AND item = 'EMPRESA' AND chave = 'CNPJ' AND code = 'ENOTFOUND'
      )

      SELECT C.CNPJ as cnpj, 'cnpj' as tipo
      FROM CNPJS_NAO_ENCONTRADOS C
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (C.CNPJ = PJ.CNPJ)
      WHERE PJ.CNPJ IS NULL
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos cnpjs inexistentes.`, 'getCNPJsNaoEncontrados');
    });
};

export const getLogsPorUsuario = function(usuario: string, top: string = '200') {

  return db.query([
    ['USUARIO', ISql.VarChar, usuario]
  ],`
    SELECT TOP ${top}
      usuario, ip, secao, item, chave, UPPER(valor) as valor, UPPER(mensagem) as mensagem, processo, user_agent, os, data_hora
    FROM
      ${modelConfig.get('LOG')}
    WHERE
      usuario = @USUARIO
    ORDER BY data_hora DESC
  `)
  .then(result => {
    return resultFound(result, fonte, rank, grupo)
  })
  .catch(error => {
    return logErroBuscaBD(error, `Falha na busca pelos logs de acesso do usuário ${usuario}`, 'getLogsPorUsuario');
  });
}

//https://www.robtex.com/api/
//https://freeapi.robtex.com/ipquery/186.215.248.218
//http://ipinfo.io/186.215.248.218

//https://github.com/IonicaBizau/node-ipinfo
//https://github.com/bluesmoon/node-geoip
