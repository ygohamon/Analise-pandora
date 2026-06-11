
import { db, ISql } from '../../services/db.service';
import { API_CONFIG, MODEL_PRIORITY } from './../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_IMAGENS');

const fonte = MODEL_PRIORITY['bd_imagens.imagens_pf'].fonte;
const rank  = MODEL_PRIORITY['bd_imagens.imagens_pf'].rank;
const grupo = MODEL_PRIORITY['bd_imagens.imagens_pf'].grupo;

export let getFotoCPF_BDImagens = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            img_base64 as img,
            LOWER(TP.DE_IMG) as tipo,
            '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('IMAGENS')} I
            INNER JOIN ${modelConfig.get('TP_IMAGEM')} TP ON (I.tp_img = TP.TP_IMG)
        WHERE CPF=@cpf
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
