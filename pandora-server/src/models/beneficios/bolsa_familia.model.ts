
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_BOLSAFAMILIA');

const fonte = MODEL_PRIORITY['bolsa_familia'].fonte;
const rank  = MODEL_PRIORITY['bolsa_familia'].rank;
const grupo = MODEL_PRIORITY['bolsa_familia'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  BF.Municipio as agenciaMunicipio,
  BF.UF as agenciaUf,
  BF.NomeTitular as nome,
  CAD.CPF as cpf,
  BF.NisTitular as nis,
  BF.CompetFolha as competenciaFolha,
  BF.VlrTotal as vlrTotal,
  BF.Endereco as logradouro,
  BF.Localidade as municipio,

  BF.NISDEPENDEN as nisDependente,
  BF.Dependente as nomeDependente,
  BF.Idade as idadeDependente,
  BF.RendaPerc as rendaPerCapita,
  BF.Renda_com_PBF as rendaComPBF,
  BF.QTDE_MEMBROS as qtdMembros,

  CAD.COD_FAMILIAR as codFamiliar,
  CAD.NUM_MEMBROS_FAM as numMembros,
  CAD.VLR_RENDA_FAM as vlrRendaFamilia,
  'bolsa_familia' as tipo
`;

export let getBolsaFamiliaCPF_BolsaFamilia = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM (
            SELECT * FROM ${modelConfig.get('BF2014')}
            UNION ALL
            SELECT * FROM ${modelConfig.get('BF2015')}
            UNION ALL
            SELECT * FROM ${modelConfig.get('BF2016')}
        ) AS BF
          INNER JOIN ${modelConfig.get('CAD')} AS CAD ON (BF.NISTitular = CAD.NIS)
        WHERE CAD.CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getBolsaFamiliaNIS_BolsaFamilia = function (nis: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['nis', ISql.VarChar, nis],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM (
            SELECT * FROM ${modelConfig.get('BF2014')}
            UNION ALL
            SELECT * FROM ${modelConfig.get('BF2015')}
            UNION ALL
            SELECT * FROM ${modelConfig.get('BF2016')}
        ) AS BF
          INNER JOIN ${modelConfig.get('CAD')} AS CAD ON (BF.NISTitular = CAD.NIS)
        WHERE CAD.NIS=@nis
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
