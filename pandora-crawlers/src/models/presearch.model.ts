import { getTime } from "../utils";
import { puppeteers } from '../services/puppeteer.service';

/**
 * Consulta ao Presearch usando o Puppeteer
 * @param url
 * @param isTor
 */
export const requestPresearch = async function (urlquery) {

  const query = urlquery.q;
  const isTor = (urlquery.tor === 's') ? true : false;
  const timeout = parseInt(urlquery.timeout);
  const url = `https://engine.presearch.org/search?q=${query}`;

  const parser = async ({ page, data: {url} }) => {
    await page.goto(url);// vai pegar a url que foi setado no async do parse que foi declarado a constante acima
    await page.waitForTimeout(10000);// aqui setamos o tempo de espera para o carregamento da pagina. tempo em MS 10000 = 10 seg
    //vale ressaltar que é especifico do presearch pois se não o puppeteer tenta encontrar as query antes do carregamento da pagina, resultando assim em erro.


    return await page.evaluate(() => { // retornando o evento da pagina.
      const results = []; // vai ser criada um Arry de resultados de acordo com a query.

      const items = document.querySelectorAll('div.mx-2.md\\:mx-0.md\\:mr-0.md\\:max-w-xl.lg\\:max-w-2xl.pr-4.p-4.bg-white.dark\\:bg-background-dark200.shadow.rounded.mb-3');
      //querySelectorAll é o bloco em que estou selecionando para obter essas informações, no caso do presearch ele não possui classes propias no html, então foi colocado o caminho do javascript.

      items.forEach((item:any) => {
        results.push({ //aqui vou setar a query especifica do que eu quero trazer para o resultado, obs: pegando o caminho do javascript
          titulo: item.querySelector('div > div > div > div > a > span')?.textContent,
          url: item.querySelector('div > div > div > div > a')?.href,
          descricao: item.querySelector('div > div > div')?.textContent,
          fonte: 'presearch'
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
