
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao, resultFoundRaw } from './../../utils';

const modelConfig  = getModelConfig('BD_SASP_PMPB');
const fnRetorno = resultFoundRaw;

const fonte   = MODEL_PRIORITY['sasp'].fonte;
const rank    = MODEL_PRIORITY['sasp'].rank;
const grupo   = MODEL_PRIORITY['sasp'].grupo;

const ATRIBUTOS_PESSOA = `
  alcunha.alcunha as alcunha,
  documento.tipo as tipo_documento,
  documento.numeracao as documento,
  documento.nome as nome,
  documento.nome_mae as mae,
  documento.nome_pai as pai,
  documento.data_nascimento as nascimento,
  fotos.descricao as descricao_foto,
  fotos.path_image as fotos,
  inconsistencia.descricao as descricao_inconsistencias,
  inconsistencia.colaborador as colaborador_inconsistencias,
  rostos.path_image as rostos,
  rotulacoes.categoria as rotulacao,
  tatuagens.descricao as tatuagem`;

const ATRIBUTOS_VINCULOS = `
  vinculos.tipo as tipo_vinculos,
  vinculos.descricao as descricao_vinculos,
  alcunha2.alcunha as alcunha2,
  documento2.tipo as tipo_documento2,
  documento2.numeracao as documento2,
  documento2.nome as nome2,
  documento2.nome_mae as mae2,
  documento2.nome_pai as pai2,
  documento2.data_nascimento as nascimento2`;

const ATRIBUTOS_FATOS = `
  fatos.relato as relato_fato,
  fcrimes.descricao as descricao_fato_crime,
  fcrimes.municipio as municipio_fato_crime,
  fcrimes.uf as uf_fato_crime,
  fendereco.endereco as endereco_fato_endereco,
  fendereco.uf as uf_fato_endereco,
  fendereco.municipio as municipio_fato_endereco,
  ffotos.path_image as foto_fato,
  ffotos.descricao as descricao_foto_fato,
  finconsistencias.descricao as descricao_inconsistencia_fato,
  finconsistencias.colaborador as colaborador_inconsistencia_fato,
  fodados.data_ocorrencia as data_ocorrencia,
  fodados.natureza_ocorrencia as natureza_ocorrencia,
  fodadosarmas.tipo as tipo_arma,
  fodadosarmas.qtd as quantidade_arma,
  fodadosdinheiro.tipo as tipo_dinheiro,
  fodadosdinheiro.qtd as quantidade_dinheiro,
  fodadosentorpecentes.tipo as tipo_entorpecente,
  fodadosentorpecentes.qtd as quantidade_entorpecente,
  fodadosmunicoes.tipo as tipo_municoes,
  fodadosmunicoes.qtd as quantidade_municoes,
  fodadospessoaspresas.qtd_flagrantes as quantidade_flagrantes,
  fodadospessoaspresas.qtd_pessoas_apreendidas as quantidade_pessoas_apreendidas,
  fodadospessoaspresas.qtd_pessoas_mandado_judicial as quantidade_pessoas_mandado,
  fodadosveiculos.tipo as tipo_veiculos_fato,
  fodadosveiculos.qtd as quantidade_veiculos_fato,
  freferencias.descricao as referencia,

  veiculos.placa as placa,
  vcaracteristicas.categoria as categoria_veiculo,
  vcaracteristicas.modelo as modelo_veiculo,
  vcaracteristicas.cor as cor_veiculo,
  vfotos.path_image as foto_veiculo,
  vfotos.descricao as descricao_foto_veiculo`;

const ATRIBUTOS_ABORDAGENS = `
  ainconsistencia.colaborador as colaborador_inc_abordagem,
  ainconsistencia.descricao as descricao_inc_abordagem,
  amilitares.unidade as abordagem_militar_und,
  amilitares.matricula as abordagem_militar_matricula,
  arelatos.unidade as relato_und_ab,
  arelatos.data as relato_data_ab,
  arelatos.opt1 as relato_apt1_ab,
  arelatos.opt2 as relato_apt2_ab,
  arelatos.opt3 as relato_apt3_ab,
  arelatos.opt4 as relato_apt4_ab,
  arelatos.opt5 as relato_apt5_ab,
  arelatos.opt6 as relato_apt6_ab,
  arelatos.observacao as relato_obs_ab`;

