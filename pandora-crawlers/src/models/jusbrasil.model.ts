import { puppeteers } from '../services/puppeteer.service';
import { getTime } from "../utils";

/**
 * Consulta ao Jusbrasil usando o Puppeteer
 * @param url
 * @param isTor
 */
export const prequestJusbrasil = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);

  const url = `https://www.jusbrasil.com.br/busca?q=${query}`;
  const parser = async ({ page, data: {url, timeout} }) => {
    await page.setDefaultNavigationTimeout(timeout);
    await page.goto(url);
    return await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('.DocumentSnippet');
      items.forEach((item:any) => {
        results.push({
          titulo: item.querySelector('.BaseSnippetWrapper-title a')?.text,
          url: item.querySelector('.BaseSnippetWrapper-title a')?.href,
          descricao: item.querySelector('.BaseSnippetWrapper-body div')?.textContent.slice(0, 512),
          fonte: 'jusbrasil'
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
