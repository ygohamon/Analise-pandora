
import { db, ISql } from './../../../services/db.service';

import { resultFound, logErroBuscaBD, modelFactory as mf, getNomeFuncao } from './../../../utils';
import { MODEL_PRIORITY, API_CODES } from './../../../config';
import { getModelConfig } from '../../../config.models';

const modelConfig = getModelConfig('BD_INTEGRA');

const fonte = MODEL_PRIORITY['integra.requisicoes'].fonte;
const rank = MODEL_PRIORITY['integra.requisicoes'].rank;
const grupo = MODEL_PRIORITY['integra.requisicoes'].grupo;

export const insereRequisicao = function(requisicao) {
  return db.query([
    ['nome', ISql.NVarChar, requisicao.nome],
    ['email', ISql.NVarChar, requisicao.email],
    ['tipoReferencia', ISql.NVarChar, requisicao.tipoReferencia],
    ['doc', ISql.NVarChar, requisicao.doc],
    ['tipoArea', ISql.NVarChar, requisicao.tipoArea],
    ['tipoGrupo', ISql.NVarChar, requisicao.tipoGrupo],
    ['detalhesResumoDosFatos', ISql.NVarChar, requisicao.detalhesResumoDosFatos],
    ['detalhesFatoresAdversos', ISql.NVarChar, requisicao.detalhesFatoresAdversos],
    ['detalhesFinalidade', ISql.NVarChar, requisicao.detalhesFinalidade],
    ['tempoInformacao', ISql.Int, requisicao.tempoInformacao],
    ['idPromotoria', ISql.Int, requisicao.idPromotoria],
    ],`
      INSERT INTO ${modelConfig.get('REQUISICOES')}
        (NOME, EMAIL, TIPO_REFERENCIA, DOC, TIPO_AREA, TIPO_GRUPO, DETALHES_RESUMO_FATOS,
        DETALHES_FATORES_ADVERSOS, DETALHES_FINALIDADE, TEMPO_INFORMACAO, ID_PROMOTORIA )

      OUTPUT INSERTED.ID_REQUISICAO

      VALUES
        (@nome, @email, @tipoReferencia, @doc, @tipoArea, @tipoGrupo, @detalhesResumoDosFatos,
        @detalhesFatoresAdversos, @detalhesFinalidade, @tempoInformacao, @idPromotoria)
    `)
    .then(result =>  result[0]?.ID_REQUISICAO)
    .catch(error => {
      return logErroBuscaBD(error, `Falha na insercao da requisicao.`, 'insereRequisicao');
    });
};

export const insereImovel = function(requisicao, idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ['endereco', ISql.NVarChar, requisicao.endereco],
    ['necessidade', ISql.NVarChar, requisicao.necessidade],
    ],`
      INSERT INTO ${modelConfig.get('IMOVEIS')}
        (ID_REQUISICAO, ENDERECO, NECESSIDADE)

      VALUES
        (@idRequisicao, @endereco, @necessidade)
    `)
    .then(result => {
      return true;
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na insercao do imovel.`, 'insereImovel');
    });
};

export const insereVeiculo = function(requisicao, idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ['cpf', ISql.NVarChar, requisicao.cpf],
    ['placa', ISql.NVarChar, requisicao.placa],
    ['necessidade', ISql.NVarChar, requisicao.necessidade],
    ],`
      INSERT INTO ${modelConfig.get('VEICULOS')}
        (ID_REQUISICAO, CPF, PLACA, NECESSIDADE)
      VALUES
        (@idRequisicao, @cpf, @placa, @necessidade)
    `)
    .then(result => {
      return true;
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na insercao do veiculo.`, 'insereVeiculo');
    });
};

