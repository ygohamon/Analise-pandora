import { db, ISql } from './../../services/db.service';
import { NovoUsuario } from './../schemas';

import { MODEL_PRIORITY, API_CODES, API_MSGS } from './../../config';
import {
  resultNotFound,
  resultFound,
  logErroBuscaBD,
  criaRespostaAPI,
  printTempoExecucao,
  md5,
  promisify
} from './../../utils';

import { BenchmarkService } from '../../services/benchmark.service';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PANDORA');

const fonte = MODEL_PRIORITY['sispesquisa.usuario'].fonte;
const rank = MODEL_PRIORITY['sispesquisa.usuario'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.usuario'].grupo;

export enum statusUsuario {
  VALIDO,
  INEXISTENTE,
  INATIVO,
}

/**
 * Verifica o status do login do usuário.
 *
 * Retorna se o usuário é inexistente, inativo ou está válido.
 * @param login
 */
export const checaStatusLogin_BD_Pandora = function(login: string) {
  return db.query([
    ['LOGIN', ISql.VarChar, login],
  ],
    `
      SELECT TOP 1 *
      FROM ${modelConfig.get('USUARIO')}
      WHERE login=@LOGIN
    `)
    .then(result => {
      // Usuario inexistente
      if (!result.length) {
        throw criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, API_MSGS.MSG_LOGIN_USUARIO_INEXISTENTE);
      }

      const usuarioEncontrado = new NovoUsuario(result[0]);

      // Usuario inativo
      if (!usuarioEncontrado.estaAtivo()) {
        throw criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, API_MSGS.MSG_LOGIN_USUARIO_INATIVO);
      }

      // Usuário válido e existente
      return criaRespostaAPI(API_CODES.CODE_SUCESSO, null, usuarioEncontrado);
    });
};

/**
 * Verifica se o login e senha do usuário correspondem com os dados
 * cadastrados no banco de dados.
 *
 * @param usuario
 */
export const autenticaUsuario_BD_Pandora = function(usuario: NovoUsuario) {
  const tempoInicial = new BenchmarkService();

  return db.query([
    ['LOGIN', ISql.VarChar, usuario.login],
    ['SENHA_MD5', ISql.VarChar, md5(usuario.senha)],
    ['SENHA_CLARO', ISql.VarChar, usuario.senha],
    ],`
      SELECT id
      FROM ${modelConfig.get('USUARIO')}
      WHERE login=@LOGIN AND ( senha=@SENHA_MD5 OR RIGHT(senha, 64) = CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', LEFT(senha, 64) + @SENHA_CLARO), 2))
    `)
    .then(result => {
      printTempoExecucao(tempoInicial, 'autenticaUsuario_BD_Pandora');

      if (!result.length) {
        throw criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, API_MSGS.MSG_FALHA_LOGIN);
      } else {
        return criaRespostaAPI(API_CODES.CODE_SUCESSO, API_MSGS.MSG_LOGIN_SUCESSO);
      }
    });
};

export const getUsuariosById = function(ids: string[]) {
  if (!ids.length) {return promisify([])}

  const ids_str = ids.join(',');
  return db.query([],
    `
      SELECT id, login
      FROM ${modelConfig.get('USUARIO')}
      WHERE id in (${ids_str})
    `)
}

