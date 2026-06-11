
import { db, ISql } from '../../services/db.service';
import { getEnderecoCPF_ReceitaNovo_PessoaFisica } from './../endereco';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { filtraLogradouro, toTextSearch } from './../../utils';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../utils';

const modelConfig = getModelConfig('BD_RECEITANOVO');

const fonte = MODEL_PRIORITY['receitanovo.vizinho'].fonte;
const rank = MODEL_PRIORITY['receitanovo.vizinho'].rank;
const grupo = MODEL_PRIORITY['receitanovo.vizinho'].grupo;

const getVizinhoPFReceitaNovoLogradouro = function(cpf: string, logradouroFullText: string, numero: string, municipio: string, nomeFuncao) {
  const _numero = parseInt(numero, 10);
  const _offset = 10;

  const condicao_numero = isNaN(_numero) ? `numero = 0` : `numero BETWEEN ${_numero - _offset} AND ${_numero + _offset}`;

  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ['LOGRADOURO', ISql.VarChar, logradouroFullText],
      ['NUMERO_MIN', ISql.Int, _numero - _offset],
      ['NUMERO_MAX', ISql.Int, _numero + _offset],
      ['MUNICIPIO', ISql.VarChar, municipio],
      ],`
        ;WITH PESSOAS_MESMA_RUA(cpf)
        AS
        (
          SELECT
            CPF as cpf
          FROM ${modelConfig.get('PF')}
          WHERE CONTAINS(Logradouro, @LOGRADOURO) AND Municipio = @MUNICIPIO
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            P.CPF as cpf, PF.NOME as nome, PF.DataNascimento as dataNascimento,
            PF.Logradouro as logradouro,
            CASE
              WHEN TRY_CAST(PF.numeroLogradouro as int) IS NULL THEN 0
              ELSE CAST(PF.numeroLogradouro as int)
            END as numero,
            PF.TipoLogradouro as tipoLogradouro,
            PF.Complemento as complemento,
            '${modelConfig.sigla}' as fonte

        FROM PESSOAS_MESMA_RUA P
            INNER JOIN ${modelConfig.get('PF')} PF ON (PF.CPF = P.CPF)
        WHERE (TRY_CAST(PF.numeroLogradouro AS INT) IS NOT NULL
            AND TRY_CAST(PF.numeroLogradouro AS INT) BETWEEN ${_numero - _offset} AND ${_numero + _offset})
            AND P.CPF <> @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVizinhosReceitaNovoCPF = function(cpf: string) {
  return getEnderecoCPF_ReceitaNovo_PessoaFisica(cpf)
    .then(res => {
      const endereco = res.resultado.dados[0];
      const listaLogradouro = toTextSearch(filtraLogradouro(endereco.logradouro));

      return getVizinhoPFReceitaNovoLogradouro(cpf, listaLogradouro, endereco.numero, endereco.municipio, 'getVizinhosReceitaNovoCPF');
    })
    .catch(error => {
      return [];
    });
};
