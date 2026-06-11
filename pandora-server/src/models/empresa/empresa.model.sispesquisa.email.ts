
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VIRTUAL');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['sispesquisa.emails.pessoa'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.emails.pessoa'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.emails.pessoa'].grupo;

export let getEmpresaEmail_Sispesquisa_Emails = function (email: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['EMAIL', ISql.VarChar, email],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj,
            NomeFantasia as nomeFantasia,
            RazaoSocial as razaoSocial,
            Municipio as municipio,
            UF as uf,
            cast(DataInicioAtividade as date) as dataInicioAtividade,
            '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('EMAIL')} E
          INNER JOIN ${modelReceita.get('PJ')} PJ ON (E.cpf_cnpj = PJ.CNPJ)
        WHERE EMAIL = @EMAIL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
