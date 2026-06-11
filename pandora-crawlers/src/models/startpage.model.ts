// import { cheerios } from "../services/cheerio.service";
// import { getTime } from "../utils";

// /**
//  * Consulta ao Start Page usando o Cheerio
//  * @param url
//  * @param isTor
//  */
// export const crequestStartPage = async function (urlquery) {

//   const query = urlquery.q;
//   const isTor = (urlquery.tor === 's') ? true : false;
//   const timeout = parseInt(urlquery.timeout);
//   const params = (timeout) ? {timeout} : {};

//   const url = 'https://www.startpage.com/sp/search';
//   const config = {
//     headers: {
//       'authority': 'www.startpage.com',
//       'pragma': 'no-cache',
//       'cache-control': 'no-cache',
//       'upgrade-insecure-requests': '1',
//       'origin': 'https://www.startpage.com',
//       'content-type': 'application/x-www-form-urlencoded',
//       'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
//       'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//       'sec-fetch-site': 'same-origin',
//       'sec-fetch-mode': 'navigate',
//       'sec-fetch-user': '?1',
//       'sec-fetch-dest': 'document',
//       'referer': 'https://www.startpage.com/',
//       'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7'
//     },
//     form: {
//       'query': `${query}`,
//       'language': 'english',
//       'lui': 'portugues',
//       'cat': 'web',
//       'sc': 'PIpLuSWw93Lk10',
//       'abp': '1'
//     }
//   }

//   const itemsquery = '.w-gl__result';
//   const parser = (selector) => {
//     const titulo = selector
//       .find('a.w-gl__result-title')
//       .text()
//       .trim()

//     const url = selector
//       .find('a.w-gl__result-title')
//       .attr('href')

//     const descricao = selector
//       .find('.w-gl__description')
//       .text()

//     return {titulo, url, descricao, fonte: 'startpage'}
//   }

//   const cheerioSelector = (isTor) ?
//     await cheerios.postTor(url, {...config, ...params}) :
//     await cheerios.post(url, {...config, ...params});

//   return cheerioSelector(itemsquery)
//     .get()
//     .map(item => parser(cheerioSelector(item)))
//     .map(s => Object.assign(s, {data_hora: getTime()}))
// };