export const getUsuarios = function(termoBusca: string = null) {

  const buscaParcial = (termoBusca) ? `WHERE U.login LIKE '${termoBusca}%' OR PU.nome LIKE '${termoBusca}%'` : '';

  return db.query([
    ],`
      SELECT
          U.id, PU.nome, U.login, email, ativo, acesso as acesso, P.descricao as perfil, G.grupos,
          proximo_logon as proximoLogon, necessita_processo as necessitaProcesso, recadastramento,
          UC.login as cadastrador, data_criacao as dataCriacao, U.data_atualizacao as dataAtualizacao,
          lotacao, titularidade, PU.cpf

      FROM ${modelConfig.get('USUARIO')} U
        LEFT OUTER JOIN ${modelConfig.get('PESSOA')} PU ON (U.id_pessoa = PU.id)
        INNER JOIN ${modelConfig.get('PERFIL')} P ON (U.id_perfil = P.id)
        OUTER APPLY (
            SELECT login
            FROM ${modelConfig.get('USUARIO')}
            WHERE id = U.id_usuario_ativador
        ) UC
        OUTER APPLY (
            SELECT STRING_AGG(_G.descricao, '|') as grupos
            FROM ${modelConfig.get('USUARIO')} _U
                INNER JOIN ${modelConfig.get('USUARIO_GRUPO')} _UG ON (_UG.id_usuario = _U.id)
                INNER JOIN ${modelConfig.get('GRUPO')} _G ON (_UG.id_grupo = _G.id)
            WHERE _U.login = U.login
        ) AS G
      ${buscaParcial}
    `)
    .then(result => {
      if (!result.length) return resultNotFound(`Nao foi possivel encontrar usuarios.`, fonte);
      else return resultFound(result, fonte, rank, grupo);
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelos usuarios.`, 'getUsuarios');
    });
};

export const getUsuariosAtivosMailer = function() {
  return db.query([
  ],`
    SELECT
        U.login, PU.email, PU.nome
    FROM ${modelConfig.get('USUARIO')} U
      INNER JOIN ${modelConfig.get('PESSOA')} PU ON (U.id_pessoa = PU.id)
      WHERE U.ativo = 1 AND PU.email IS NOT NULL
  `)
  .then(result => {
    if (!result.length) return resultNotFound(`Nao foi possivel encontrar usuarios.`, fonte);
    else return resultFound(result, fonte, rank, grupo);
  })
  .catch(error => {
    return logErroBuscaBD(error, `Falha na busca pelos usuarios.`, 'getUsuariosAtivosMailer');
  });
};

export const getUsuarioID_BD_Pandora = function(login: string, id: number = null) {
  return db.query([
    ['LOGIN', ISql.VarChar, login],
    ['ID', ISql.Int, id],
    ],`
      SELECT
          U.id, P.descricao as perfil, ativo, acesso, login, PU.email,
          CASE
              WHEN PU.nome IS NULL THEN U.login
              ELSE PU.nome
          END as nome, G.grupos

      FROM ${modelConfig.get('USUARIO')} U
          INNER JOIN ${modelConfig.get('PERFIL')} P ON (U.id_perfil = P.id)
          LEFT OUTER JOIN ${modelConfig.get('PESSOA')} PU ON (PU.id = U.id_pessoa)
          OUTER APPLY (
              SELECT STRING_AGG(_G.descricao, '|') as grupos
              FROM ${modelConfig.get('USUARIO')} _U
                  INNER JOIN ${modelConfig.get('USUARIO_GRUPO')} _UG ON (_UG.id_usuario = _U.id)
                  INNER JOIN ${modelConfig.get('GRUPO')} _G ON (_UG.id_grupo = _G.id)
              WHERE _U.login = U.login
          ) AS G

      WHERE U.id=@ID OR U.login = @LOGIN
    `)
    .then((result: any) => {
      if (!result.length) {
        return resultNotFound(`Nao foi possivel encontrar usuarios.`, fonte);
      } else {
        result = result.map(d => {
          if (!d.grupos) {
            d.grupos = [];
          } else {
            d.grupos = d.grupos.split('|');
          }
          return d;
        });
        return resultFound(result, fonte, rank, grupo);
      }
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelo usuário ${id}.`, 'getUsuarioID_BD_Pandora');
    });
};

export const getUsuario_BD_Pandora = function(login: string) {
  const tempoInicial = new BenchmarkService();

  return db.query([
    ['LOGIN', ISql.VarChar, login],
    ],`
      SELECT
          U.id, id_pessoa, id_usuario_ativador as idAtivador,
          P.descricao as perfil, ativo, acesso, login, recadastramento,
          proximo_logon as proximoLogon, necessita_processo as necessitaProcesso,
          data_criacao as dataCriacao, data_atualizacao as dataAtualizacao

      FROM ${modelConfig.get('USUARIO')} U
          INNER JOIN ${modelConfig.get('PERFIL')} P ON (U.id_perfil = P.id)
      WHERE U.login = @LOGIN
    `)
    .then(result => {
      printTempoExecucao(tempoInicial, 'getUsuario_BD_Pandora');

      if (!result.length) {
        throw resultNotFound(`Nao foi possivel encontrar usuarios.`, fonte);
      } else {
        return new NovoUsuario(result[0]);
      }
    });
};