const ATRIBUTOS_OCORRENCIA = `
  opessoas.envolvimento as ocorrencia_envolvimento,
  opessoas.conducao_coercitiva as ocorrencia_coercitiva,
  opessoas.uso_de_algemas as ocorrencia_algemas,
  omateriais.tipo as tipo_material_oco,
  omateriais.descricao as descricao_material_oco,
  oenderecos.endereco as endereco_oco,
  oenderecos.uf as uf_oco,
  oenderecos.municipio as municipio_oco`;

export let getInvestigadosPessoaCPF= function (cpf: string){
    const nomeFuncao = getNomeFuncao(1, 2);
    const query = () => {
      return db.query([
        ['CPF', ISql.Char, cpf],
        ],`
          SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
              ${ATRIBUTOS_PESSOA}
          FROM
          ${modelConfig.get('DOCUMENTOS')} documento
          LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha ON documento.id_pessoa = alcunha.id_pessoa
          LEFT OUTER JOIN ${modelConfig.get('FOTOS')} fotos ON documento.id_pessoa = fotos.id_pessoa
          LEFT OUTER JOIN ${modelConfig.get('ROSTOS')} rostos ON documento.id_pessoa = rostos.id_pessoa
          LEFT OUTER JOIN ${modelConfig.get('ROTULACOES')} rotulacoes ON documento.id_pessoa = rotulacoes.id_pessoa
          LEFT OUTER JOIN ${modelConfig.get('TATUAGENS')} tatuagens ON documento.id_pessoa = tatuagens.id_pessoa
          LEFT OUTER JOIN ${modelConfig.get('INCONSISTENCIA')} inconsistencia ON documento.id_pessoa = inconsistencia.id_pessoa

          LEFT OUTER JOIN ${modelConfig.get('VINCULOS')} vinculos ON documento.id_pessoa = vinculos.id_pessoa1
          LEFT OUTER JOIN ${modelConfig.get('DOCUMENTOS')} documento2 ON vinculos.id_pessoa2 = documento2.id_pessoa
          LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha2 ON vinculos.id_pessoa2 = alcunha2.id_pessoa

          WHERE documento.numeracao=@CPF
        `);
    }

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: 0 , grupo: 'pessoa', fnRetorno });
};

