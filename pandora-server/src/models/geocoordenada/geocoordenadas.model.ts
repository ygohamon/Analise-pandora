import * as rp from 'request-promise-native';

import { db, ISql } from './../../services/db.service';
import { BenchmarkService } from './../../services/benchmark.service';

import {
    MODEL_PRIORITY,
    API_CONFIG
} from './../../config';

import {
    resultNotFound,
    resultFound,
    logErroBuscaBD,
    printTempoExecucao
} from './../../utils';

import { logger } from '../../services/log.service';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_GEOCOORDENADAS');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['nfce_mapa_calor'].fonte;
const rank  = MODEL_PRIORITY['nfce_mapa_calor'].rank;
const grupo = MODEL_PRIORITY['nfce_mapa_calor'].grupo;

export let getGeocoordenadasMapaCalorCPFPeriodo = function (cpf: string, datainicio: string = null, datafim: string = null){

  const tempoInicial = new BenchmarkService();

  let geoCoordenadasExistentes;
  let geoCoordenadasFaltantes;

  return db.query([
      ['CPF', ISql.Char(11), cpf],
      // ['DATAINICIO', ISql.Date, datainicio],
      // ['DATAFIM', ISql.Date, datafim],
      ],`
          ;WITH NOTAS(CPF, DATAEMISSAO, CNPJ, LAT, LNG)
          AS
          (
              SELECT nr_cpf_cnpj_dest, dhemissao, nr_cnpj, PJ.LAT, PJ.LNG
              FROM ${modelConfig.get('NFCE_17_18')} NF
                  LEFT OUTER JOIN ${modelConfig.get('PJ_GEOCOORDENADAS')} PJ ON (NF.nr_cnpj = PJ.CNPJ)
              WHERE nr_cpf_cnpj_dest=@CPF

              UNION

              SELECT nr_cpf_cnpj_dest, dhemissao, nr_cnpj, PJ.LAT, PJ.LNG
              FROM ${modelConfig.get('NFCE_19')} NF
                  LEFT OUTER JOIN ${modelConfig.get('PJ_GEOCOORDENADAS')} PJ ON (NF.nr_cnpj = PJ.CNPJ)
              WHERE nr_cpf_cnpj_dest=@CPF
          )

          SELECT CPF as cpf, DATAEMISSAO as dataEmissao, CNPJ as cnpj, LAT as lat, LNG as lng
          FROM NOTAS
      `)
      .then(result => {
          printTempoExecucao(tempoInicial, 'getGeocoordenadasMapaCalorCPFPeriodo');

          geoCoordenadasExistentes  = result.filter(d => !!d.lat && !!d.lng);
          geoCoordenadasFaltantes   = result.filter(d => !d.lat || !d.lng);
          const listaCNPJFaltantes  = geoCoordenadasFaltantes.map(d => d.cnpj);

          return (!!listaCNPJFaltantes.length) ? getEnderecosEmpresasFaltantes(listaCNPJFaltantes) : geoCoordenadasExistentes;
      })
      .then((resFaltantesEncontrados: any) => {
          resFaltantesEncontrados = resFaltantesEncontrados.filter(r => r !== null);

          if (geoCoordenadasFaltantes.length !== 0) {
              geoCoordenadasFaltantes = geoCoordenadasFaltantes.map(geo => {
                  const encontrado = resFaltantesEncontrados.filter(r => r.cnpj === geo.cnpj)[0];

                  if (encontrado && encontrado.lat && encontrado.lng) {
                      geo.lat = encontrado.lat;
                      geo.lng = encontrado.lng;

                      return geo;
                  } else {
                      return null;
                  }
              }).filter(r => r !== null);

              return geoCoordenadasExistentes.concat(geoCoordenadasFaltantes);
          } else {
              return geoCoordenadasExistentes;
          }

      }).then(geocoordenadas => {
          if (!geocoordenadas.length)
              return resultNotFound(`Nao foi possivel encontrar dados para ${cpf}.`, fonte);
          else {
              return resultFound(geocoordenadas, fonte, rank, grupo);
          }
      }).catch(error => logErroBuscaBD(error, `Falha na busca por dados de ${cpf}.`, 'getGeocoordenadasMapaCalorCPFPeriodo'));
};

let getEnderecosEmpresasFaltantes = function (listaCNPJ: Array<string>){

  const tempoInicial = new BenchmarkService();
  const lista = "'" + listaCNPJ.join("','") + "'";

  return db.query([
    ],`
        SELECT DISTINCT PJ.CNPJ as cnpj
            ,PJ.DescricaoTipoLogradouro + ' ' + PJ.Logradouro + ', ' + PJ.Numero + ', ' + PJ.Municipio COLLATE Latin1_General_CI_AS + ', Paraiba' AS addr

        FROM ${modelReceita.get('PJ')} PJ
        WHERE CNPJ IN (${lista})
    `)
    .then(enderecos => {
        printTempoExecucao(tempoInicial, 'getEnderecosEmpresasFaltantes');

        return criaListaPromisesBuscaGeoCoordenadas(enderecos);
    }).catch(error => logErroBuscaBD(error, `Falha na busca pelos enderecos de ${lista}.`, 'getEnderecosEmpresasFaltantes'));
};

let criaListaPromisesBuscaGeoCoordenadas = function (enderecos) {
    return Promise.all(enderecos.map(d => criaPromiseBuscaGeoCoordenadas(d)))
}

// endereco : {cnpj, addr}
let criaPromiseBuscaGeoCoordenadas = function (endereco) {

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${endereco.addr}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
  let options = {
      method: 'GET',
      uri: url,
      timeout: 120000,
      json: true
  };

  const tempoInicial = new BenchmarkService();

  return rp(options)
      .then(data => {
          printTempoExecucao(tempoInicial, 'criaPromiseBuscaGeoCoordenadas');

          if(data['status'] === 'OK') {
              const lat = data['results'][0]['geometry']['location']['lat'];
              const lng = data['results'][0]['geometry']['location']['lng'];

              // Preenche no banco se dados foram encontrados!
              if (lat && lng) {
                  const cnpj = endereco.cnpj;
                  insertGeoCoordenadasEmpresaCNPJ(cnpj, lat, lng);

                  return {
                      cnpj: cnpj,
                      lat: lat,
                      lng: lng
                  }
              } else {
                  return null;
              }
          } else {
              return null;
          }
      })
      .catch(error => { logger.error(error) });
}

let insertGeoCoordenadasEmpresaCNPJ = function (cnpj: string, lat: number, lng: number) {
    return db.query([
        ['CNPJ', ISql.Char(14), cnpj],
        ['LAT', ISql.Float, lat],
        ['LNG', ISql.Float, lng],
        ],`INSERT INTO ${modelConfig.get('PJ_GEOCOORDENADAS')}
                (CNPJ, LAT, LNG, FONTE)
                    VALUES
                (@CNPJ, @LAT, @LNG, 'RECEITANOVO')
        `)
        .then(result => {
            return true;
        }).catch(error => { return logErroBuscaBD(error, `Falha na insercao da geocoordenada.`, 'insertGeoCoordenadasEmpresaCNPJ'); });
}