export const getPermissoesUsuario_BD_Pandora = function(login: string, id: number = null) {

  return db.query([
    ['LOGIN', ISql.VarChar, login],
    ['ID', ISql.Int, id],
    ],`
      SELECT S.id as id_secao, S.descricao as secao, I.id as id_item, I.descricao as item
      FROM ${modelConfig.get('PERFIL')} P
          INNER JOIN ${modelConfig.get('PERFIL_ITEM')} PI ON (P.id = PI.id_perfil)
          INNER JOIN ${modelConfig.get('ITEM')} I ON (PI.id_item = I.id)
          INNER JOIN ${modelConfig.get('SECAO')} S ON (I.id_secao = S.id)
      OUTER APPLY(
          SELECT P.descricao
          FROM ${modelConfig.get('USUARIO')} U
              INNER JOIN ${modelConfig.get('PERFIL')} P ON (U.id_perfil = P.id)
          WHERE U.login = @LOGIN OR U.id = @ID
      ) U
      WHERE P.descricao = U.descricao

      UNION

      SELECT S.id as id_secao, S.descricao as secao, I.id as id_item, I.descricao as item
      FROM ${modelConfig.get('USUARIO')} U
          INNER JOIN ${modelConfig.get('USUARIO_ITEM')} UI ON (U.id = UI.id_usuario)
          INNER JOIN ${modelConfig.get('ITEM')} I ON (UI.id_item = I.id)
          INNER JOIN ${modelConfig.get('SECAO')} S ON (I.id_secao = S.id)
      WHERE U.login = @LOGIN OR U.id = @ID
    `)
};

export const getListaPermissoesUsuario_BD_Pandora = function() {
  const tempoInicial = new BenchmarkService();

  return db.query([
    ],`
      SELECT S.descricao as secao, I.descricao as item
      FROM ${modelConfig.get('PERFIL')} P
          INNER JOIN ${modelConfig.get('PERFIL_ITEM')} PI ON (P.id = PI.id_perfil)
          INNER JOIN ${modelConfig.get('ITEM')} I ON (PI.id_item = I.id)
          INNER JOIN ${modelConfig.get('SECAO')} S ON (I.id_secao = S.id)
      OUTER APPLY(
          SELECT P.descricao
          FROM ${modelConfig.get('USUARIO')} U
              INNER JOIN ${modelConfig.get('PERFIL')} P ON (U.id_perfil = P.id)
      ) U

      UNION

      SELECT S.descricao as secao, I.descricao as item
      FROM ${modelConfig.get('USUARIO')} U
          INNER JOIN ${modelConfig.get('USUARIO_ITEM')} UI ON (U.id = UI.id_usuario)
          INNER JOIN ${modelConfig.get('ITEM')} I ON (UI.id_item = I.id)
          INNER JOIN ${modelConfig.get('SECAO')} S ON (I.id_secao = S.id)
    `)
    .then(result => {
      printTempoExecucao(tempoInicial, 'getPermissoesUsuario_BD_Pandora');

      if (!result.length) {
        throw resultNotFound(`Nao foi possivel encontrar permissoes para o usuário.`, fonte);
      } else {
        return result;
      }
    });
};

export const cadastraUsuario_BD_Pandora = function(usuario: NovoUsuario, ativo = 1) {
  return db.query([
    ['ID_PESSOA', ISql.Int, usuario.pessoa.id],
    ['ID_USUARIO_ATIVADOR', ISql.Int, usuario.idAtivador],
    ['LOGIN', ISql.VarChar, usuario.login],
    ['SENHA', ISql.VarChar, usuario.senha],
    ['ATIVO', ISql.Bit, ativo],
    ['ACESSO', ISql.VarChar, usuario.acesso],
    ['DESCRICAO_PERFIL', ISql.VarChar, usuario.perfil],
    ['PROXIMO_LOGON', ISql.Bit, usuario.proximoLogon],
    ['NECESSITA_PROCESSO', ISql.Bit, usuario.necessitaProcesso],
    ['RECADASTRAMENTO', ISql.Bit, 0],
    ],`
      INSERT INTO ${modelConfig.get('USUARIO')}
      (
          id_pessoa, id_usuario_ativador, id_perfil, ativo, acesso,
          login, senha, proximo_logon, necessita_processo, recadastramento
      )
      SELECT
          @ID_PESSOA, @ID_USUARIO_ATIVADOR, P.ID, @ATIVO, @ACESSO,
          @LOGIN, @SENHA, @PROXIMO_LOGON, @NECESSITA_PROCESSO, @RECADASTRAMENTO

      FROM ${modelConfig.get('PERFIL')} P
      WHERE descricao=@DESCRICAO_PERFIL
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário cadastrado com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha no cadastro do usuario.`, 'cadastraUsuario_BD_Pandora');
    });
};

