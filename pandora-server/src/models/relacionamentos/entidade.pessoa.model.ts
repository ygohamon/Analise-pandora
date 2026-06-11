
import { db, ISql } from '../../services/db.service';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, trataResultado, getNomeFuncao} from '../../utils';

const modelConfig = getModelConfig('BD_RECEITA');
const modelRelacionamento = getModelConfig('BD_RELACIONAMENTO');
const modelTSE = getModelConfig('BD_TSE');
const modelTelefone = getModelConfig('BD_TELEFONE');
const modelSagres = getModelConfig('BD_SAGRES');

export let getNodesParentescosPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa', tipoparentesco: string = 'restrito'){

  if (tipobusca !== 'parentesco' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";
  const restricao = (tipoparentesco === 'restrito') ? `WHERE relacao IN ('MÃE', 'PAI', 'IRMÃO', 'IRMÃ', 'CÔNJUGE/COMPANHEIRO', 'CÔNJUGE/COMPANHEIRA', 'PAI/PADRASTO', 'MÃE/MADRASTA', 'COMPANHEIRO', 'COMPANHEIRA', 'CÔNJUGE')` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ALVO_PF_INICIAL(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT CPF, NOME, NomeMae, DataNascimento, CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END, Municipio, UF
          FROM ${modelConfig.get('PF')} PF
          WHERE cpf IN (${lista})
        )
        ,VINCULOS_DIRETOS_A(CPF, RELACAO)
        AS
        (
          SELECT CPF2, RELACAO
          FROM ALVO_PF_INICIAL A
            INNER JOIN ${modelRelacionamento.get('RELACIONAMENTO')} R ON (A.CPF = R.CPF1)
          ${restricao}
        )
        ,VINCULOS_DIRETOS_B(CPF, RELACAO)
        AS
        (
          SELECT CPF1, RELACAO
          FROM ALVO_PF_INICIAL A
            INNER JOIN ${modelRelacionamento.get('RELACIONAMENTO')} R ON (A.CPF = R.CPF2)
          ${restricao}
        )
        ,VINCULOS_DIRETOS(CPF, RELACAO)
        AS
        (
          SELECT CPF, RELACAO	FROM VINCULOS_DIRETOS_A
          UNION
          SELECT CPF, RELACAO	FROM VINCULOS_DIRETOS_B
        )
        ,ALVO_PF_COM_VINCULOS(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT PF.CPF, NOME, NomeMae, DataNascimento, CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END, Municipio, UF
          FROM VINCULOS_DIRETOS V
            INNER JOIN ${modelConfig.get('PF')} PF ON (V.CPF = PF.CPF)

          UNION

          SELECT *
          FROM ALVO_PF_INICIAL
        )
        ,ALVO_PF(CPF, NOME, NomeMae, NomePai, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT A.CPF, A.NOME, A.NomeMae, E.NOM_PAI, A.DataNascimento, A.Sexo, A.Municipio, A.UF
          FROM ALVO_PF_COM_VINCULOS A
            LEFT OUTER JOIN ${modelTSE.get('ELEITOR')} E ON (A.CPF = E.NUM_CPF)
        )

        SELECT CPF as id, 'pessoa' as entidade, CPF as cpf, NOME as nome --, NomeMae as nomeMae, NomePai as nomePai, DataNascimento as dataNascimento, Sexo as sexo, Municipio as municipio, UF as uf
        FROM ALVO_PF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesParentescosPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa', tipoparentesco: string = 'restrito') {

  if (tipobusca !== 'parentesco' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";
  const restricao = (tipoparentesco === 'restrito') ? `WHERE relacao IN ('MÃE', 'PAI', 'IRMÃO', 'IRMÃ', 'CÔNJUGE/COMPANHEIRO', 'CÔNJUGE/COMPANHEIRA', 'PAI/PADRASTO', 'MÃE/MADRASTA', 'COMPANHEIRO', 'COMPANHEIRA', 'CÔNJUGE')` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ALVOS_PF_INICIAL(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
          FROM ${modelConfig.get('PF')} PF
          WHERE cpf IN (${lista})
        )
        ,VINCULOS_PARENTES_A(CPF_ORIGEM, RELACAO, CPF_DESTINO)
        AS
        (
          SELECT CPF1, RELACAO, CPF2
          FROM ALVOS_PF_INICIAL A
            INNER JOIN ${modelRelacionamento.get('RELACIONAMENTO')} R ON (A.CPF = R.CPF1)
          ${restricao}
        )
        ,VINCULOS_PARENTES_B(CPF_ORIGEM, RELACAO, CPF_DESTINO)
        AS
        (
          SELECT CPF2, RELACAO, CPF1
          FROM ALVOS_PF_INICIAL A
            INNER JOIN ${modelRelacionamento.get('RELACIONAMENTO')} R ON (A.CPF = R.CPF2)
          ${restricao}
        )
        ,VINCULOS_DIRETOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT * FROM VINCULOS_PARENTES_A
          UNION
          SELECT * FROM VINCULOS_PARENTES_B
        )

        SELECT ORIGEM as origem, RELACAO as relacao, DESTINO as destino
        FROM VINCULOS_DIRETOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesEmpresasResponsavelPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'empresasresponsavel' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ALVO_PF_INICIAL(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
          FROM ${modelConfig.get('PF')} PF
          WHERE cpf IN (${lista})
        )
        ,RESPONSAVEL_EMPRESA(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ALVO_PF_INICIAL A
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (A.CPF = PJ.CpfResponsavel)
        )
        ,EMPRESAS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT * FROM RESPONSAVEL_EMPRESA
        )

        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia --, cast(DTINICIOATIVIDADE as date) as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesEmpresasResponsavelPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'empresasresponsavel' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ALVOS_PF_INICIAL(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
          FROM ${modelConfig.get('PF')} PF
          WHERE cpf IN (${lista})
        )
        ,RESPONSAVEL_EMPRESA(CPF, RELACAO, CNPJ)
        AS
        (
          SELECT A.CPF, 'RESPONSAVEL', PJ.CNPJ
          FROM ALVOS_PF_INICIAL A
              INNER JOIN ${modelConfig.get('PJ')} PJ ON (A.CPF = PJ.CpfResponsavel)
        )
        ,VINCULOS_DIRETOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
          SELECT * FROM RESPONSAVEL_EMPRESA
        )

        SELECT ORIGEM as origem, RELACAO as relacao, DESTINO as destino
        FROM VINCULOS_DIRETOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesEmpresasSocioPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'empresassocio' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ALVO_PF_INICIAL(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
          SELECT CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
          FROM ${modelConfig.get('PF')} PF
          WHERE cpf IN (${lista})
        )
        ,SOCIOS_EMPRESA(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT PJ.CNPJ, PJ.RazaoSocial, PJ.NomeFantasia, PJ.DataInicioAtividade, PJ.DataSituacaoCadastral, PJ.Municipio, PJ.UF
          FROM ALVO_PF_INICIAL A
            INNER JOIN ${modelConfig.get('SOCIO')} S ON ('000' + A.CPF = S.CpfCnpjSocio)
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (S.Cnpj = PJ.CNPJ)
        )
        ,EMPRESAS(CNPJ, RAZAOSOCIAL, NOMEFANTASIA, DTINICIOATIVIDADE, DTSITUACAOCADASTRAL, MUNICIPIO, UF)
        AS
        (
          SELECT * FROM SOCIOS_EMPRESA
        )

        SELECT CNPJ as id, 'empresa' as entidade, CNPJ as cnpj, RAZAOSOCIAL as razaoSocial, NOMEFANTASIA as nomeFantasia --, cast(DTINICIOATIVIDADE as date) as dataInicioAtividade, MUNICIPIO as municipio, UF as uf
        FROM EMPRESAS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesEmpresasSocioPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'empresassocio' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ALVOS_PF_INICIAL(CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF)
        AS
        (
            SELECT CPF, NOME, NomeMae, DataNascimento, Sexo, Municipio, UF
            FROM ${modelConfig.get('PF')} PF
            WHERE cpf IN (${lista})
        )
        ,SOCIOS_EMPRESA(CPF, RELACAO, CNPJ)
        AS
        (
            SELECT A.CPF, 'SOCIO', PJ.CNPJ
            FROM ALVOS_PF_INICIAL A
                INNER JOIN ${modelConfig.get('SOCIO')} S ON ('000' + A.CPF = S.CpfCnpjSocio)
                INNER JOIN ${modelConfig.get('PJ')} PJ ON (S.Cnpj = PJ.CNPJ)
        )
        ,VINCULOS_DIRETOS(ORIGEM, RELACAO, DESTINO)
        AS
        (
            SELECT * FROM SOCIOS_EMPRESA
        )

        SELECT ORIGEM as origem, RELACAO as relacao, DESTINO as destino
        FROM VINCULOS_DIRETOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesTelefonesPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'telefones' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH TELEFONES(TELEFONE)
        AS
        (
          SELECT DISTINCT telefone
          FROM ${modelTelefone.get('TELEFONE')}
          WHERE cpf_cnpj IN (${lista})
            AND telefone IS NOT NULL
            AND telefone <> ''
        )

        SELECT CAST(telefone as varchar) as id, 'telefone' as entidade, CAST(telefone as varchar) as telefone
        FROM TELEFONES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesTelefonesPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'telefones' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH TELEFONES(TELEFONE, cpf)
        AS
        (
            SELECT DISTINCT telefone, cpf_cnpj
            FROM ${modelTelefone.get('TELEFONE')}
            WHERE cpf_cnpj IN (${lista})
              AND telefone IS NOT NULL
              AND telefone <> ''
        )

        SELECT cpf as origem, 'proprietario' as relacao, telefone as destino
        FROM TELEFONES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesEnderecosPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'enderecos' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ENDERECOS(TIPOLOGRADOURO, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CEP, MUNICIPIO, UF)
        AS
        (
            SELECT TRIM(TipoLogradouro), TRIM(Logradouro), TRIM(NumeroLogradouro), TRIM(Complemento),
                TRIM(Bairro), TRIM(Cep), TRIM(Municipio), TRIM(UF)
            FROM ${modelConfig.get('PF')}
            WHERE cpf IN (${lista})
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

export let getEdgesEnderecosPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'enderecos' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH ENDERECOS(CPF, LOGRADOURO, NUMERO)
        AS
        (
            SELECT TRIM(CPF), TRIM(Logradouro), TRIM(NumeroLogradouro)
            FROM ${modelConfig.get('PF')}
            WHERE cpf IN (${lista})
        )
        SELECT cpf as origem, 'reside' as relacao, CONCAT(LOGRADOURO, '-', NUMERO) as destino
        FROM ENDERECOS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesOrgaosPublicosMunicipaisPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'orgaospublicos' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH VINCULOS_MUNICIPAIS(ID, UGESTORA)
        AS
        (
          SELECT DISTINCT FP.cod_orgao, UPPER(FP.orgao)
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE cpf_servidor IN (${lista})
        )

        SELECT ID as id, 'orgaopublico' as entidade, UGESTORA as uGestora, 'M' as esfera
        FROM VINCULOS_MUNICIPAIS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getEdgesOrgaosPublicosMunicipaisPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'orgaospublicos' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH VINCULOS_MUNICIPAIS(ID, UGESTORA, CPF, CARGO, PRIMEIRA, ULTIMA)
        AS
        (
          SELECT DISTINCT cod_orgao, UPPER(orgao), cpf_servidor, cargo, min(ano), max(ano)
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE cpf_servidor IN (${lista})
          GROUP BY cod_orgao, orgao, cpf_servidor, cargo
        )

        SELECT CONCAT(CPF, '-', CARGO, '-', ID) as id, CPF as origem, CARGO as relacao, ID as destino, MIN(PRIMEIRA) as pOcorrencia, MAX(ULTIMA) as uOcorrencia
        FROM VINCULOS_MUNICIPAIS
        GROUP BY ID, UGESTORA, CPF, CARGO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getNodesOrgaosPublicosEstaduaisPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'orgaospublicos' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH VINCULOS_ESTADUAIS(ID, UGESTORA)
        AS
        (
          SELECT DISTINCT FP.cod_orgao, UPPER(FP.orgao)
          FROM ${modelSagres.get('SE_FOLHAPAGAMENTO')} FP
          WHERE cpf_servidor IN (${lista})
        )

        SELECT ID as id, 'orgaopublico' as entidade, UGESTORA as uGestora, 'E' as esfera
        FROM VINCULOS_ESTADUAIS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));

};

