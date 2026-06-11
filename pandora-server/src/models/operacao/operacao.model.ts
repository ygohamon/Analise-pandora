
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from './../../utils';

const modelConfig  = getModelConfig('BD_GAECO');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte   = MODEL_PRIORITY['operacoes'].fonte;
const rank    = MODEL_PRIORITY['operacoes'].rank;
const grupo   = MODEL_PRIORITY['operacoes'].grupo;

export let getInvestigadosOperacoesCPF_BD_GAECO = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CPF, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT NOME_CASO COLLATE Latin1_General_CI_AS, CPF, ACAO_PENAL, NULL
          FROM ${modelConfig.get('DENUNCIADOS')}
          WHERE CPF = @CPF

          UNION ALL

          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PF')} A
            LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
          WHERE DOCUMENTO = @CPF
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
          PF.CPF AS cpf, PF.Nome AS nome, Pf.NomeMae as nomeMae, PF.DataNascimento as dataNascimento,
          PF.UF as uf, PF.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (D.CPF = PF.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getInvestigadosOperacoesNome_BD_GAECO = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CPF, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT NOME_CASO COLLATE Latin1_General_CI_AS, CPF, ACAO_PENAL, NULL
          FROM ${modelConfig.get('DENUNCIADOS')}

          UNION ALL

          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PF')} A
            LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
          PF.CPF AS cpf, PF.Nome AS nome, Pf.NomeMae as nomeMae, PF.DataNascimento as dataNascimento,
          PF.UF as uf, PF.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (D.CPF = PF.CPF)
        WHERE CONTAINS(Nome, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getInvestigadosOperacoesAlcunha_BD_GAECO = function (alcunha: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['ALCUNHA', ISql.Char(11), alcunha],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CPF, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT NOME_CASO COLLATE Latin1_General_CI_AS, CPF, ACAO_PENAL, NULL
          FROM ${modelConfig.get('DENUNCIADOS')}
          WHERE APELIDO = @ALCUNHA

          UNION ALL

          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PF')} A
            LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
          PF.CPF AS cpf, PF.Nome AS nome, Pf.NomeMae as nomeMae, PF.DataNascimento as dataNascimento,
          PF.UF as uf, PF.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (D.CPF = PF.CPF)
      `);
  }
  

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getInvestigadosOperacoesCNPJ_BD_GAECO = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CNPJ, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PJ')} A
              LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
          WHERE DOCUMENTO = @CNPJ
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
         PJ.cnpj, TRIM(PJ.razaoSocial) as razaoSocial, TRIM(PJ.nomeFantasia) as nomeFantasia, PJ.dataInicioAtividade,
         PJ.UF as uf, PJ.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ = PJ.CNPJ)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getInvestigadosOperacoesRazaoSocial_BD_GAECO = function (razaoSocial: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RAZAOSOCIAL', ISql.VarChar, razaoSocial],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CNPJ, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PJ')} A
              LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
         PJ.cnpj, TRIM(PJ.razaoSocial) as razaoSocial, TRIM(PJ.nomeFantasia) as nomeFantasia, PJ.dataInicioAtividade,
         PJ.UF as uf, PJ.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ = PJ.CNPJ)
        WHERE CONTAINS(RazaoSocial, @RAZAOSOCIAL) OR CONTAINS(NomeFantasia, @RAZAOSOCIAL)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getInvestigadosOperacoesPFOperacao_BD_GAECO = function (operacao: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['OPERACAO', ISql.VarChar, operacao],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CPF, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT NOME_CASO COLLATE Latin1_General_CI_AS, CPF, ACAO_PENAL, NULL
          FROM ${modelConfig.get('DENUNCIADOS')}
          WHERE NOME_CASO LIKE '%' + @OPERACAO + '%'

          UNION ALL

          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PF')} A
            LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
          WHERE O.OPERACAO LIKE '%' + @OPERACAO + '%'
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
          PF.CPF AS cpf, PF.Nome AS nome, Pf.NomeMae as nomeMae, PF.DataNascimento as dataNascimento,
          PF.UF as uf, PF.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (D.CPF = PF.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getInvestigadosOperacoesPJOperacao_BD_GAECO = function (operacao: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['OPERACAO', ISql.VarChar, operacao],
      ],`
        ;WITH DENUNCIADOS(OPERACAO, CNPJ, ACAO_PENAL, DATA_OPERACAO)
        AS
        (
          SELECT O.OPERACAO, DOCUMENTO, NULL, O.DATA
          FROM ${modelConfig.get('ALVOS_PJ')} A
            LEFT OUTER JOIN ${modelConfig.get('OPERACOES')} O ON (A.ID_OPERACAO = O.ID)
          WHERE O.OPERACAO LIKE '%' + @OPERACAO + '%'
        )

        SELECT OPERACAO as nomeOperacao, DATA_OPERACAO as dataOperacao, ACAO_PENAL as acaoPenal,
         PJ.cnpj, TRIM(PJ.razaoSocial) as razaoSocial, TRIM(PJ.nomeFantasia) as nomeFantasia, PJ.dataInicioAtividade,
         PJ.UF as uf, PJ.Municipio as municipio
        FROM DENUNCIADOS D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ = PJ.CNPJ)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
 