export const ativaUsuario_BD_Pandora = function(idUsuario) {
  return db.query([
    ['ID', ISql.Int, idUsuario],
    ],`
      UPDATE ${modelConfig.get('USUARIO')}
      SET ativo = 1
      WHERE id = @ID
    `)
    .then(result => true)
    .catch(error => false);
};

export const desativaUsuario_BD_Pandora = function(idUsuario: number) {
  return db.query([
    ['ID', ISql.Int, idUsuario],
    ],`
            UPDATE ${modelConfig.get('USUARIO')}
            SET ativo = 0
            WHERE id = @ID
        `)
    .then(result => true)
    .catch(error => false);
};

export const desativaRecadastramentoUsuario_BD_Pandora = function(idUsuario: number) {
  return db.query([
    ['ID', ISql.Int, idUsuario],
    ],`
      UPDATE ${modelConfig.get('USUARIO')}
      SET recadastramento = 0
      WHERE id = @ID
    `)
    .then(result => true)
    .catch(error => false);
};

export const ativaRecadastramentoUsuario_BD_Pandora = function(idUsuario: number) {
  return db.query([
    ['ID', ISql.Int, idUsuario],
    ],`
      UPDATE ${modelConfig.get('USUARIO')}
      SET recadastramento = 1
      WHERE id = @ID
    `)
    .then(result => true)
    .catch(error => false);
};

export const removeUsuarioLogin_BD_Pandora = function(login: string) {
  return db.query([
    ['LOGIN', ISql.VarChar, login],
    ],`
      DELETE
      FROM ${modelConfig.get('USUARIO')}
      WHERE login = @LOGIN
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário removido com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na remocao do usuario ${login}.`, 'removeUsuarioLogin_BD_Pandora');
    });
};

export const updateUsuario_BD_Pandora = function(usuario: NovoUsuario) {
  return db.query([
    ['ID', ISql.Int, usuario.id],
    ['LOGIN', ISql.VarChar, usuario.login],
    ['ATIVO', ISql.Bit, usuario.ativo],
    ['ACESSO', ISql.VarChar, usuario.acesso],
    ['PERFIL', ISql.VarChar, usuario.perfil],
    ['RECADASTRAMENTO', ISql.Bit, usuario.recadastramento],
    ['PROXIMO_LOGON', ISql.Bit, usuario.proximoLogon],
    ['NECESSITA_PROCESSO', ISql.Bit, usuario.necessitaProcesso],
    ],`
        UPDATE ${modelConfig.get('USUARIO')}
        SET
            login=@LOGIN,
            ativo=@ATIVO,
            acesso=@ACESSO,
            id_perfil=P.id,
            recadastramento=@RECADASTRAMENTO,
            proximo_logon=@PROXIMO_LOGON,
            necessita_processo=@NECESSITA_PROCESSO

        FROM (
            SELECT id FROM ${modelConfig.get('PERFIL')} P WHERE P.descricao = @PERFIL
        ) P
        WHERE usuario.id=@ID
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário atualizado com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na atualização do usuario.`, 'updateUsuario_BD_Pandora');
    });
};

export const updateSenhaUsuario_BD_Pandora = function(id, senhanova) {
  return db.query([
    ['ID', ISql.Int, id],
    ['SENHA', ISql.VarChar, NovoUsuario.hashSenha(senhanova)],
    ['PROXIMO_LOGON', ISql.Bit, false],
    ],`
        UPDATE ${modelConfig.get('USUARIO')}
        SET
            senha=@SENHA,
            proximo_logon=@PROXIMO_LOGON
        WHERE id=@ID
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário atualizado com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na atualização do usuario.`, 'updateSenhaUsuario_BD_Pandora');
    });
};

