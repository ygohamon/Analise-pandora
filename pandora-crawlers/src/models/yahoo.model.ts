import { cheerios } from "../services/cheerio.service";
import { getTime } from "../utils";

/**
 * Consulta ao Yahoo usando o Cheerio
 * @param url
 * @param isTor
 */
export const crequestYahoo = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);
  const params = (timeout) ? {timeout} : {};

  const url = `https://br.search.yahoo.com/search?p=${query}`;
  const itemsquery = '.dd.algo';
  const parser = (selector) => {
    const titulo = selector
      .find('div.compTitle h3.title a')
      .text()

    const url = selector
      .find('div.compTitle .title a')
      .attr('href')

    const descricao = selector
      .find('div.compText p')
      .text()

    return {titulo, url, descricao, fonte: 'yahoo'}
  }

  const cheerioSelector = (isTor) ?
    await cheerios.getTor(url, params) :
    await cheerios.get(url, params);

  return cheerioSelector(itemsquery)
    .get()
    .map(item => parser(cheerioSelector(item)))
    .map(s => Object.assign(s, {data_hora: getTime()}))
};