export let getInvestigadosVinculoCPF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char, cpf],
      ],`
        SELECT
            ${ATRIBUTOS_VINCULOS}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('VINCULOS')} vinculos ON documento.id_pessoa = vinculos.id_pessoa1
        LEFT OUTER JOIN ${modelConfig.get('DOCUMENTOS')} documento2 ON vinculos.id_pessoa2 = documento2.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha2 ON vinculos.id_pessoa2 = alcunha2.id_pessoa

        WHERE documento.numeracao=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'vinculo', fnRetorno });
};

export let getInvestigadosFatosCPF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char, cpf],
      ],`
        SELECT
            ${ATRIBUTOS_FATOS}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('FATOS_PESSOAS')} fpessoa ON documento.id_pessoa = fpessoa.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('FATOS')} fatos ON fpessoa.id_fato = fatos.id
        LEFT OUTER JOIN ${modelConfig.get('FATOS_CRIMES')} fcrimes ON fatos.id = fcrimes.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_ENDERECOS')} fendereco ON fatos.id = fendereco.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_FOTOS')} ffotos ON fatos.id = ffotos.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_LOCAIS')} flocais ON fatos.id = flocais.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_REFERENCIAS')} freferencias ON fatos.id = freferencias.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_VEICULOS')} fveiculos ON fatos.id = fveiculos.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_INCONSISTENCIAS')} finconsistencias ON fatos.id = finconsistencias.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS')} fodados ON fatos.id = fodados.id_fato
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_ARMAS')} fodadosarmas ON fodados.id_fato = fodadosarmas.id_fato_ocorrencia_dados
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_DINHEIRO')} fodadosdinheiro ON fodados.id_fato = fodadosdinheiro.id_fato_ocorrencia_dados
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_ENTORPECENTES')} fodadosentorpecentes ON fodados.id_fato = fodadosentorpecentes.id_fato_ocorrencia_dados
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_MUNICOES')} fodadosmunicoes ON fodados.id_fato = fodadosmunicoes.id_fato_ocorrencia_dados
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_PESSOAS_PRESAS')} fodadospessoaspresas ON fodados.id_fato = fodadospessoaspresas.id_fato_ocorrencia_dados
        LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_VEICULOS')} fodadosveiculos ON fodados.id_fato = fodadosveiculos.id_fato_ocorrencia_dados
        LEFT OUTER JOIN ${modelConfig.get('VEICULO')} veiculos ON fveiculos.id_veiculo = veiculos.placa
        LEFT OUTER JOIN ${modelConfig.get('VEICULOS_CARACTERISTICAS')} vcaracteristicas ON veiculos.placa = vcaracteristicas.id_veiculo
        LEFT OUTER JOIN ${modelConfig.get('VEICULOS_FOTOS')} vfotos ON veiculos.placa = vfotos.id_veiculo
        LEFT OUTER JOIN ${modelConfig.get('VEICULOS_INCONSISTENCIAS')} vinconsistencias ON veiculos.placa = vinconsistencias.id_veiculo

        WHERE documento.numeracao=@CPF
      `);
  }

      return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'fatos', fnRetorno });
};

export let getInvestigadosAbordagensCPF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char, cpf],
      ],`
        SELECT
            ${ATRIBUTOS_ABORDAGENS}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_PESSOAS')} apessoa ON documento.id_pessoa = apessoa.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_FOTOS')} afoto ON apessoa.id_abordagem = afoto.id_abordagem
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_INCONSISTENCIAS')} ainconsistencia ON apessoa.id_abordagem = ainconsistencia.id_abordagem
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_LOCAIS')} alocais ON apessoa.id_abordagem = alocais.id_abordagem
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_MILITARES')} amilitares ON apessoa.id_abordagem = amilitares.id_abordagem
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_RELATOS')} arelatos ON apessoa.id_abordagem = arelatos.id_abordagem
        LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_VEICULOS')} aveiculos ON apessoa.id_abordagem = aveiculos.id_abordagem

        WHERE documento.numeracao=@CPF
      `);
  }

      return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'abordagem', fnRetorno });
};

export let getInvestigadosOcorrenciaCPF = function (cpf: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char, cpf],
      ],`
        SELECT
            ${ATRIBUTOS_OCORRENCIA}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_ENVOLVIDOS')} opessoas on documento.id_pessoa = opessoas.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_VEICULOS')} oveiculos on opessoas.id_ocorrencia = oveiculos.id_ocorrencia
        LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_ENDERECOS')} oenderecos on opessoas.id_ocorrencia = oenderecos.id_ocorrencia
        LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_MATERIAIS')} omateriais on opessoas.id_ocorrencia = omateriais.id_ocorrencia

        WHERE documento.numeracao=@CPF
      `);
  }

      return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'ocorrencia', fnRetorno });
};


export let getInvestigadosPessoaRG = function (rg: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RG', ISql.Char, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_PESSOA}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha ON documento.id_pessoa = alcunha.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('FOTOS')} fotos ON documento.id_pessoa = fotos.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ROSTOS')} rostos ON documento.id_pessoa = rostos.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ROTULACOES')} rotulacoes ON documento.id_pessoa = rotulacoes.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('TATUAGENS')} tatuagens ON documento.id_pessoa = tatuagens.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('INCONSISTENCIA')} inconsistencia ON documento.id_pessoa = inconsistencia.id_pessoa

        LEFT OUTER JOIN ${modelConfig.get('VINCULOS')} vinculos ON documento.id_pessoa = vinculos.id_pessoa1
        LEFT OUTER JOIN ${modelConfig.get('DOCUMENTOS')} documento2 ON vinculos.id_pessoa2 = documento2.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha2 ON vinculos.id_pessoa2 = alcunha2.id_pessoa

        WHERE documento.numeracao=@rg
      `);
  }

      return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: 0 , grupo: 'pessoa', fnRetorno });
};

