
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_TELEFONE');

const fonte   = MODEL_PRIORITY['sispesquisa.telefones.pessoa'].fonte;
const rank    = MODEL_PRIORITY['sispesquisa.telefones.pessoa'].rank;
const grupo   = MODEL_PRIORITY['sispesquisa.telefones.pessoa'].grupo;

export let getPessoaTelefone_Sispesquisa_Telefones = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.NVarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            cpf_cnpj as cpf, telefone, fonte

        FROM ${modelConfig.get('TELEFONE')}
        WHERE telefone=@TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
