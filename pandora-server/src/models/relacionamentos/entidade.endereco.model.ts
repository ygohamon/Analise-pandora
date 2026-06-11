
import { db, ISql } from '../../services/db.service';
import { trataResultado, modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITA');
const modelTSE = getModelConfig('BD_TSE');

/**
 * Retorna as entidades 'Pessoa' que possuem esse endereco.
 * @param cpf
 * @param tipobusca
 */
export let getNodesPessoasEndereco = function (logradouro: string, numero: string, municipio: string, tipobusca: string = 'completa'){

  if (tipobusca !== 'pessoas' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar(120), logradouro],
      ['NUMERO', ISql.VarChar(12), numero],
      ['MUNICIPIO', ISql.VarChar(50), municipio],
      ],`
        ;WITH PESSOAS(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT PF.CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
          FROM ${modelConfig.get('PF')} PF
          WHERE CONTAINS(Logradouro, @LOGRADOURO) AND NumeroLogradouro = @NUMERO AND Municipio = @MUNICIPIO
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

export let getEdgesPessoasEndereco = function (logradouro: string, numero: string, municipio: string, tipobusca: string = 'completa') {

  if (tipobusca !== 'pessoas' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar(120), logradouro],
      ['NUMERO', ISql.VarChar(12), numero],
      ['MUNICIPIO', ISql.VarChar(50), municipio],
      ],`
        ;WITH ENDERECOS(CPF, LOGRADOURO, NUMERO)
        AS
        (
          SELECT TRIM(CPF), TRIM(Logradouro), TRIM(NumeroLogradouro)
          FROM ${modelConfig.get('PF')}
          WHERE CONTAINS(Logradouro, @LOGRADOURO) AND NumeroLogradouro = @NUMERO AND Municipio = @MUNICIPIO
        )
        SELECT CONCAT(LOGRADOURO, '-', NUMERO) as origem, 'residencia' as relacao, cpf as destino
        FROM ENDERECOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

/**
 * Retorna as entidades 'Empresa' que possuem esse endereco.
 * @param cpf
 * @param tipobusca
 */
export let getNodesEmpresasEndereco = function (logradouro: string, numero: string, municipio: string, tipobusca: string = 'completa'){

  if (tipobusca !== 'empresas' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar(120), logradouro],
      ['NUMERO', ISql.VarChar(12), numero],
      ['MUNICIPIO', ISql.VarChar(50), municipio],
      ],`
        ;WITH EMPRESAS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CONTAINS(Logradouro, @LOGRADOURO) AND Numero = @NUMERO AND Municipio = @MUNICIPIO
        )
        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia, cast(DTINICIOATIVIDADE as date) as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesEmpresasEndereco = function (logradouro: string, numero: string, municipio: string, tipobusca: string = 'completa') {

  if (tipobusca !== 'empresas' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar(120), logradouro],
      ['NUMERO', ISql.VarChar(12), numero],
      ['MUNICIPIO', ISql.VarChar(50), municipio],
      ],`
        ;WITH ENDERECOS(CNPJ, LOGRADOURO, NUMERO)
        AS
        (
          SELECT TRIM(CNPJ), TRIM(Logradouro), TRIM(Numero)
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CONTAINS(Logradouro, @LOGRADOURO) AND Numero = @NUMERO AND Municipio = @MUNICIPIO
        )
        SELECT CONCAT(LOGRADOURO, '-', NUMERO) as origem, 'abriga' as relacao, cnpj as destino
        FROM ENDERECOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};
