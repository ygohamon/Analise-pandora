
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

import {
  resultNotFound,
  logErroBuscaBD,
  modelFactory as mf,
  getNomeFuncao
} from './../../utils';

const modelConfig = getModelConfig('BD_RECEITANOVO');

const fonte = MODEL_PRIORITY['receitanovo.pessoajuridica.filial'].fonte;
const rank  = MODEL_PRIORITY['receitanovo.pessoajuridica.filial'].rank;
const grupo = MODEL_PRIORITY['receitanovo.pessoajuridica.filial'].grupo;

export const getFilialEmpresaDetalhadoCNPJ_ReceitaNovo_PessoaJuridica = function (cnpj: string) {

  return db.query([
    ['cnpj', ISql.Char(14), cnpj],
    ],`
      SELECT
          CNPJ as cnpj, IdentificadorMatrizFilial as matriz

      FROM ${modelConfig.get('PJ')}
      WHERE CNPJ=@cnpj AND IdentificadorMatrizFilial = 1
    `)
    .then(result => {
        if (result.length === 0)
            return resultNotFound(`Nao foi possivel encontrar a filial de ${cnpj}.`, fonte);
        else
            return getFilialEmpresa_ReceitaNovo(cnpj);
    }).catch(error => logErroBuscaBD(error, `Falha na busca pela filial de ${cnpj}.`, 'getFilialEmpresaDetalhadoCNPJ_ReceitaNovo_PessoaJuridica'));
};


const getFilialEmpresa_ReceitaNovo = function(cnpj: string) {

  const inicioCnpj = cnpj.substring(0, 10);

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.VarChar, inicioCnpj + '%'],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj,
            NomeFantasia as nomeFantasia,
            RazaoSocial as razaoSocial,
            cast(DataInicioAtividade as date) as dataInicioAtividade,
            Municipio as municipio,
            DescricaoTipoLogradouro as tipoLogradouro,
            Logradouro as logradouro,
            UF as uf,
            '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ LIKE @cnpj AND IdentificadorMatrizFilial != 1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
