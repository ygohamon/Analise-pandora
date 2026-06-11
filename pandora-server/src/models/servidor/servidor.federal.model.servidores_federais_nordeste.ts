
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_TRANSPARENCIA');

const fonte = MODEL_PRIORITY['sispesquisa.servidores_federais_nordeste'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.servidores_federais_nordeste'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.servidores_federais_nordeste'].grupo;

export let getServidorFederalCPF_Sispesquisa_Servidores_Federais_Nordeste = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.NVarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF_SERVIDOR as cpf,
            CARGO as cargo,
            ORGAO as orgLotacao,
            UORG as unidOrgLotacao,
            UF_ORGANIZACAO as ufOrg,
            UPAG as uPag,
            JORNADA_TRABALHO as jornada,
            SITUACAO_VINCULO as situacao,
            REMUN as remuneracao

        FROM ${modelConfig.get('SERVIDORES_NORDESTE')}
        WHERE CPF_SERVIDOR=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
