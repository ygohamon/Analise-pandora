// import * as rp from 'request-promise-native';

// import { MODEL_PRIORITY } from './../../config';

// import { resultNotFound, logErroBuscaBD, resultFoundRaw, trataResultadoBNMP, flat } from './../../utils';
// import { getModelConfig } from '../../config.models';

// const modelConfig = getModelConfig('BD_MANDADO');

// const fonte = MODEL_PRIORITY['cnj.bnmp.mandado'].fonte; // = 'bnmp.mandado';
// const rank = MODEL_PRIORITY['cnj.bnmp.mandado'].rank; // 1;
// const grupo = MODEL_PRIORITY['cnj.bnmp.mandado'].grupo; // 1;

// export const getMandadoSimplificadoCPF_BNMP = function(cpf: string) {
//   const reqCPF = {
//     criterio: {
//       orgaoJulgador: {},
//       orgaoJTR: {},
//       parte: {
//         documentos: [{ identificacao: cpf, tipoDocumento: 'CPF' }],
//       },
//     },
//     paginador: {},
//     fonetica: true,
//     ordenacao: {
//       porNome: false,
//       porData: false,
//     },
//   };

//   const options = {
//     method: 'POST',
//     uri: 'http://www.cnj.jus.br/bnmp/rest/pesquisar',
//     body: reqCPF,
//     timeout: 2000,
//     json: true,
//   };

//   return rp(options)
//     .then(data => {
//       if (data.sucesso) return resultFoundRaw(trataResultadoBNMP(data.mandados), fonte, rank, grupo);
//       else return resultNotFound(`Nao foi possivel encontrar mandados para ${cpf}.`, fonte);
//     })
//     .catch(error => {
//       return logErroBuscaBD(error, `Falha na busca pelo mandado de ${cpf}.`, 'getMandadoCPF_BNMP');
//     });
// };

// export const getMandadoSimplificadoNome_BNMP = function(nome: string, uf = 'PB') {
//   const reqNome = {
//     criterio: {
//       orgaoJulgador: {
//         uf: uf,
//       },
//       orgaoJTR: {},
//       parte: {
//         documentos: [{ identificacao: null }],
//       },
//       nomesParte: nome,
//     },
//     paginador: {
//       paginaAtual: 1,
//       registrosPorPagina: 200,
//     },
//     fonetica: true,
//     ordenacao: {
//       porNome: false,
//       porData: false,
//     },
//   };

//   const options = {
//     method: 'POST',
//     uri: 'http://www.cnj.jus.br/bnmp/rest/pesquisar',
//     body: reqNome,
//     timeout: 2000,
//     json: true,
//   };

//   return rp(options)
//     .then(data => {
//       if (data.sucesso) return resultFoundRaw(trataResultadoBNMP(data.mandados), fonte, rank, grupo);
//       else return resultNotFound(`Nao foi possivel encontrar mandados para ${nome}. em ${uf}`, fonte);
//     })
//     .catch(error => {
//       return logErroBuscaBD(error, `Falha na busca pelo mandado de ${nome} em ${uf}.`, 'getMandadoNome_BNMP');
//     });
// };

// export const getMandadoSimplificadoRG_BNMP = function(rg: string, uf = 'PB') {
//   const req = {
//     criterio: {
//       orgaoJulgador: {
//         uf: uf,
//       },
//       orgaoJTR: {},
//       parte: {
//         documentos: [{ identificacao: rg, tipoDocumento: 'RG' }],
//       },
//     },
//     paginador: {
//       paginaAtual: 1,
//       registrosPorPagina: 200,
//     },
//     fonetica: true,
//     ordenacao: {
//       porNome: false,
//       porData: false,
//     },
//   };

//   const options = {
//     method: 'POST',
//     uri: 'http://www.cnj.jus.br/bnmp/rest/pesquisar',
//     body: req,
//     timeout: 2000,
//     json: true,
//   };

//   return rp(options)
//     .then(data => {
//       if (data.sucesso) return resultFoundRaw(trataResultadoBNMP(data.mandados), fonte, rank, grupo);
//       else return resultNotFound(`Nao foi possivel encontrar mandados para ${rg}. em ${uf}`, fonte);
//     })
//     .catch(error => {
//       return logErroBuscaBD(error, `Falha na busca pelo mandado de ${rg} em ${uf}.`, 'getMandadoSimplificadoRG_BNMP');
//     });
// };

// const criaArrayPromise = function(dados) {
//   return dados.map(registro => {
//     const reqNome = { id: registro.id };

//     const options = {
//       method: 'POST',
//       uri: 'http://www.cnj.jus.br/bnmp/rest/detalhar',
//       body: reqNome,
//       timeout: 2000,
//       json: true,
//     };

//     return rp(options)
//       .then(data => {
//         if (data.sucesso) {
//           return resultFoundRaw([data.mandado], fonte, rank, grupo);
//         } else {
//           return resultNotFound(`Nao foi possivel encontrar mandados para ${registro.id}`, fonte);
//         }
//       })
//       .catch(error => {
//         return logErroBuscaBD(error, `Falha na busca pelo mandado de ${registro.id}`, 'criaArrayPromise');
//       });
//   });
// };

// export const getMandadoDetalhadoCPF_BNMP = function(cpf: string) {
//   return getMandadoSimplificadoCPF_BNMP(cpf).then(resultado => {
//     return Promise.all(criaArrayPromise(resultado.resultado.dados))
//       .then(mandadosDetalhados => flat(mandadosDetalhados))
//       .then(mandadosDetalhados => mandadosDetalhados[0]);
//   });
// };
