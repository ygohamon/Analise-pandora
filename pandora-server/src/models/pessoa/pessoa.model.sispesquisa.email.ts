
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VIRTUAL');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['sispesquisa.emails.pessoa'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.emails.pessoa'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.emails.pessoa'].grupo;

export let getPessoaEmail_Sispesquisa_Emails = function (email: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['EMAIL', ISql.VarChar, email],
      ],`
          SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
              CPF as cpf,
              UPPER(Nome) as nome,
              UPPER(NomeMae) as nomeMae,
              UPPER(Municipio) as municipio,
              UPPER(UF) as uf,
              CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END as sexo,
              DataNascimento AS dataNascimento,
              '${modelConfig?.sigla}' as fonte

          FROM ${modelConfig.get('EMAIL')} E
              INNER JOIN ${modelReceita.get('PF')} PF ON (E.cpf_cnpj = PF.CPF)
          WHERE EMAIL=@EMAIL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
