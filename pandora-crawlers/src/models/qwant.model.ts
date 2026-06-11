// import { gots } from '../services/got.service';
// import { getTime } from "../utils";

// /**
//  * Consulta ao Qwant usando o Cheerio
//  * @param url
//  * @param isTor
//  */
// export const crequestQwant = async function (urlquery) {

//   const query = urlquery.q;
//   const isTor = (urlquery.tor === 's') ? true : false;
//   const timeout = parseInt(urlquery.timeout);
//   const params = (timeout) ? {timeout} : {};

//   const urlparams = `count=10&q=${query}&t=web&device=desktop&extensionDisabled=true&safesearch=1&locale=pt_BR&uiv=4`
//   const url = `https://api.qwant.com/api/search/web?${urlparams}`;

//   const config = {
//     headers: {
//       'authority': 'api.qwant.com',
//       'pragma': 'no-cache',
//       'cache-control': 'no-cache',
//       'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
//       'content-type': 'application/x-www-form-urlencoded',
//       'accept': '*/*',
//       'origin': 'https://www.qwant.com',
//       'sec-fetch-site': 'same-site',
//       'sec-fetch-mode': 'cors',
//       'sec-fetch-dest': 'empty',
//       'referer': 'https://www.qwant.com/',
//       'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7'
//     }
//   }

//   const r:any = (isTor) ?
//     await gots.getTor(url, {...config, ...params}) :
//     await gots.get(url, {...config, ...params})

//   const resultado = JSON.parse(r.body);

//   if (!resultado){
//     return null;
//   } else {
//     return resultado?.data?.result?.items?.map(d => {
//       return {
//         titulo: d.title,
//         url: decodeURIComponent(d.url),
//         descricao: d.desc,
//         fonte: 'qwant',
//         data_hora: getTime()
//       }
//     });
//   }

// };

