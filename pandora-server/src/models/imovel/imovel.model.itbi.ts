
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PREFEITURA');

const fonte  = MODEL_PRIORITY['itbi'].fonte;
const rank   = MODEL_PRIORITY['itbi'].rank;
const grupo  = MODEL_PRIORITY['itbi'].grupo;

export let getMovelDetalhadoCPF_BD_ITBI = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        ;WITH TABELA(VALO_TITU, DATA_LANC, CODI_IMOV, CODI_PESS, CODI_TIPO, Data_Guia, Nume_Docu)
        AS
        (
          SELECT SUM(ISNULL(TIT.Valo_Titu,0)+ISNULL(TI.Valo_Desc,0)) AS Valo_Titu, MAX(TIT.Data_Lanc) AS Data_Lanc, MAX(TIT.Codi_Imov) as Codi_Imov, MAX(P.Codi_Pess) AS Codi_Pess, MAX(TIT.Codi_Tipo) as Codi_Tipo, MAX(TI.Data_Guia) as Data_Guia, MAX(TIT.Nume_Docu) AS Nume_Docu
          FROM ${modelConfig.get('TITULOS')} TIT
              INNER JOIN ${modelConfig.get('PESSOAS')} P ON (P.Codi_Pess = TIT.Codi_Pess)
              INNER JOIN ${modelConfig.get('TRANSFERENCIA_ITBI')} TI ON (TI.codi_imov = TIT.Codi_Imov AND ti.nume_guia = TIT.Nume_Docu)
          WHERE TIT.Codi_Tipo IN(1201,1202,1203,1204,1205,1206,1207,1208,1209,1210) --ITBI
              AND P.Cnpj_Cpf = @CPF
          GROUP BY TIT.Codi_Imov, TIT.Codi_Pess
        )
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            TI2.Nome_Tran AS proprietarioAnterior
            ,TI2.Docu_Tran as cpfCnPJAnterior
            ,P.Nome_Raza as nome
            ,P.Cnpj_Cpf as cpfCnpj

            --IMOVEL
            ,TP.Abre_Tplo as tipoLogradouro
            ,L.Desc_Logr as logradouro
            ,I.Nume_Imov as numero
            ,I.Bloc_Imov as bloco
            ,I.Apsa_Imov as apto
            ,B.Desc_Bair as bairro
            ,LB.Nume_Cep as cep

            --OPERACAO
            ,TNI2.desc_natu AS natureza
            ,TTI2.desc_tras as transacao

            --TITULOS
            ,(TIT.Valo_Titu / 3.00) * 100 as valorMercado
            ,AI.Valo_Aval as valorAvaliacao
            ,AI.Area_Priv as areaPrivTotal
            ,AI.Valo_Metr as valorMetro
            -- ,TRI.Desc_Tipo as tributo
            ,AI.Data_Aval as dtAvaliacao
            ,TIT.Data_Lanc as dtLancamento
            ,'${modelConfig.sigla}' as fonte

        FROM TABELA TIT
            INNER JOIN ${modelConfig.get('PESSOAS')} P ON (P.Codi_Pess = TIT.Codi_Pess)
            INNER JOIN ${modelConfig.get('TRIBUTOS')} TRI ON (TRI.Codi_Tipo = TIT.Codi_Tipo)
            INNER JOIN ${modelConfig.get('IMOVEIS')} I ON (I.Codi_Imov = TIT.Codi_Imov)
            INNER JOIN ${modelConfig.get('QUADRA')} F (NOLOCK) ON (I.CODI_SETO  = F.CODI_SETO  AND I.CODI_QUAD = F.CODI_QUAD  AND I.CODI_FACE = F.CODI_FACE)
            INNER JOIN ${modelConfig.get('LOGRADOUROS')}  L (NOLOCK) ON (F.CODI_LOGR  = L.CODI_LOGR)
            INNER JOIN ${modelConfig.get('BAIRROS')} B (NOLOCK) ON (F.CODI_BAIR  = B.CODI_BAIR)
            INNER JOIN ${modelConfig.get('LOGRA_BAIRROS')} LB (NOLOCK) ON (LB.CODI_LOGR = F.CODI_LOGR  AND LB.CODI_BAIR = F.CODI_BAIR)
            INNER JOIN ${modelConfig.get('TIPOS_LOGRA')} TP ON (TP.Codi_Tplo = L.Codi_Tplo)
            INNER JOIN ${modelConfig.get('TIPO_IMOVEL')} TPI (NOLOCK) ON (I.Codi_Tipo = TPI.Codi_Tipo)
            INNER JOIN ${modelConfig.get('AVAL_IMOVEIS')} AI ON (AI.Codi_Imov = TIT.Codi_Imov)
            INNER JOIN ${modelConfig.get('TRANSFERENCIA_ITBI')} TI2 ON (TI2.codi_imov = I.Codi_Imov AND TI2.nume_guia = TIT.Nume_Docu)
            INNER JOIN ${modelConfig.get('TIPOS_NATUREZA_ITBI')} TNI2 ON (TI2.codi_natu = TNI2.codi_natu)
            INNER JOIN ${modelConfig.get('TIPOS_TRANSFERENCIA_ITBI')} TTI2 ON (TTI2.codi_tras = TI2.codi_tras)
            LEFT OUTER JOIN ${modelConfig.get('TITULOS_LOGRA')} TL (NOLOCK) ON (L.CODI_TILO = TL.CODI_TILO)
        WHERE TIT.Codi_Tipo IN(1201,1202,1203,1204,1205,1206,1207,1208,1209,1210) --ITBI
        ORDER BY 1, TIT.Data_Lanc
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getMovelDetalhadoCNPJ_BD_ITBI = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        ;WITH TABELA(VALO_TITU, DATA_LANC, CODI_IMOV, CODI_PESS, CODI_TIPO, Data_Guia, Nume_Docu)
        AS
        (
          SELECT SUM(ISNULL(TIT.Valo_Titu,0)+ISNULL(TI.Valo_Desc,0)) AS Valo_Titu, MAX(TIT.Data_Lanc) AS Data_Lanc, MAX(TIT.Codi_Imov) as Codi_Imov, MAX(P.Codi_Pess) AS Codi_Pess, MAX(TIT.Codi_Tipo) as Codi_Tipo, MAX(TI.Data_Guia) as Data_Guia, MAX(TIT.Nume_Docu) AS Nume_Docu
          FROM ${modelConfig.get('TITULOS')} TIT
            INNER JOIN ${modelConfig.get('PESSOAS')} P ON (P.Codi_Pess = TIT.Codi_Pess)
            INNER JOIN ${modelConfig.get('TRANSFERENCIA_ITBI')} TI ON (TI.codi_imov = TIT.Codi_Imov AND ti.nume_guia = TIT.Nume_Docu)
          WHERE TIT.Codi_Tipo IN(1201,1202,1203,1204,1205,1206,1207,1208,1209,1210) --ITBI
              AND P.Cnpj_Cpf = @CNPJ
          GROUP BY TIT.Codi_Imov, TIT.Codi_Pess
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            TI2.Nome_Tran AS proprietarioAnterior
            ,TI2.Docu_Tran as cpfCnPJAnterior
            ,P.Nome_Raza as nome
            ,P.Cnpj_Cpf as cpfCnpj

            --IMOVEL
            ,TP.Abre_Tplo as tipoLogradouro
            ,L.Desc_Logr as logradouro
            ,I.Nume_Imov as numero
            ,I.Bloc_Imov as bloco
            ,I.Apsa_Imov as apto
            ,B.Desc_Bair as bairro
            ,LB.Nume_Cep as cep

            --OPERACAO
            ,TNI2.desc_natu AS natureza
            ,TTI2.desc_tras as transacao

            --TITULOS
            ,(TIT.Valo_Titu / 3.00) * 100 as valorMercado
            ,AI.Valo_Aval as valorAvaliacao
            ,AI.Area_Priv as areaPrivTotal
            ,AI.Valo_Metr as valorMetro
            -- ,TRI.Desc_Tipo as tributo
            ,AI.Data_Aval as dtAvaliacao
            ,TIT.Data_Lanc as dtLancamento
            ,'${modelConfig.sigla}' as fonte

        FROM TABELA TIT
            INNER JOIN ${modelConfig.get('PESSOAS')} P ON (P.Codi_Pess = TIT.Codi_Pess)
            INNER JOIN ${modelConfig.get('TRIBUTOS')} TRI ON (TRI.Codi_Tipo = TIT.Codi_Tipo)
            INNER JOIN ${modelConfig.get('IMOVEIS')} I ON (I.Codi_Imov = TIT.Codi_Imov)
            INNER JOIN ${modelConfig.get('QUADRA')} F (NOLOCK) ON (I.CODI_SETO  = F.CODI_SETO  AND I.CODI_QUAD = F.CODI_QUAD  AND I.CODI_FACE = F.CODI_FACE)
            INNER JOIN ${modelConfig.get('LOGRADOUROS')}  L (NOLOCK) ON (F.CODI_LOGR  = L.CODI_LOGR)
            INNER JOIN ${modelConfig.get('BAIRROS')} B (NOLOCK) ON (F.CODI_BAIR  = B.CODI_BAIR)
            INNER JOIN ${modelConfig.get('LOGRA_BAIRROS')} LB (NOLOCK) ON (LB.CODI_LOGR = F.CODI_LOGR  AND LB.CODI_BAIR = F.CODI_BAIR)
            INNER JOIN ${modelConfig.get('TIPOS_LOGRA')} TP ON (TP.Codi_Tplo = L.Codi_Tplo)
            INNER JOIN ${modelConfig.get('TIPO_IMOVEL')} TPI (NOLOCK) ON (I.Codi_Tipo = TPI.Codi_Tipo)
            INNER JOIN ${modelConfig.get('AVAL_IMOVEIS')} AI ON (AI.Codi_Imov = TIT.Codi_Imov)
            INNER JOIN ${modelConfig.get('TRANSFERENCIA_ITBI')} TI2 ON (TI2.codi_imov = I.Codi_Imov AND TI2.nume_guia = TIT.Nume_Docu)
            INNER JOIN ${modelConfig.get('TIPOS_NATUREZA_ITBI')} TNI2 ON (TI2.codi_natu = TNI2.codi_natu)
            INNER JOIN ${modelConfig.get('TIPOS_TRANSFERENCIA_ITBI')} TTI2 ON (TTI2.codi_tras = TI2.codi_tras)
            LEFT OUTER JOIN ${modelConfig.get('TITULOS_LOGRA')} TL (NOLOCK) ON (L.CODI_TILO = TL.CODI_TILO)
        WHERE TIT.Codi_Tipo IN(1201,1202,1203,1204,1205,1206,1207,1208,1209,1210) --ITBI
        ORDER BY 1, TIT.Data_Lanc
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