export const inserePF = function(requisicao, idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ['cpf', ISql.NVarChar, requisicao.cpf],
    ['identidade', ISql.NVarChar, requisicao.identidade],
    ['orgaoExpeditor', ISql.NVarChar, requisicao.orgaoExpeditor],
    ['ufOrgaoExpeditor', ISql.NVarChar, requisicao.ufOrgaoExpeditor],
    ['necessidade', ISql.NVarChar, requisicao.necessidade],
    ['nome', ISql.NVarChar, requisicao.nome],
    ['nomeMae', ISql.NVarChar, requisicao.nomeMae],
    ['nomePai', ISql.NVarChar, requisicao.nomePai],
    ],`
      INSERT INTO ${modelConfig.get('PESSOAS_FISICAS')}
        (ID_REQUISICAO, CPF, IDENTIDADE, ORGAO_EXPEDITOR, UF_ORGAO_EXPEDITOR,
        NECESSIDADE, NOME, NOMEMAE, NOMEPAI )
      VALUES
        (@idRequisicao, @cpf, @identidade, @orgaoExpeditor, @ufOrgaoExpeditor,
        @necessidade, @nome, @nomeMae, @nomePai)
    `)
    .then(result => {
      return true;
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na insercao da pessoa fisica.`, 'inserePF');
    });
};

export const inserePJ = function(requisicao, idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ['cnpj', ISql.NVarChar, requisicao.cnpj],
    ['nomeFantasia', ISql.NVarChar, requisicao.nomeFantasia],
    ['razaoSocial', ISql.NVarChar, requisicao.razaoSocial],
    ['necessidade', ISql.NVarChar, requisicao.necessidade],
    ],`
      INSERT INTO ${modelConfig.get('PESSOAS_JURIDICAS')}
        (ID_REQUISICAO, CNPJ, NOMEFANTASIA, RAZAOSOCIAL, NECESSIDADE)
      VALUES
        (@idRequisicao, @cnpj, @nomeFantasia, @razaoSocial, @necessidade)
    `)
    .then(result => {
      return true;
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na insercao da pessoa juridica.`, 'inserePJ');
    });
};

export const insereAnexo = function(requisicao, idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ['nomeArquivo', ISql.NVarChar, requisicao.originalname],
    ['arquivo', ISql.VarBinary, requisicao.buffer],
    ['mime', ISql.NVarChar, requisicao.mimetype],
    ],`
      INSERT INTO ${modelConfig.get('ANEXOS')}
        (ID_REQUISICAO, NOME_ARQUIVO, ARQUIVO, MIME)
      VALUES
        (@idRequisicao, @nomeArquivo, @arquivo, @mime)
    `)
    .then(result => {
      return true;
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na insercao do anexo ${requisicao.nomeArquivo}.`, 'insereAnexo');
    });
};

export const getAnexo = function(idAnexo) {
  return db.query([
    ['idAnexo', ISql.Int, idAnexo],
    ],`
      SELECT
          ARQUIVO as arquivo, NOME_ARQUIVO as nomeArquivo,
          DATALENGTH(ARQUIVO) AS tamanho, MIME as mime

      FROM ${modelConfig.get('ANEXOS')}
      WHERE ID_ANEXO=@idAnexo
    `)
    .then(result => result[0])
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca do anexo ${idAnexo}.`, 'getAnexo');
    });
};

const getAnexosRequisicao = function(idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ],`
      SELECT  ID_ANEXO as idAnexo, NOME_ARQUIVO as nomeArquivo

      FROM ${modelConfig.get('ANEXOS')}
      WHERE ID_REQUISICAO=@idRequisicao
    `)
    .then(result => {
      return {
        anexos: result,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca dos anexos de ${idRequisicao}.`, 'getAnexosRequisicao');
    });
};

const getImoveisRequisicao = function(idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ],`
      SELECT  ENDERECO as endereco, NECESSIDADE as necessidade

      FROM ${modelConfig.get('IMOVEIS')}
      WHERE ID_REQUISICAO=@idRequisicao
    `)
    .then(result => {
      return {
        imoveis: result,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca dos imoveis de ${idRequisicao}.`, 'getImoveisRequisicao');
    });
};

const getPFsRequisicao = function(idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ],`
      SELECT
          CPF as cpf, IDENTIDADE as identidade,
          ORGAO_EXPEDITOR as orgaoExpeditor, UF_ORGAO_EXPEDITOR as ufOrgaoExpeditor,
          NECESSIDADE as necessidade, NOME as nome, NOMEMAE as nomeMae,
          NOMEPAI as nomePai

      FROM ${modelConfig.get('PESSOAS_FISICAS')}
      WHERE ID_REQUISICAO=@idRequisicao
    `)
    .then(result => {
      return {
        pessoasFisicas: result,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca das pessoas fisicas de ${idRequisicao}.`, 'getPFsRequisicao');
    });
};

const getPJsRequisicao = function(idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ],`
      SELECT
        CNPJ as cnpj, NOMEFANTASIA as nomeFantasia,
        RAZAOSOCIAL as razaoSocial, NECESSIDADE as necessidade

      FROM ${modelConfig.get('PESSOAS_JURIDICAS')}
      WHERE ID_REQUISICAO=@idRequisicao
    `)
    .then(result => {
      return {
        pessoasJuridicas: result,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca das pessoas juridicas de ${idRequisicao}.`, 'getPJsRequisicao');
    });
};

