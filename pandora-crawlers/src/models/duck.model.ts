import { cheerios } from '../services/cheerio.service';
import { puppeteers } from '../services/puppeteer.service';
import { getTime } from "../utils";

/**
 * Consulta ao DuckDuckGo usando o Puppeteer
 * @param url
 * @param isTor
 */
export const prequestDuck = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);

  const url = `https://duckduckgo.com/?q=${query}`;
  const parser = async ({ page, data: {url, timeout} }) => {
    await page.setDefaultNavigationTimeout(timeout);
    await page.goto(url);
    return await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('.result.results_links_deep');
      items.forEach((item:any) => {
        results.push({
          titulo: item.querySelector('.result__a')?.text,
          url: item.querySelector('.result__a')?.href,
          descricao: item.querySelector('.result__snippet')?.textContent,
          fonte: 'duck'
        });
      });

      return results;
    })
  }

  try {
    const items = (isTor) ?
      await puppeteers.getTor({url, timeout}, parser) :
      await puppeteers.get({url, timeout}, parser);

    if (items.length) {
      return items.map(i => Object.assign(i, {data_hora: getTime()}));
    } else {
      return [];
    }
  } catch (error) {
    return null;
  }
};


/**
 * Consulta ao DuckDuckGo usando o Cheerio
 * @param url
 * @param isTor
 */
export const crequestDuck = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);
  const params = (timeout) ? {timeout} : {};

  const url = `https://duckduckgo.com/html/?q=${query}`;
  const itemsquery = '.result.results_links_deep';
  const parser = function(selector) {
    const titulo = selector
    .find('.result__title a')
    .text()

    const url = decodeURIComponent(selector
      .find('.result__title a')
      .attr('href')
      .replace('//duckduckgo.com/l/?uddg=', ''))

    const descricao = selector
      .find('.result__snippet')
      .text()

    return {titulo, url, descricao, fonte: 'duck'}
  }

  const cheerioSelector = (isTor) ?
    await cheerios.getTor(url, params) :
    await cheerios.get(url, params);

  return cheerioSelector(itemsquery)
    .get()
    .map(item => parser(cheerioSelector(item)))
    .map(dado => Object.assign(dado, {data_hora: getTime()}))
    .filter(dado => dado?.titulo !== 'No  results.')
};

