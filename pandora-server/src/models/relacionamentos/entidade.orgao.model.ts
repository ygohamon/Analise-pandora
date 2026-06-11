
import { db, ISql } from '../../services/db.service';
import { trataResultado, modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelSagres = getModelConfig('BD_SAGRES');
const modelTSE = getModelConfig('BD_TSE');
const modelReceita = getModelConfig('BD_RECEITA');


export let getNodesOrgaoPublicoCdUgestoraMunicipal = function (cdUgestora: string, esfera: string, tipobusca: string = 'completa'){

  if (tipobusca !== 'orgaospublicos' && tipobusca !== 'completa' && esfera.toUpperCase() !== 'M') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.Char(6), cdUgestora],
      ],`
        ;WITH UGESTORA(CDUGESTORA, UGESTORA, MUNICIPIO)
        AS
        (
          SELECT cd_Ugestora, UPPER(de_Orgao), UPPER(no_Municipio)
          FROM ${modelSagres.get('CODIGO_UGESTORA')}
          WHERE cd_Ugestora=@CDUGESTORA
        )

        SELECT CAST(CDUGESTORA as varchar) as id, 'orgaopublico' as entidade, UGESTORA as uGestora, 'M' as esfera, MUNICIPIO as municipio
        FROM UGESTORA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesEmpresasPagasCdUgestoraMunicipal = function (cdUgestora: string, anoInicial: string, anoFinal: string, tipobusca: string = 'completa'){

  if (tipobusca !== 'empresaspagas' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.Char(6), cdUgestora],
      ['ANO_INICIAL', ISql.Char(4), anoInicial],
      ['ANO_FINAL', ISql.Char(4), anoFinal],
      ],`
        ;WITH EMPRESAS_PAGAS(CNPJ)
        AS
        (
          SELECT DISTINCT E.cpf_cnpj_credor
          FROM ${modelSagres.get('SM_EMPENHOS_PAGOS')} E
          WHERE E.cod_unidade_gestora=@CDUGESTORA and E.ano_emissao BETWEEN @ANO_INICIAL AND @ANO_FINAL AND tipo_credor=2
        )
        ,INFO_EMPRESAS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, CAST(PJ.DataInicioAtividade as date), PJ.Municipio, PJ.UF
          FROM EMPRESAS_PAGAS E
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (E.CNPJ = PJ.CNPJ)
        )

        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia, DTINICIOATIVIDADE as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM INFO_EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesEmpresasPagasCdUgestoraMunicipal = function (cdUgestora: string, anoInicial: string, anoFinal: string, tipobusca: string = 'completa') {

  if (tipobusca !== 'empresaspagas' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.Char(6), cdUgestora],
      ['ANO_INICIAL', ISql.Char(4), anoInicial],
      ['ANO_FINAL', ISql.Char(4), anoFinal],
      ],`
        ;WITH EMPRESAS_PAGAS(CDUGESTORA, CNPJ, ANO, EMPENHADO, PAGO)
        AS
        (
          SELECT E.cod_unidade_gestora, E.cpf_cnpj_credor, E.ano_emissao, SUM(CAST(REPLACE(E.valor_empenho, ',', '.') AS FLOAT)), SUM(CAST(REPLACE(E.valor_pago, ',', '.') AS FLOAT))
          FROM ${modelSagres.get('SM_EMPENHOS_PAGOS')} E
          WHERE E.cd_UGestora=@CDUGESTORA and E.dt_Ano BETWEEN @ANO_INICIAL AND @ANO_FINAL AND tipo_credor=2
          GROUP BY E.cod_unidade_gestora, E.cpf_cnpj_credor, E.ano_emissao
        )

        SELECT CONCAT(CDUGESTORA, '-', ANO, '-', CNPJ) as id, CAST(CDUGESTORA as varchar) as origem, CNPJ as destino, 'PAGOU' as relacao, ANO as ano, EMPENHADO as empenhado, PAGO as pago
        FROM EMPRESAS_PAGAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesServidoresCdUgestoraMunicipal = function (cdUgestora: string, anoInicial: string, anoFinal: string, tipobusca: string = 'completa'){

  if (tipobusca !== 'servidores' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.Char(6), cdUgestora],
      ['ANO_INICIAL', ISql.Char(4), anoInicial],
      ['ANO_FINAL', ISql.Char(4), anoFinal],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao=@CDUGESTORA AND FP.ano BETWEEN @ANO_INICIAL AND @ANO_FINAL
        )
        ,PESSOA(CPF, NOME, NomeMae, NomePai, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT PF.CPF, PF.Nome, PF.NomeMae, E.NOM_PAI, PF.DataNascimento, CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END as sexo, PF.Municipio, PF.UF
          FROM SERVIDORES S
            INNER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
            LEFT OUTER JOIN ${modelTSE.get('ELEITOR')} E ON (S.CPF = E.NUM_CPF)
        )

        SELECT CPF as id, 'pessoa' as entidade, CPF as cpf, NOME as nome, NomeMae as nomeMae, NomePai as nomePai, DataNascimento as dataNascimento, Sexo as sexo, Municipio as municipio, UF as uf
        FROM PESSOA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesServidoresCdUgestoraMunicipal = function (cdUgestora: string, anoInicial: string, anoFinal: string, tipobusca: string = 'completa') {

  if (tipobusca !== 'servidores' && tipobusca !== 'completa') { return []; }

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.Char(6), cdUgestora],
      ['ANO_INICIAL', ISql.Char(4), anoInicial],
      ['ANO_FINAL', ISql.Char(4), anoFinal],
      ],`
        ;WITH SERVIDORES(CPF, CARGO, CDUGESTORA)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor, C.cargo, FP.cod_orgao
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao=@CDUGESTORA AND FP.ano BETWEEN @ANO_INICIAL AND @ANO_FINAL
        )

        SELECT CONCAT(CDUGESTORA, '-', CARGO, '-', CPF) as id, CAST(CDUGESTORA as varchar) as origem, CPF as destino, CARGO as relacao
        FROM SERVIDORES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres)
    .then(result => result.map(resultado => trataResultado(resultado)));
};