export let getInvestigadosVinculoRG = function (rg: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RG', ISql.Char, rg],
      ],`
        SELECT
            ${ATRIBUTOS_VINCULOS}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('VINCULOS')} vinculos ON documento.id_pessoa = vinculos.id_pessoa1
        LEFT OUTER JOIN ${modelConfig.get('DOCUMENTOS')} documento2 ON vinculos.id_pessoa2 = documento2.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha2 ON vinculos.id_pessoa2 = alcunha2.id_pessoa

        WHERE documento.numeracao=@RG
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'vinculo', fnRetorno });
};

export let getInvestigadosFatosRG = function (rg: string){
const nomeFuncao = getNomeFuncao(1, 2);
const query = () => {
  return db.query([
    ['RG', ISql.Char, rg],
    ],`
      SELECT
          ${ATRIBUTOS_FATOS}
      FROM
      ${modelConfig.get('DOCUMENTOS')} documento
      LEFT OUTER JOIN ${modelConfig.get('FATOS_PESSOAS')} fpessoa ON documento.id_pessoa = fpessoa.id_pessoa
      LEFT OUTER JOIN ${modelConfig.get('FATOS')} fatos ON fpessoa.id_fato = fatos.id
      LEFT OUTER JOIN ${modelConfig.get('FATOS_CRIMES')} fcrimes ON fatos.id = fcrimes.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_ENDERECOS')} fendereco ON fatos.id = fendereco.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_FOTOS')} ffotos ON fatos.id = ffotos.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_LOCAIS')} flocais ON fatos.id = flocais.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_REFERENCIAS')} freferencias ON fatos.id = freferencias.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_VEICULOS')} fveiculos ON fatos.id = fveiculos.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_INCONSISTENCIAS')} finconsistencias ON fatos.id = finconsistencias.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS')} fodados ON fatos.id = fodados.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_ARMAS')} fodadosarmas ON fodados.id_fato = fodadosarmas.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_DINHEIRO')} fodadosdinheiro ON fodados.id_fato = fodadosdinheiro.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_ENTORPECENTES')} fodadosentorpecentes ON fodados.id_fato = fodadosentorpecentes.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_MUNICOES')} fodadosmunicoes ON fodados.id_fato = fodadosmunicoes.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_PESSOAS_PRESAS')} fodadospessoaspresas ON fodados.id_fato = fodadospessoaspresas.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_VEICULOS')} fodadosveiculos ON fodados.id_fato = fodadosveiculos.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('VEICULO')} veiculos ON fveiculos.id_veiculo = veiculos.placa
      LEFT OUTER JOIN ${modelConfig.get('VEICULOS_CARACTERISTICAS')} vcaracteristicas ON veiculos.placa = vcaracteristicas.id_veiculo
      LEFT OUTER JOIN ${modelConfig.get('VEICULOS_FOTOS')} vfotos ON veiculos.placa = vfotos.id_veiculo
      LEFT OUTER JOIN ${modelConfig.get('VEICULOS_INCONSISTENCIAS')} vinconsistencias ON veiculos.placa = vinconsistencias.id_veiculo

      WHERE documento.numeracao=@RG
    `);
}

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'fatos', fnRetorno });
};

export let getInvestigadosAbordagensRG = function (rg: string){
const nomeFuncao = getNomeFuncao(1, 2);
const query = () => {
  return db.query([
    ['RG', ISql.Char, rg],
    ],`
      SELECT
          ${ATRIBUTOS_ABORDAGENS}
      FROM
      ${modelConfig.get('DOCUMENTOS')} documento
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_PESSOAS')} apessoa ON documento.id_pessoa = apessoa.id_pessoa
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_FOTOS')} afoto ON apessoa.id_abordagem = afoto.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_INCONSISTENCIAS')} ainconsistencia ON apessoa.id_abordagem = ainconsistencia.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_LOCAIS')} alocais ON apessoa.id_abordagem = alocais.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_MILITARES')} amilitares ON apessoa.id_abordagem = amilitares.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_RELATOS')} arelatos ON apessoa.id_abordagem = arelatos.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_VEICULOS')} aveiculos ON apessoa.id_abordagem = aveiculos.id_abordagem

      WHERE documento.numeracao=@RG
    `);
}

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'abordagem', fnRetorno });
};

export let getInvestigadosOcorrenciaRG = function (rg: string){
const nomeFuncao = getNomeFuncao(1, 2);
const query = () => {
  return db.query([
    ['RG', ISql.Char, rg],
    ],`
      SELECT
          ${ATRIBUTOS_OCORRENCIA}
      FROM
      ${modelConfig.get('DOCUMENTOS')} documento
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_ENVOLVIDOS')} opessoas on documento.id_pessoa = opessoas.id_pessoa
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_VEICULOS')} oveiculos on opessoas.id_ocorrencia = oveiculos.id_ocorrencia
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_ENDERECOS')} oenderecos on opessoas.id_ocorrencia = oenderecos.id_ocorrencia
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_MATERIAIS')} omateriais on opessoas.id_ocorrencia = omateriais.id_ocorrencia

      WHERE documento.numeracao=@RG
    `);
}

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'ocorrencia', fnRetorno });
};

export let getInvestigadosPessoaNome = function (nome: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.Char, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_PESSOA}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha ON documento.id_pessoa = alcunha.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('FOTOS')} fotos ON documento.id_pessoa = fotos.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ROSTOS')} rostos ON documento.id_pessoa = rostos.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ROTULACOES')} rotulacoes ON documento.id_pessoa = rotulacoes.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('TATUAGENS')} tatuagens ON documento.id_pessoa = tatuagens.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('INCONSISTENCIA')} inconsistencia ON documento.id_pessoa = inconsistencia.id_pessoa

        LEFT OUTER JOIN ${modelConfig.get('VINCULOS')} vinculos ON documento.id_pessoa = vinculos.id_pessoa1
        LEFT OUTER JOIN ${modelConfig.get('DOCUMENTOS')} documento2 ON vinculos.id_pessoa2 = documento2.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha2 ON vinculos.id_pessoa2 = alcunha2.id_pessoa

        WHERE documento.nome=@NOME
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo:'pessoa', fnRetorno });
};

export let getInvestigadosVinculoNome = function (nome: string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.Char, nome],
      ],`
        SELECT
            ${ATRIBUTOS_VINCULOS}
        FROM
        ${modelConfig.get('DOCUMENTOS')} documento
        LEFT OUTER JOIN ${modelConfig.get('VINCULOS')} vinculos ON documento.id_pessoa = vinculos.id_pessoa1
        LEFT OUTER JOIN ${modelConfig.get('DOCUMENTOS')} documento2 ON vinculos.id_pessoa2 = documento2.id_pessoa
        LEFT OUTER JOIN ${modelConfig.get('ALCUNHA')} alcunha2 ON vinculos.id_pessoa2 = alcunha2.id_pessoa

        WHERE documento.nome=@NOME
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'vinculo', fnRetorno });
};

