
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CODES } from './../../config';
import { PessoaUsuario } from '../schemas';
import { getModelConfig } from '../../config.models';

import {
    resultNotFound,
    resultFound,
    logErroBuscaBD,
    print,
} from './../../utils';

const modelConfig = getModelConfig('BD_PANDORA');

const fonte = MODEL_PRIORITY['bd_pandora.pessoa_usuario'].fonte;
const rank  = MODEL_PRIORITY['bd_pandora.pessoa_usuario'].rank;
const grupo = MODEL_PRIORITY['bd_pandora.pessoa_usuario'].grupo;

export let getPessoaUsuario = function(id: number){

  return db.query([
    ['ID', ISql.Int, id],
    ],`
      SELECT
          id, nome, cpf, identidade, org_emissor as orgEmissor, uf_org_emissor as ufOrgEmissor,
          matricula, titularidade, lotacao, email, telefone, data_cadastro as dataCadastro, ativado

      FROM ${modelConfig.get('PESSOA')}
      WHERE id = @ID
    `)
    .then(result => (!result.length) ? null : new PessoaUsuario(result[0]))
};

export let getPessoaUsuariosInativos_BD_Pandora = function (){

  return db.query([
    ],`
      SELECT
          P.id, nome, cpf, identidade, org_emissor as orgEmissor, uf_org_emissor as ufOrgEmissor,
          matricula, titularidade, lotacao, email, telefone, data_cadastro as dataCadastro,
          P.data_atualizacao as dataAtualizacao, ativado,
          CASE
              WHEN ( P.ativado = 0 AND U.id IS NULL) THEN 'cadastro'
              WHEN ( P.ativado = 0 AND U.ativo = 0 AND U.recadastramento = 0) THEN 'recadastro'
              ELSE NULL
          END as origem,
          U.login, U.acesso, PE.descricao as perfil

      FROM ${modelConfig.get('PESSOA')} P
          LEFT OUTER JOIN ${modelConfig.get('USUARIO')} U ON (U.id_pessoa = P.id)
          LEFT OUTER JOIN ${modelConfig.get('PERFIL')} PE ON (U.id_perfil = PE.id)
      WHERE ( P.ativado = 0 AND U.id IS NULL) OR ( P.ativado = 0 AND U.ativo = 0 AND U.recadastramento = 0)
      ORDER BY data_cadastro
    `)
    .then(result => {
      if(!result.length)
        return resultNotFound(`Nao foi possivel encontrar pre usuarios.`, fonte);
      else
        return resultFound(result, fonte, rank, grupo);
    })
};

export let cadastraPessoaUsuario_BD_Pandora = function (pessoa: PessoaUsuario, ativado: number = 0){

  return db.query([
    ['NOME',  ISql.VarChar, pessoa.nome],
    ['CPF', ISql.VarChar, pessoa.cpf],
    ['IDENTIDADE', ISql.VarChar, pessoa.identidade],
    ['ORGEMISSOR', ISql.VarChar, pessoa.orgEmissor],
    ['UFORGEMISSOR', ISql.VarChar, pessoa.ufOrgEmissor],
    ['MATRICULA', ISql.VarChar, pessoa.matricula],
    ['TITULARIDADE', ISql.VarChar, pessoa.titularidade],
    ['LOTACAO', ISql.VarChar, pessoa.lotacao],
    ['EMAIL', ISql.VarChar, pessoa.email],
    ['TELEFONE', ISql.VarChar, pessoa.telefone],
    ['ATIVADO', ISql.Bit, ativado],
    ],`
      INSERT INTO ${modelConfig.get('PESSOA')}
      (
          nome, cpf, identidade, org_emissor, uf_org_emissor,
          matricula, titularidade, lotacao, email, telefone, ativado
      )
      VALUES
      (
          @NOME, @CPF, @IDENTIDADE, @ORGEMISSOR, @UFORGEMISSOR,
          @MATRICULA, @TITULARIDADE, @LOTACAO, @EMAIL, @TELEFONE, @ATIVADO
      )
    `)
}

