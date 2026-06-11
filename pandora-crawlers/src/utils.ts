import moment = require('moment');
import { logger } from './services/log.service';

/**
 * Extrai a hora do sistema
 */
export const getTime = function(formato: string = null) {
  return (!formato) ?
    moment().format('YYYY-MM-DDTHH:mm:ss') :
    moment().format(formato);
}

// Transforma um array de arrays em array
export const flatten = function (array){
  return [].concat.apply([], array);
}

export const allSettled = function (promises) {
  let mappedPromises = promises.map((p) => {
    return p
      .then((value) => {
        return {
          status: 'fulfilled',
          value,
        };
      })
      .catch((reason) => {
        return {
          status: 'rejected',
          reason,
        };
      });
  });
  return Promise.all(mappedPromises);
};

export const processAllSettled = function (dados) {
  return dados
    .filter(d => d.status === 'fulfilled')
    .map(d => d.value)
}

export let print = function (data, header=null){
  if (header){
    logger.debug(header);
  }
  logger.debug(JSON.stringify(data, null, 4));

  return data;
}

export const limpaUrl = function(url) {
  return url
    .replace('+', '%2B');
}
