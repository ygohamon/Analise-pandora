import { puppeteers } from '../services/puppeteer.service';
import { getTime } from "../utils";

/**
 * Consulta ao Lukol usando o Puppeteer
 * @param url
 * @param isTor
 */
export const prequestLukol = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);

  const url = `https://lukol.com/s.php?q=${query}`;
  const parser = async ({ page, data: {url, timeout} }) => {
    await page.setDefaultNavigationTimeout(timeout)
    await page.goto(url);
    return await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('.gsc-webResult .gs-webResult.gs-result');
      items.forEach((item:any) => {
        results.push({
          titulo: item.querySelector('a.gs-title')?.text,
          url: item.querySelector('a.gs-title')?.href,
          descricao: item.querySelector('.gs-snippet')?.textContent.slice(0, 512),
          fonte: 'lukol'
        });
      });

      return results.filter(r => r.descricao !== 'No Results');
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
