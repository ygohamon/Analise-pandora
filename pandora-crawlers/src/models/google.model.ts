import { cheerios } from '../services/cheerio.service';
import { puppeteers } from '../services/puppeteer.service';
import { getTime } from "../utils";

/**
 * Consulta ao Google usando o Puppeteer
 * @param url
 * @param isTor
 */
export const prequestGoogle = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);

  const url = `https://www.google.com.br/search?q=${query}`;
  const parser = async ({ page, data: {url, timeout} }) => {
    await page.setDefaultNavigationTimeout(timeout);
    await page.goto(url);
    return await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('.g');

      items.forEach((item:any) => {
        results.push({
          titulo: item.querySelector('a h3')?.textContent,
          url: item.querySelector('a')?.href,
          descricao: item.querySelector('div > span > span')?.textContent,
          fonte: 'google'
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
 * Consulta ao Google usando o Cheerio
 * @param url
 * @param isTor
 */
export const crequestGoogle = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);
  const params = (timeout) ? {timeout} : {};

  const url = `https://www.google.com.br/search?q=${query}`;
  const itemsquery = '.g';
  const parser = (selector) => {
    const titulo = selector
      .find('div.r .ellip')
      .text()

    const url = selector
      .find('div.r a')
      .attr('href')

    const descricao = selector
      .find('div.s .st')
      .text()

    return {titulo, url, descricao, fonte: 'google'}
  }

  const cheerioSelector = (isTor) ?
    await cheerios.getTor(url, params) :
    await cheerios.get(url, params);

  return cheerioSelector(itemsquery)
    .get()
    .map(item => parser(cheerioSelector(item)))
    .map(s => Object.assign(s, {data_hora: getTime()}))
};

