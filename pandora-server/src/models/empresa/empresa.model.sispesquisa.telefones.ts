
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG} from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_TELEFONE');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['sispesquisa.telefones.empresa'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.telefones.empresa'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.telefones.empresa'].grupo;

export let getEmpresaTelefone_Sispesquisa_Telefones = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PJ.CNPJ as cnpj,
            PJ.NomeFantasia as nomeFantasia,
            PJ.RazaoSocial as razaoSocial,
            PJ.Municipio as municipio,
            PJ.UF as uf,
            cast(DataInicioAtividade as date) as dataInicioAtividade,
            fonte

        FROM ${modelConfig.get('TELEFONE')} T
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (T.cpf_cnpj = PJ.CNPJ)
        WHERE telefone=@TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
