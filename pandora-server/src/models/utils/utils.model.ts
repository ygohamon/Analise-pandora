import * as rp from 'request-promise-native';

import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG, API_CODES } from '../../config';
import { resultNotFound, logErroBuscaBD, resultFoundRaw } from '../../utils';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_MISC');
const modelSagres = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['utils'].fonte;
const rank = MODEL_PRIORITY['utils'].rank;
const grupo = MODEL_PRIORITY['utils'].grupo;

export const getMunicipioUF_ReceitaNovo_UFMunicipio = function(uf, municipio = null) {

  const extra = (municipio) ? `AND Municipio LIKE '${municipio}%' COLLATE Latin1_General_CI_AI` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['uf', ISql.NVarChar, uf],
      ],`
        SELECT Municipio as municipio, UF as uf
        FROM ${modelConfig.get('UF_MUNICIPIO')}
        WHERE UF=@uf
        ${extra}
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getOrgaoSagresMunicipal = function(orgao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['orgao', ISql.VarChar, '%' + orgao + '%'],
      ],`
        SELECT DISTINCT cd_Ugestora as cdUgestora, UPPER(TRIM(de_Orgao)) as ugestora
        FROM ${modelSagres.get('CODIGO_UGESTORA')}
        WHERE de_Orgao LIKE @orgao  AND Tipo = 'Municipal'
        ORDER BY 2
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getOrgaoSagresMunicipalEstadual = function(orgao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['orgao', ISql.VarChar, '%' + orgao + '%'],
      ],`
        ;WITH LOTACAO(CDORGAO, ORGAO, ESFERA, MUNICIPIO, CDIBGE)
        AS
        (
          SELECT cd_Orgao, de_Orgao, cd_Origem, no_Municipio, cd_Ibge
          FROM ${modelSagres.get('CODIGO_ORGAO')}
          WHERE id_Orgao IN (
              SELECT MAX(id_Orgao)
              FROM ${modelSagres.get('CODIGO_ORGAO')}
              WHERE de_orgao LIKE @orgao
              GROUP BY de_Orgao, cd_Origem, no_Municipio, cd_Ibge
          )
        )

        SELECT cdOrgao, orgao, esfera
        FROM LOTACAO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getUGestoraSagresMunicipalEstadual = function(orgao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['orgao', ISql.VarChar, '%' + orgao + '%'],
      ],`
        ;WITH LOTACAO(CDUGESTORA, UGESTORA, ESFERA)
        AS
        (
          SELECT DISTINCT cd_Ugestora, UPPER(TRIM(de_Orgao)), CASE WHEN Tipo = 'Municipal' THEN 'M' ELSE 'E' END
          FROM ${modelSagres.get('CODIGO_UGESTORA')}
          WHERE de_Orgao LIKE @orgao AND cd_Ugestora NOT IN ('-1', '-2', '-3', '')
        )

        SELECT CDUGESTORA as cdUgestora, UGESTORA as ugestora, ESFERA as esfera
        FROM LOTACAO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

const fonte_geocoordenadas = MODEL_PRIORITY['geocoordenadas.google'].fonte;
const rank_geocoordenadas = MODEL_PRIORITY['geocoordenadas.google'].rank;
const grupo_geocoordenadas = MODEL_PRIORITY['geocoordenadas.google'].grupo;

const promiseGeoCoordenadas = function(endereco) {
  const query = `${endereco.logradouro}, ${endereco.numero}, ${endereco.municipio}`;
  const options = {
    method: 'GET',
    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
    timeout: 5000,
    json: true,
  };

  return rp(options)
    .then(data => {
      const {status, results} = data;

      if (status === 'OK' && results.length > 0) {
        const geo = results.map(item => ({ lat: item.geometry.location.lat, lng: item.geometry.location.lng }));
        return resultFoundRaw(geo, fonte_geocoordenadas, rank_geocoordenadas, grupo_geocoordenadas);
      } else return resultNotFound(`Nao foi possivel encontrar as geocoordenadas para ${query}.`, fonte_geocoordenadas);
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca pelas geocoordenadas para ${query}.`, 'promiseGeoCoordenadas');
    });
};

export const getGeoCoordenadas = function(resultadoModel) {
  const dados = (resultadoModel?.resultado?.dados && resultadoModel?.status === API_CODES.CODE_SUCESSO) ? resultadoModel.resultado.dados : [];

  return (dados.length) ?
    Promise.all(dados.map(endereco => promiseGeoCoordenadas(endereco))) :
    resultadoModel;
};

const generateMapsOptions = function(query){

  const options = {
    method: 'GET',
    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
    timeout: 60000,
    json: true
  };
  return options;
}

export const getGeoCoordenadasGrupoCustomizado = function(resultadoConsulta, grupo) {
  const dados = (resultadoConsulta?.resultado?.dados && resultadoConsulta?.status === API_CODES.CODE_SUCESSO) ? resultadoConsulta.resultado.dados : [];
  if (dados.length) {
    var promisses = dados.map(e => promiseGeoCoordenadasGrupoCustomizado(e, grupo))
    return Promise.all(
      promisses
    );
  } else {
    return resultadoConsulta;
  }
};

const promiseGeoCoordenadasGrupoCustomizado = function(endereco, grupo) {
  let query = `${endereco.bairro} ${endereco.municipio} ${endereco.cep}`;
  return rp(generateMapsOptions(query))
    .then(data => {
      if (data.status === 'OK' && data.results.length > 0) {
        const geo = data.results.map(item => {
          return {
            lat: item.geometry.location.lat,
            lng: item.geometry.location.lng,
            nome: endereco.razaoSocial,
            cnpj: endereco.cnpj,
            endereco: endereco,
            resultados: data.results.length
          };
        }).slice(0,1);
        return resultFoundRaw(geo, fonte_geocoordenadas, rank_geocoordenadas, grupo_geocoordenadas + "_" + grupo);
      } else {
          return resultFoundRaw({nome:endereco.razaoSocial, cnpj:endereco.cnpj, endereco:endereco, resultados:0}, fonte_geocoordenadas, rank_geocoordenadas, grupo_geocoordenadas + "_" + grupo);
        }
    })
    .catch(error => {
      logErroBuscaBD(error, `Falha na busca pelas geocoordenadas para ${query}.`, 'promiseGeoCoordenadas');
      return resultFoundRaw({nome:endereco.razaoSocial, cnpj:endereco.cnpj, endereco:endereco, resultados:0}, fonte_geocoordenadas, rank_geocoordenadas, grupo_geocoordenadas + "_" + grupo);
    });
};