export let getInvestigadosFatosNome = function (nome: string){
const nomeFuncao = getNomeFuncao(1, 2);
const query = () => {
  return db.query([
    ['NOME', ISql.Char, nome],
    ],`
      SELECT
          ${ATRIBUTOS_FATOS}
      FROM
      ${modelConfig.get('DOCUMENTOS')} documento
      LEFT OUTER JOIN ${modelConfig.get('FATOS_PESSOAS')} fpessoa ON documento.id_pessoa = fpessoa.id_pessoa
      LEFT OUTER JOIN ${modelConfig.get('FATOS')} fatos ON fpessoa.id_fato = fatos.id
      LEFT OUTER JOIN ${modelConfig.get('FATOS_CRIMES')} fcrimes ON fatos.id = fcrimes.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_ENDERECOS')} fendereco ON fatos.id = fendereco.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_FOTOS')} ffotos ON fatos.id = ffotos.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_LOCAIS')} flocais ON fatos.id = flocais.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_REFERENCIAS')} freferencias ON fatos.id = freferencias.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_VEICULOS')} fveiculos ON fatos.id = fveiculos.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_INCONSISTENCIAS')} finconsistencias ON fatos.id = finconsistencias.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS')} fodados ON fatos.id = fodados.id_fato
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_ARMAS')} fodadosarmas ON fodados.id_fato = fodadosarmas.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_DINHEIRO')} fodadosdinheiro ON fodados.id_fato = fodadosdinheiro.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_ENTORPECENTES')} fodadosentorpecentes ON fodados.id_fato = fodadosentorpecentes.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_MUNICOES')} fodadosmunicoes ON fodados.id_fato = fodadosmunicoes.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_PESSOAS_PRESAS')} fodadospessoaspresas ON fodados.id_fato = fodadospessoaspresas.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('FATOS_OCORRENCIA_DADOS_VEICULOS')} fodadosveiculos ON fodados.id_fato = fodadosveiculos.id_fato_ocorrencia_dados
      LEFT OUTER JOIN ${modelConfig.get('VEICULO')} veiculos ON fveiculos.id_veiculo = veiculos.placa
      LEFT OUTER JOIN ${modelConfig.get('VEICULOS_CARACTERISTICAS')} vcaracteristicas ON veiculos.placa = vcaracteristicas.id_veiculo
      LEFT OUTER JOIN ${modelConfig.get('VEICULOS_FOTOS')} vfotos ON veiculos.placa = vfotos.id_veiculo
      LEFT OUTER JOIN ${modelConfig.get('VEICULOS_INCONSISTENCIAS')} vinconsistencias ON veiculos.placa = vinconsistencias.id_veiculo

      WHERE documento.nome=@NOME
    `);
}

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'fatos', fnRetorno });
};