export let getEdgesOrgaosPublicosEstaduaisPessoaCPF = function (listaCpf: Array<string>, tipobusca: string = 'completa') {

  if (tipobusca !== 'orgaospublicos' && tipobusca !== 'completa') { return []; }
  if (listaCpf.length === 0) { return []; }

  const lista = "'" + listaCpf.join("','") + "'";

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ],`
        ;WITH VINCULOS_ESTADUAIS(ID, UGESTORA, CPF, CARGO, PRIMEIRA, ULTIMA)
        AS
        (
          SELECT DISTINCT cod_orgao, UPPER(orgao), cpf_servidor, cargo, min(ano), max(ano)
          FROM ${modelSagres.get('SE_FOLHAPAGAMENTO')} FP
          WHERE cpf_servidor IN (${lista})
          GROUP BY cod_orgao, orgao, cpf_servidor, cargo
        )

        SELECT CONCAT(CPF, '-', CARGO, '-', ID) as id, CPF as origem, CARGO as relacao, ID as destino, MIN(PRIMEIRA) as pOcorrencia, MAX(ULTIMA) as uOcorrencia
        FROM VINCULOS_ESTADUAIS
        GROUP BY ID, UGESTORA, CPF, CARGO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig)
    .then(result => result.map(resultado => trataResultado(resultado)));
};

export let getParentescosCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
          EXEC ${modelRelacionamento.get('USP_PARENTESCOS')} @CPF, NULL, NULL
      `);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return result.map(d => {
      return trataResultado({
        nivel: d.NIVEL,
        categoria: d.CATEGORIA,
        cpf: d.CPF2,
        nome: d.NOME2,
        sexo: d.SEXO,
        idade: d.IDADE,
        municipio: d.Municipio,
        uf: d.UF,
      });
    });
  };

  return mf.call(null, query, nomeFuncao, arguments, modelRelacionamento, { fonte: 'BD_RELACAO', rank: 0, grupo: 'parentesco', fnProcessaDadosEncontrados })
};
