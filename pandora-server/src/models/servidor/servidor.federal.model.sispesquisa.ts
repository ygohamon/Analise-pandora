
import { db, ISql } from '../../services/db.service';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';

const modelConfig = getModelConfig('BD_TRANSPARENCIA');

const fonte  = MODEL_PRIORITY['sispesquisa.servidores_federais'].fonte;
const rank   = MODEL_PRIORITY['sispesquisa.servidores_federais'].rank;
const grupo  = MODEL_PRIORITY['sispesquisa.servidores_federais'].grupo;

export let getServidorFederalCPF_Sispesquisa_Servidores_Federais = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.NVarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          CPF as cpf,
          DESCRICAO_CARGO as cargo,
          ATIVIDADE as funcaoAtividade,
          UORG_LOTACAO as unidOrgLotacao,
          ORG_LOTACAO as orgLotacao,
          DATA_INGRESSO_CARGOFUNCAO as dataIngressoCargo,
          DATA_INGRESSO_ORGAO as dataIngressoOrgao,
          UF_EXERCICIO as ufExercicio,
          dt_cadastro as dataCadastro,
          fonte

        FROM ${modelConfig.get('SERVIDORES_FEDERAIS')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