export const deleteUsuario_BD_Pandora = function(id: number) {
  return db.query([
    ['ID', ISql.Int, id],
    ],`
      DELETE FROM ${modelConfig.get('USUARIO')}
      WHERE id=@ID
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário removido com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na remocao do usuario.`, 'deleteUsuario_BD_Pandora');
    });
};

/**
 * Atualiza a senha do usuário e força a mudança da senha(pelo próprio usuário) no próximo login.
 *
 * @param id
 * @param novaSenha
 */
export const updateSenhaUsuarioReset_BD_Pandora = function(id, novaSenha) {
  return db.query([
    ['ID', ISql.Int, id],
    ['SENHA', ISql.VarChar, NovoUsuario.hashSenha(novaSenha)],
    ['PROXIMO_LOGON', ISql.Bit, true],
    ],`
      UPDATE ${modelConfig.get('USUARIO')}
      SET
          senha=@SENHA,
          proximo_logon=@PROXIMO_LOGON
      WHERE id=@ID
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: `Senha redefinida com sucesso! Nova senha: <b>${novaSenha}</b>`,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha ao tentar redefinir a senha do usuário.`, 'updateSenhaUsuarioReset_BD_Pandora');
    });
};

export const atualizaPermissoesUsuario_BD_Pandora = function(id: number, permissoes) {
  return db.query([
    ['ID', ISql.Int, id],
    ['LISTAPERMISSOES', ISql.VarChar, permissoes],
    ],`
      ;WITH DESCRICOES(SECAO, ITEM)
      AS
      (
          SELECT SUBSTRING(VALUE, 0, CHARINDEX(',', VALUE) ), SUBSTRING(VALUE, CHARINDEX(',', VALUE)+1, LEN(VALUE) )
          FROM STRING_SPLIT(@LISTAPERMISSOES,'|')
      )
      ,PERMISSOES(ID_USUARIO, ID_ITEM)
      AS
      (
          SELECT @ID, I.id
          FROM DESCRICOES D
              INNER JOIN ${modelConfig.get('ITEM')} I ON (I.descricao = D.ITEM)
      )

      MERGE ${modelConfig.get('USUARIO_ITEM')} AS UI
      USING
          (SELECT ID_ITEM, ID_USUARIO FROM PERMISSOES) AS SOURCE(ID_ITEM, ID_USUARIO)
          ON (UI.id_usuario = SOURCE.ID_USUARIO AND UI.id_item = SOURCE.ID_ITEM)
      WHEN NOT MATCHED BY SOURCE AND UI.id_usuario = @ID THEN
          DELETE
      WHEN NOT MATCHED BY TARGET THEN
          INSERT(ID_ITEM,ID_USUARIO)
          VALUES(ID_ITEM,ID_USUARIO);
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Controle de acesso atualizado com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelas atualização das permissoes de ${id}.`, 'atualizaPermissoesUsuario_BD_Pandora');
    });
};

export const getListaPerfisUsuario_BD_Pandora = function() {
  return db.query([
    ],`
      SELECT descricao as perfil
      FROM ${modelConfig.get('PERFIL')}
    `)
};

export const getListaAcessosUsuario_BD_Pandora = function() {
  return db.query([
    ],`
      SELECT DISTINCT acesso
      FROM ${modelConfig.get('USUARIO')}
    `)
};

export const getListaGruposUsuario_BD_Pandora = function() {
  return db.query([
    ],`
      SELECT DISTINCT descricao as grupo
      FROM ${modelConfig.get('GRUPO')}
    `)
};

export let getCPFUsuario_BD_Pandora = function (idUsuario: number) {

  return db.query([
    ['ID', ISql.Int, idUsuario]
  ], `
    SELECT
      p.cpf
    FROM
      ${modelConfig.get('PESSOA')} AS p
    INNER JOIN ${modelConfig.get('USUARIO')} AS u ON (p.id = u.id_pessoa)
    WHERE u.id = @ID;
  `)
  .then((result: any) => {
    result = result.map(d => {
      return d;
    });
    return resultFound(result, fonte, rank, grupo);
  });
}
