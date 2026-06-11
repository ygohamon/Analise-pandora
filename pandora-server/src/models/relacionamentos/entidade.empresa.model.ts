import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, trataResultado, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITA');
const modelTSE = getModelConfig('BD_TSE');

export let getNodesResponsavelEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa'){

  if (tipobusca !== 'responsavel' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
          ;WITH PESSOA_RESPONSAVEL_SEM_PAI(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
          AS
          (
            SELECT CPF, NOME, NomeMae, DataNascimento, CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END, PF.Municipio, PF.UF
            FROM ${modelConfig.get('PJ')} PJ
                INNER JOIN ${modelConfig.get('PF')} PF ON (PJ.CpfResponsavel = PF.cpf)
            WHERE PJ.CNPJ IN (${lista})
          )
          ,PESSOA_RESPONSAVEL(CPF, NOME, NomeMae, NomePai, DataNascimento, Sexo, Municipio, UF)
          AS
          (
            SELECT A.CPF, A.NOME, A.NomeMae, E.NOM_PAI, A.DataNascimento, A.Sexo, A.Municipio, A.UF
            FROM PESSOA_RESPONSAVEL_SEM_PAI A
                LEFT OUTER JOIN ${modelTSE.get('ELEITOR')} E ON (A.CPF = E.NUM_CPF)
          )

          SELECT CPF as id, 'pessoa' as entidade, CPF as cpf, NOME as nome, NomeMae as nomeMae, NomePai as nomePai, DataNascimento as dataNascimento, Sexo as sexo, Municipio as municipio, UF as uf
          FROM PESSOA_RESPONSAVEL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesResponsavelEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'responsavel' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        SELECT PJ.CNPJ as origem, 'responsavel' as relacao, PJ.CpfResponsavel as destino
        FROM ${modelConfig.get('PJ')} PJ
        WHERE PJ.CNPJ IN (${lista}) AND PJ.CpfResponsavel <> '00000000000'
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesEnderecosEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa'){

  if (tipobusca !== 'enderecos' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ENDERECOS(TIPOLOGRADOURO, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CEP, MUNICIPIO, UF)
        AS
        (
          SELECT TRIM(DescricaoTipoLogradouro), TRIM(Logradouro), TRIM(Numero), TRIM(Complemento),
              TRIM(Bairro), TRIM(Cep), TRIM(Municipio), TRIM(UF)
          FROM ${modelConfig.get('PJ')}
          WHERE CNPJ IN (${lista})
        )
        SELECT CONCAT(LOGRADOURO,'-', NUMERO) as id, 'endereco' as entidade, TIPOLOGRADOURO as tipoLogradouro,
            LOGRADOURO as logradouro, NUMERO as numero, COMPLEMENTO as complemento, BAIRRO as bairro,
            CEP as cep, MUNICIPIO as municipio, UF as uf
        FROM ENDERECOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesEnderecosEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'enderecos' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ENDERECOS(CNPJ, LOGRADOURO, NUMERO)
        AS
        (
            SELECT TRIM(CNPJ), TRIM(Logradouro), TRIM(Numero)
            FROM ${modelConfig.get('PJ')}
            WHERE CNPJ IN (${lista})
        )
        SELECT CNPJ as origem, 'encontra-se' as relacao, CONCAT(LOGRADOURO, '-', NUMERO) as destino
        FROM ENDERECOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesSociosPJEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa'){

  if (tipobusca !== 'sociospj' && tipobusca !== 'socios' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_ALVO(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CNPJ IN (${lista})
        )
        ,TEM_SOCIEDADE(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM EMPRESAS_ALVO E
            INNER JOIN ${modelConfig.get('SOCIO')} S ON (E.CNPJ = S.CpfCnpjSocio)
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (S.Cnpj = PJ.CNPJ)
          WHERE S.IdentificadorSocio=1
        )
        ,SOCIOS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM EMPRESAS_ALVO E
            INNER JOIN ${modelConfig.get('SOCIO')} S ON (E.CNPJ = S.CNPJ)
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (S.CpfCnpjSocio = PJ.CNPJ)
          WHERE S.IdentificadorSocio=1
        )
        ,EMPRESAS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT * FROM EMPRESAS_ALVO
          UNION
          SELECT * FROM TEM_SOCIEDADE
          UNION
          SELECT * FROM SOCIOS
        )

        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia, cast(DTINICIOATIVIDADE as date) as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesSociosPJEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'sociospj' && tipobusca !== 'socios' && tipobusca !== 'completa') { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_ALVO(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CNPJ IN (${lista})
        )
        ,TEM_SOCIEDADE(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT E.CNPJ as origem, 'tem participacao' as relacao, S.CNPJ as destino
          FROM EMPRESAS_ALVO E
              INNER JOIN ${modelConfig.get('SOCIO')} S ON (E.CNPJ = S.CpfCnpjSocio)
          WHERE S.IdentificadorSocio=1
        )
        ,SOCIOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT E.CNPJ as origem, 'tem como socio' as relacao, S.CpfCnpjSocio as destino
          FROM EMPRESAS_ALVO E
              INNER JOIN ${modelConfig.get('SOCIO')} S ON (E.CNPJ = S.CNPJ)
          WHERE S.IdentificadorSocio=1
        )
        ,VINCULOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT * FROM TEM_SOCIEDADE
          UNION
          SELECT * FROM SOCIOS
        )

        SELECT ORIGEM as origem, RELACAO as relacao, DESTINO as destino
        FROM VINCULOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesSociosPFEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa'){

  if (tipobusca !== 'sociospf' && tipobusca !== 'socios' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_ALVO(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CNPJ IN (${lista})
        )
        ,SOCIOS(CPF, NOME, NomeMae, NomePai, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT PF.CPF, PF.NOME, PF.NomeMae, EL.NOM_PAI, PF.DataNascimento, CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END, PF.Municipio, PF.UF
          FROM EMPRESAS_ALVO E
            INNER JOIN ${modelConfig.get('SOCIO')} S ON (E.CNPJ = S.CNPJ)
            INNER JOIN ${modelConfig.get('PF')} PF ON (PF.CPF = RIGHT(S.CpfCnpjSocio,11))
            LEFT OUTER JOIN ${modelTSE.get('ELEITOR')} EL ON (PF.CPF = EL.NUM_CPF)
          WHERE S.IdentificadorSocio=2
        )

        SELECT CPF as id, 'pessoa' as entidade, CPF as cpf, NOME as nome, NomeMae as nomeMae, NomePai as nomePai, DataNascimento as dataNascimento, Sexo as sexo, Municipio as municipio, UF as uf
        FROM SOCIOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesSociosPFEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'sociospf' && tipobusca !== 'socios' && tipobusca !== 'completa') { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_ALVO(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CNPJ IN (${lista})
        )
        ,SOCIOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT E.CNPJ as origem, 'tem como socio' as relacao, RIGHT(S.CpfCnpjSocio,11) as destino
          FROM EMPRESAS_ALVO E
              INNER JOIN ${modelConfig.get('SOCIO')} S ON (E.CNPJ = S.CNPJ)
          WHERE S.IdentificadorSocio=2
        )

        SELECT ORIGEM as origem, RELACAO as relacao, DESTINO as destino
        FROM SOCIOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesFiliaisEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa'){

  if (tipobusca !== 'filiais' && tipobusca !== 'completa') { return []; }
  if (listaCnpj.length === 0) { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_MATRIZ(CNPJ, MATRIZFILIAL)
        AS
        (
          SELECT LEFT(PJ.CNPJ, 10), PJ.IdentificadorMatrizFilial
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CNPJ IN (${lista}) AND IdentificadorMatrizFilial = 1
        )
        ,FILIAIS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM EMPRESAS_MATRIZ E
              INNER JOIN ${modelConfig.get('PJ')} PJ ON (E.CNPJ = LEFT(PJ.CNPJ, 10))
          WHERE PJ.IdentificadorMatrizFilial <> 1
        )

        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia, cast(DTINICIOATIVIDADE as date) as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM FILIAIS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesFiliaisEmpresaCNPJ = function (listaCnpj: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'filiais' && tipobusca !== 'completa') { return []; }

  const lista = "'" + listaCnpj.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH EMPRESAS_MATRIZ(INICIO_CNPJ, CNPJ)
        AS
        (
          SELECT LEFT(PJ.CNPJ, 10), PJ.CNPJ
          FROM ${modelConfig.get('PJ')} PJ
          WHERE CNPJ IN (${lista}) AND IdentificadorMatrizFilial = 1
        )
        ,VINCULOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT E.CNPJ, 'matriz', PJ.CNPJ
          FROM EMPRESAS_MATRIZ E
              INNER JOIN ${modelConfig.get('PJ')} PJ ON (E.INICIO_CNPJ = LEFT(PJ.CNPJ, 10))
          WHERE PJ.IdentificadorMatrizFilial <> 1
        )

        SELECT ORIGEM as origem, RELACAO as relacao, DESTINO as destino
        FROM VINCULOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};