export let recadastraPessoaUsuario_BD_Pandora = function (pessoa: PessoaUsuario, idPessoaUsuario: number){

  return db.query([
    ['ID', ISql.Int, idPessoaUsuario],
    ['NOME',  ISql.VarChar, pessoa.nome],
    ['CPF', ISql.VarChar, pessoa.cpf],
    ['IDENTIDADE', ISql.VarChar, pessoa.identidade],
    ['ORGEMISSOR', ISql.VarChar, pessoa.orgEmissor],
    ['UFORGEMISSOR', ISql.VarChar, pessoa.ufOrgEmissor],
    ['MATRICULA', ISql.VarChar, pessoa.matricula],
    ['TITULARIDADE', ISql.VarChar, pessoa.titularidade],
    ['LOTACAO', ISql.VarChar, pessoa.lotacao],
    ['EMAIL', ISql.VarChar, pessoa.email],
    ['TELEFONE', ISql.VarChar, pessoa.telefone],
    ['ATIVADO', ISql.Bit, false],
    ],`
      UPDATE ${modelConfig.get('PESSOA')}
      SET
          nome = @NOME,
          cpf = @CPF,
          identidade = @IDENTIDADE,
          org_emissor = @ORGEMISSOR,
          uf_org_emissor = @UFORGEMISSOR,
          matricula = @MATRICULA,
          titularidade = @TITULARIDADE,
          lotacao = @LOTACAO,
          email = @EMAIL,
          telefone = @TELEFONE,
          ativado = @ATIVADO

      WHERE id = @ID
    `)
    .then(resultado => print(resultado, 'recadastraPessoaUsuario_BD_Pandora'))
    // .then(result => { if (result.rowsAffected[0] === 1){ return true; } else{throw false; }})
}

/**
 * Retorna o id_pessoa do usuário.
 *
 * @param id
 */
export let getIDPessoaPessoaUsuario_BD_Pandora = function (idUsuario: number){

  return db.query([
    ['ID', ISql.Int, idUsuario],
    ],`
        SELECT id_pessoa
        FROM ${modelConfig.get('USUARIO')}
        WHERE id=@ID
    `)
    .then(result => result.map(d => d.id_pessoa)[0])
}

export let checaCPFEmailExistentePessoaUsuario_BD_Pandora = function (pessoa: PessoaUsuario){

  return db.query([
    ['CPF', ISql.VarChar, pessoa.cpf],
    ['EMAIL', ISql.VarChar, pessoa.email],
    ],`
        SELECT TOP 1 1
        FROM ${modelConfig.get('PESSOA')}
        WHERE cpf=@CPF OR email=@EMAIL
    `)
    .then(result => !!result.length)
}

export let deletePessoaUsuario_BD_Pandora = function (id: string){

  return db.query([
    ['ID', ISql.VarChar, id],
    ],`
        DELETE FROM ${modelConfig.get('PESSOA')}
        WHERE id=@ID
    `)
  .then(result => {
    return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário deletado com sucesso.'
    }
  })

}

export let ativaRecadastramentoPreUsuario_BD_Pandora = function (id: string){

  return db.query([
    ['ID', ISql.VarChar, id],
    ],`
        UPDATE ${modelConfig.get('USUARIO')}
        SET
            ativo = 1,
            recadastramento = 1
        FROM ${modelConfig.get('USUARIO')} U
            INNER JOIN ${modelConfig.get('PESSOA')} P ON (U.id_pessoa = P.id)
        WHERE P.id=@ID
    `)
  .then(result => {
    return {
      status: API_CODES.CODE_SUCESSO,
      msg: 'Usuário ativado para recadastramento com sucesso.'
    }
})
}

export let ativarPessoaUsuario_BD_Pandora = function(pessoa: PessoaUsuario){

  return db.query([
    ['ID', ISql.Int, pessoa.id],
    ],`
      UPDATE ${modelConfig.get('PESSOA')}

      SET ativado=1
      WHERE id=@ID
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Usuário ativado com sucesso.'
      }
    });
}

export let desativarPessoaUsuario_BD_Pandora = function(pessoa: PessoaUsuario){

  return db.query([
    ['ID', ISql.Int, pessoa.id],
    ],`
      UPDATE ${modelConfig.get('PESSOA')}

      SET ativado=0
      WHERE id=@ID
    `)
    .then(result => {
      return {
          status: API_CODES.CODE_SUCESSO,
          msg: 'Usuário desativado com sucesso.'
      }
    }).catch( error => logErroBuscaBD(error, `Falha na desativação do usuario.`, 'desativarPessoaUsuario_BD_Pandora'));
}

export let getUsuarioIDPessoaUsuario_BD_Pandora = function(pessoa: PessoaUsuario){

  return db.query([
    ['P_ID', ISql.Int, pessoa.id],
    ],`
      SELECT U.id
      FROM ${modelConfig.get('USUARIO')} U
          INNER JOIN ${modelConfig.get('PESSOA')} P ON (U.id_pessoa = P.id)
      WHERE P.id = @P_ID
    `)
    .then(result => result.map(d => d.id).shift())
}