export let getInvestigadosAbordagensNome = function (nome: string){
const nomeFuncao = getNomeFuncao(1, 2);
const query = () => {
  return db.query([
    ['NOME', ISql.Char, nome],
    ],`
      SELECT
          ${ATRIBUTOS_ABORDAGENS}
      FROM
      ${modelConfig.get('DOCUMENTOS')} documento
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_PESSOAS')} apessoa ON documento.id_pessoa = apessoa.id_pessoa
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_FOTOS')} afoto ON apessoa.id_abordagem = afoto.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_INCONSISTENCIAS')} ainconsistencia ON apessoa.id_abordagem = ainconsistencia.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_LOCAIS')} alocais ON apessoa.id_abordagem = alocais.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_MILITARES')} amilitares ON apessoa.id_abordagem = amilitares.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_RELATOS')} arelatos ON apessoa.id_abordagem = arelatos.id_abordagem
      LEFT OUTER JOIN ${modelConfig.get('ABORDAGENS_VEICULOS')} aveiculos ON apessoa.id_abordagem = aveiculos.id_abordagem

      WHERE documento.nome=@NOME
    `);
}

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'abordagem', fnRetorno });
};

export let getInvestigadosOcorrenciaNome = function (nome: string){
const nomeFuncao = getNomeFuncao(1, 2);
const query = () => {
  return db.query([
    ['NOME', ISql.Char, nome],
    ],`
      SELECT
          ${ATRIBUTOS_OCORRENCIA}
      FROM
      ${modelConfig.get('DOCUMENTOS')} documento
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_ENVOLVIDOS')} opessoas on documento.id_pessoa = opessoas.id_pessoa
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_VEICULOS')} oveiculos on opessoas.id_ocorrencia = oveiculos.id_ocorrencia
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_ENDERECOS')} oenderecos on opessoas.id_ocorrencia = oenderecos.id_ocorrencia
      LEFT OUTER JOIN ${modelConfig.get('OCORRENCIAS_MATERIAIS')} omateriais on opessoas.id_ocorrencia = omateriais.id_ocorrencia

      WHERE documento.nome=@NOME
    `);
}

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank: null, grupo: 'ocorrencia', fnRetorno });
};