const getVeiculosRequisicao = function(idRequisicao) {
  return db.query([
    ['idRequisicao', ISql.Int, idRequisicao],
    ],`
      SELECT  CPF as cpf, PLACA as placa, NECESSIDADE as necessidade

      FROM ${modelConfig.get('VEICULOS')}
      WHERE ID_REQUISICAO=@idRequisicao
    `)
    .then(result => {
      return {
        veiculos: result,
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca dos veiculos de ${idRequisicao}.`, 'getVeiculosRequisicao');
    });
};

const getExtras = function(requisicao) {
  return Promise.all([
    getAnexosRequisicao(requisicao.idRequisicao),
    getImoveisRequisicao(requisicao.idRequisicao),
    getPFsRequisicao(requisicao.idRequisicao),
    getPJsRequisicao(requisicao.idRequisicao),
    getVeiculosRequisicao(requisicao.idRequisicao),
  ]).then(extras => {
    extras.forEach(extra => {
      const nomeAtributo = Object.keys(extra)[0];
      const atributo = extra[nomeAtributo];
      requisicao[nomeAtributo] = atributo;
    });
    return requisicao;
  });
};

export const getRequisicoes = function() {
  let resultadoRequisicoes;

  return db.query([
    ],`
      SELECT
          ID_REQUISICAO as idRequisicao, NOME as nome, EMAIL as email,
          TIPO_REFERENCIA as tipoReferencia, DOC as doc, TIPO_AREA as tipoArea,
          TIPO_GRUPO as tipoGrupo, DETALHES_RESUMO_FATOS as detalhesResumoDosFatos,
          DETALHES_FATORES_ADVERSOS as detalhesFatoresAdversos,
          DETALHES_FINALIDADE as detalhesFinalidade, TEMPO_INFORMACAO as tempoInformacao,
          FINALIZADO as finalizado, PROMOTORIAS.DESCRICAO as promotoria,
          DT_REQUISICAO as dataRequisicao
      FROM ${modelConfig.get('REQUISICOES')}
      INNER JOIN ${modelConfig.get('PROMOTORIAS')} ON (REQUISICOES.ID_PROMOTORIA = PROMOTORIAS.ID_PROMOTORIA)
    `)
    .then(result => resultFound(result, fonte, rank, grupo))
    .then(result => {
      resultadoRequisicoes = result;
      return Promise.all(result.resultado.dados.map(requisicao => getExtras(requisicao)));
    })
    .then(r => {
      resultadoRequisicoes.resultado.dados = r;
      return resultadoRequisicoes;
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na busca das requisicoes do sistema.`, 'getRequisicoes');
    });
};

export const finalizaRequisicao = function(id: string) {
  return db.query([
    ['idRequisicao', ISql.Int, id],
    ],`
      UPDATE  ${modelConfig.get('REQUISICOES')}

      SET FINALIZADO=1
      WHERE ID_REQUISICAO=@idRequisicao
    `)
    .then(result => {
      return {
        status: API_CODES.CODE_SUCESSO,
        msg: 'Requisição finalizada com sucesso.',
      };
    })
    .catch(error => {
      return logErroBuscaBD(error, `Falha na finalização da requisição ${id}.`, 'finalizaRequisicao');
    });
};

export const getPromotoriasMPPB_Integra_Promotorias = function(promotoria: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['PROMOTORIA', ISql.VarChar, '%' + promotoria + '%'],
      ],`
        SELECT
          ID_PROMOTORIA as id, DESCRICAO as descricao
        FROM ${modelConfig.get('PROMOTORIAS')}
        WHERE DESCRICAO LIKE @PROMOTORIA COLLATE Latin1_General_CI_AI
        ORDER BY 2
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

//https://www.robtex.com/api/
//https://freeapi.robtex.com/ipquery/186.215.248.218
//http://ipinfo.io/186.215.248.218

//https://github.com/IonicaBizau/node-ipinfo
//https://github.com/bluesmoon/node-geoip
