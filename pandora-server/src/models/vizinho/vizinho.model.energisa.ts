
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao, first } from '../../utils';

const modelConfig = getModelConfig('BD_ENERGISA');

const fonte = MODEL_PRIORITY['energisa.vizinho'].fonte;
const rank = MODEL_PRIORITY['energisa.vizinho'].rank;
const grupo = MODEL_PRIORITY['energisa.vizinho'].grupo;

export const getVizinhosCPF_Energisa = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const distanciaCorte = 30;

  const query = () => {
    return db.query([['CPF', ISql.Char(11), cpf]], `EXECUTE ${modelConfig.get('USP_ENERGIA_PESQUISAR_CPF')} @CPF`)
      .then(dados => {
        if (dados.length) {
          const pessoa = first(dados);
          return db.query([], `EXECUTE ${modelConfig.get('USP_ENERGIA_PESQUISAR_VIZINHOS')} ${pessoa.latitude}, ${pessoa.longitude}`)
            .then(resultado => resultado.map(d => {
                return {
                  nome: d.NOME,
                  cpf: d.CPF,
                  dataNascimento: null,
                  logradouro: d.LOGRADOURO,
                  numero: d.NUMERO,
                  tipoLogradouro: null,
                  complemento: d.COMPLEMENTO,
                  distancia: d.DISTANCIA_METROS,
                  lat: d.latitude,
                  lng: d.longitude,
                  fonte: modelConfig.sigla,
                  ...(cpf === d.CPF && { alvo: true })
                }
              }).filter(d => d.distancia < distanciaCorte).slice(0, API_CONFIG.SERVER_MAX_RESULTS))
        } else {
          return dados;
        }
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
