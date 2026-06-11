
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ELEITORAL');
const modelBDReceitaFull = getModelConfig('BD_RECEITAFULL');
const modelReceitaNovo = getModelConfig('BD_RECEITANOVO');

const fonte = MODEL_PRIORITY['filiacao'].fonte;
const rank  = MODEL_PRIORITY['filiacao'].rank;
const grupo = MODEL_PRIORITY['filiacao'].grupo;

export let getFiliacaoPartidariaDetalhadoCPF_Filiados = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            F.dataExtracao, R.cpf, F.siglaPartido, F.nomePartido
            ,F.uf, F.municipio, F.zonaEleitoral, F.secaoEleitoral
            ,F.dataFiliacao, F.situacaoRegistro, F.tipoRegistro
            ,F.dataProcessamento, F.dataDesfiliacao, F.dataCancelamento
            ,F.dataRegularizacao, UPPER(F.motivoCancelamento) AS motivoCancelamento
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('FILIACAO')} F
        OUTER APPLY
        (
        SELECT CPF, PF.TituloEleitor FROM ${modelBDReceitaFull.get('PF')} PF		 	
          WHERE PF.cpf=@CPF
        UNION
        SELECT CPF, PF.TituloEleitor FROM ${modelReceitaNovo.get('PF')} PF
          WHERE PF.cpf=@CPF
        ) AS R
        WHERE F.numInscricao = TRY_CONVERT(FLOAT, R.TITULOELEITOR)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
