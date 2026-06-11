
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SISPESQUISA_RENACH');

const fonte = MODEL_PRIORITY['sispesquisa.veiculos_novo.endereco'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.veiculos_novo.endereco'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.veiculos_novo.endereco'].grupo;

export let getEnderecoCPF_Sispesquisa_VeiculosNovo = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF_CNPJ_Proprietario as cpf, Nome_Proprietario as nome,
            Endereco as logradouro, Bairro as bairro,
            CEP as cep, Municipio_Residencia as municipio, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('VEICULO')}
        WHERE CPF_CNPJ_Proprietario=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEnderecoCNPJ_Sispesquisa_VeiculosNovo = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF_CNPJ_Proprietario as cnpj, Nome_Proprietario as razaoSocial,
            Endereco as logradouro, Bairro as bairro,
            CEP as cep, Municipio_Residencia as municipio, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('VEICULO')}
        WHERE CPF_CNPJ_Proprietario=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
