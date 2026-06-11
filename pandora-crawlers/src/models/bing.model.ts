import { cheerios } from "../services/cheerio.service";
import { logger } from "../services/log.service";
import { getTime } from "../utils";

/**
 * Consulta ao Bing usando o Cheerio
 * @param url
 * @param isTor
 */
export const crequestBing = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);
  const params = (timeout) ? {timeout} : {};

  const url = `https://www.bing.com/search?q=${query}`;
  const itemsquery = 'li.b_algo';
  const parser = (selector) => {
    const titulo = selector
      .find('h2 a')
      .text()

    const url = selector
      .find('h2 a')
      .attr('href')

    const descricao = selector
      .find('.b_caption p')
      .text()

    return {titulo, url, descricao, fonte: 'bing'}
  }

  const cheerioSelector = (isTor) ?
    await cheerios.getTor(url, params) :
    await cheerios.get(url, params);

  return cheerioSelector(itemsquery)
    .get()
    .map(item => parser(cheerioSelector(item)))
    .map(s => Object.assign(s, {data_hora: getTime()}))
};

