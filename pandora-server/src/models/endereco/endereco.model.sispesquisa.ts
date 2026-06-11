
import { db, ISql } from '../../services/db.service';
import { BenchmarkService } from '../../services/benchmark.service';
import { getModelConfig } from '../../config.models';

import {
    MODEL_PRIORITY,
    API_CODES,
    API_CONFIG
} from '../../config';

import {
    logErroBuscaBD,
    printTempoExecucao,
    modelFactory as mf,
    getNomeFuncao
} from '../../utils';

const modelConfig = getModelConfig('BD_ENDERECO');

const fonte = MODEL_PRIORITY['sispesquisa.enderecos'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.enderecos'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.enderecos'].grupo;

export let getEnderecoCPF_Sispesquisa_Enderecos = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        ;WITH ENDERECOS(CPF, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CEP, MUNICIPIO, UF, FONTE, DATAREGISTRO)
        AS
        (
          SELECT cpf_cnpj
              ,UPPER(logradouro)
              ,CASE
                  WHEN TRY_CAST(numeroLogradouro as int) IS NULL THEN 0
                  ELSE CAST(numeroLogradouro as int)
              END
              ,UPPER(complemento)
              ,UPPER(bairro)
              ,cep
              ,UPPER(municipio)
              ,UPPER(uf)
              ,fonte
              ,DataRegistro
          FROM ${modelConfig.get('ENDERECO')}
          WHERE cpf_cnpj=@CPF
        )
        ,PESOS(CPF, NUMERO, CEP, PESO)
        AS
        (
            SELECT CPF, NUMERO, CEP, COUNT(*)
            FROM ENDERECOS
            GROUP BY cpf, NUMERO, cep
        )
        ,ENDERECOS_COM_PESO(CPF, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CEP, MUNICIPIO, UF, FONTE, DATAREGISTRO, PESO)
        AS
        (
            SELECT E.CPF, E.LOGRADOURO, E.NUMERO, MAX(E.COMPLEMENTO), E.BAIRRO, E.CEP, E.MUNICIPIO, E.UF, MAX(E.FONTE), MAX(E.DATAREGISTRO), P.PESO * COUNT(*)
            FROM ENDERECOS E
                INNER JOIN PESOS P ON (P.NUMERO = E.NUMERO AND P.CEP = E.CEP)
            GROUP BY E.CPF, LOGRADOURO, E.NUMERO, BAIRRO, E.CEP, MUNICIPIO, UF, P.PESO
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF as cpf, LOGRADOURO as logradouro, NUMERO as numero, COMPLEMENTO as complemento, BAIRRO as bairro, CEP as cep, MUNICIPIO as municipio, UF as uf, FONTE as fonte, PESO as peso
        FROM ENDERECOS_COM_PESO
        ORDER BY PESO DESC, FONTE DESC
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEnderecoCNPJ_Sispesquisa_Enderecos = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        ;WITH ENDERECOS(CNPJ, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CEP, MUNICIPIO, UF, FONTE, DATAREGISTRO)
        AS
        (
            SELECT cpf_cnpj
                ,UPPER(logradouro)
                ,CASE
                    WHEN TRY_CAST(numeroLogradouro as int) IS NULL THEN 0
                    ELSE CAST(numeroLogradouro as int)
                END
                ,UPPER(complemento)
                ,UPPER(bairro)
                ,cep
                ,UPPER(municipio)
                ,UPPER(uf)
                ,fonte
                ,DataRegistro
            FROM ${modelConfig.get('ENDERECO')}
            WHERE cpf_cnpj=@CNPJ
        )
        ,PESOS(CNPJ, NUMERO, CEP, PESO)
        AS
        (
            SELECT CNPJ, NUMERO, CEP, COUNT(*)
            FROM ENDERECOS
            GROUP BY CNPJ, NUMERO, cep
        )
        ,ENDERECOS_COM_PESO(CNPJ, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CEP, MUNICIPIO, UF, FONTE, DATAREGISTRO, PESO)
        AS
        (
            SELECT E.CNPJ, E.LOGRADOURO, E.NUMERO, MAX(E.COMPLEMENTO), E.BAIRRO, E.CEP, E.MUNICIPIO, E.UF, MAX(E.FONTE), MAX(E.DATAREGISTRO), P.PESO * COUNT(*)
            FROM ENDERECOS E
                INNER JOIN PESOS P ON (P.NUMERO = E.NUMERO AND P.CEP = E.CEP)
            GROUP BY E.CNPJ, LOGRADOURO, E.NUMERO, BAIRRO, E.CEP, MUNICIPIO, UF, P.PESO
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj, LOGRADOURO as logradouro, NUMERO as numero, COMPLEMENTO as complemento, BAIRRO as bairro, CEP as cep, MUNICIPIO as municipio, UF as uf, FONTE as fonte, PESO as peso
        FROM ENDERECOS_COM_PESO
        ORDER BY PESO DESC, FONTE DESC
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let insertEnderecoCPF_Sispesquisa_Enderecos = function (form){

  const tempoInicial = new BenchmarkService();

  return db.query([
      ['cpf_parameter', ISql.VarChar, form.cpf],
      ['tipoLogradouro_parameter', ISql.VarChar, form.tipoLogradouro],
      ['logradouro_parameter', ISql.VarChar, form.logradouro],
      ['numeroLogradouro_parameter', ISql.VarChar, form.numeroLogradouro],
      ['complemento_parameter', ISql.VarChar, form.complemento],
      ['bairro_parameter', ISql.VarChar, form.bairro],
      ['cep_parameter', ISql.VarChar, form.cep],
      ['municipio_parameter', ISql.VarChar, form.municipio],
      ['uf_parameter', ISql.VarChar, form.uf],
      ['fonte_parameter', ISql.VarChar, form.fonte],
      ],`
        INSERT INTO ${modelConfig.get('ENDERECO')}
            (cpf_cnpj, tipoLogradouro, logradouro, numeroLogradouro,
            complemento, bairro, cep, municipio, uf, fonte)
        VALUES
            (@cpf_parameter, @tipoLogradouro_parameter, @logradouro_parameter,
            @numeroLogradouro_parameter, @complemento_parameter, @bairro_parameter,
            @cep_parameter, @municipio_parameter, @uf_parameter, @fonte_parameter)
      `)
      .then(result => {
          printTempoExecucao(tempoInicial, 'insertEnderecoCPF_Sispesquisa_Enderecos');

          return {
              status: API_CODES.CODE_SUCESSO,
              msg: 'Endereço cadastrado com sucesso.'
          }
      }).catch( error => {logErroBuscaBD(error, `Falha no cadastro do endereço.`, 'insertEnderecoCPF_Sispesquisa_Enderecos', form)});
};
