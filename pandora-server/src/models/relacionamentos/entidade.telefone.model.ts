import { db, ISql } from '../../services/db.service';
import { getModelConfig } from '../../config.models';

import {
  modelFactory as mf,
  trataResultado,
  getNomeFuncao,
} from '../../utils';

const modelConfig = getModelConfig('BD_TELEFONE');
const modelReceita = getModelConfig('BD_RECEITA');
const modelTSE = getModelConfig('BD_TSE');

/**
 * Retorna as entidades 'Pessoa' que possuem esse telefone.
 * @param cpf
 * @param tipobusca
 */
export let getNodesPessoasTelefone = function (listaTelefone: Array<string>, tipobusca: string = 'completa'){

  if (tipobusca !== 'parentesco' && tipobusca !== 'completa') { return []; }
  if (listaTelefone.length === 0) { return []; }

  const lista = "'" + listaTelefone.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH PESSOAS_COMUNS(cpf)
        AS
        (
          SELECT DISTINCT cpf_cnpj
          FROM ${modelConfig.get('TELEFONE')}
          WHERE telefone IN (${lista}) AND LEN(cpf_cnpj) = 11
        )
        ,PESSOAS(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT PF.CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
          FROM ${modelReceita.get('PF')} PF
              INNER JOIN PESSOAS_COMUNS P ON (PF.CPF = P.CPF)
        )
        ,DADOS_COM_PAI(CPF, NOME, NomeMae, NomePai, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT P.CPF, P.NOME, P.NomeMae, E.NOM_PAI, P.DataNascimento, P.Sexo, P.Municipio, P.UF
          FROM PESSOAS P
            LEFT OUTER JOIN ${modelTSE.get('ELEITOR')} E ON (P.CPF = E.NUM_CPF)
        )

        SELECT CPF as id, 'pessoa' as entidade, CPF as cpf, NOME as nome, NomeMae as nomeMae, NomePai as nomePai, DataNascimento as dataNascimento, Sexo as sexo, Municipio as municipio, UF as uf
        FROM DADOS_COM_PAI
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesPessoasTelefone = function (listaTelefone: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'parentesco' && tipobusca !== 'completa') { return []; }
  if (listaTelefone.length === 0) { return []; }

  const lista = "'" + listaTelefone.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH PESSOAS(cpf, TELEFONE)
        AS
        (
            SELECT DISTINCT cpf_cnpj, telefone
            FROM ${modelConfig.get('TELEFONE')}
            WHERE telefone IN (${lista}) AND LEN(cpf_cnpj) = 11
        )

        SELECT telefone as origem, 'propriedade' as relacao, cpf as destino
        FROM PESSOAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

/**
 * Retorna as entidades 'Empresa' que possuem esse telefone.
 * @param cpf
 * @param tipobusca
 */
export let getNodesEmpresasTelefone = function (listaTelefone: string[], tipobusca: string = 'completa'){

  if (tipobusca !== 'parentesco' && tipobusca !== 'completa') { return []; }
  if (listaTelefone.length === 0) { return []; }

  const lista = "'" + listaTelefone.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_TELEFONE(cnpj)
        AS
        (
          SELECT DISTINCT cpf_cnpj
          FROM ${modelConfig.get('TELEFONE')}
          WHERE telefone IN (${lista}) AND LEN(cpf_cnpj) = 14
        )
        ,EMPRESAS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA)
        AS
        (
          SELECT PJ.CNPJ, RAZAOSOCIAL, NOMEFANTASIA
          FROM ${modelReceita.get('PJ')} PJ
              INNER JOIN EMPRESAS_TELEFONE E ON (PJ.CNPJ = E.CNPJ)
        )

        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia --, cast(DTINICIOATIVIDADE as date) as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesEmpresasTelefone = function (listaTelefone: string[], tipobusca: string = 'completa') {

  if (tipobusca !== 'parentesco' && tipobusca !== 'completa') { return []; }
  if (listaTelefone.length === 0) { return []; }

  const lista = "'" + listaTelefone.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS(CNPJ, TELEFONE)
        AS
        (
          SELECT DISTINCT cpf_cnpj, telefone
          FROM ${modelConfig.get('TELEFONE')}
          WHERE telefone IN (${lista})  AND LEN(cpf_cnpj) = 14
        )

        SELECT telefone as origem, 'propriedade' as relacao, cnpj as destino
        FROM EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};
