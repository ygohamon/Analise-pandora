import { cortex as ctx } from "../../services/misc/cortex.service";
import { MODEL_PRIORITY } from "./../../config";

import {
  flat,
  getNomeFuncao,
  modelFactory as mf,
  resultFoundRaw,
} from "./../../utils";

import { getModelConfig } from "../../config.models";

const modelConfig = getModelConfig("WEBSERVICE_CORTEX");

const fonte = MODEL_PRIORITY["cortex.bnmp.mandado"].fonte;
const rank = MODEL_PRIORITY["cortex.bnmp.mandado"].rank;
const grupo = MODEL_PRIORITY["cortex.bnmp.mandado"].grupo;

export let getMandadoDetalhadoCPF_BNMP_CORTEX = function (cpf: string, cpfUsuario: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const fnRetorno = resultFoundRaw;

  const query = async () => {

    //Constante que ira pesquisar todos os mandados do BNMP apartir de um determinado CPF
    const resultado = await ctx.get(
      `${modelConfig.get("CORTEX_URL_PESSOAS")}/bnmp/cpf/listagem?cpf=${cpf}`,
      cpfUsuario
    );

    // Validação para caso a consulta retorne nenhuma pessoa, lembrando que a API do cortex
    // ja possui essa validação mas é bom coloca por via das duvidas.
    if(!resultado) return null;
    return Promise.all(resultado.map(detalhado => getMandadoEnvolvido_CORTEX(detalhado.idpessoa, cpfUsuario)))
    ;
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
    fonte,
    rank,
    grupo,
    fnRetorno,
  });
};

//Metodo onde ira pegar os dados do BNMP apartir do ID que sera retornad do getMandadoDetalhadoCPF_BNMP_CORTEX
//e ira ser retornado com a formatação para o front..
const getMandadoEnvolvido_CORTEX = async function (idpessoa:number, cpfUsuario: string) {

  const resultado = await ctx.get(
    `${modelConfig.get("CORTEX_URL_PESSOAS")}/bnmp/${idpessoa}`,
    cpfUsuario
  )

  if (!resultado) {
    return null;
  }

  return formataDetalhado(resultado, flat(resultado.mandadoPrisao), flat(resultado.contramandado), flat(resultado.foto), flat(resultado.guiaRecolhimento), flat(resultado.certidaoCumprimentomandadoPrisao), flat(resultado.certidaoExtincaoPunibilidade));
};

// Formatação do Mandado a ser chamado no Component,
// ++ Lembrando que html não chama essa formatação ele -
// - chama parametros da propria api ++
const formataDetalhado = function (p, mandado, contramandado, foto, recolhimento, certidaoMandado, certidaoPunibilidade) {
    return {
      alcunha:                        p.alcunha,
      dataNascimento:                 p.dataNascimento,
      indiceAssertividade:            p.indiceAssertividade,
      naturalidade:                   p.naturalidade,
      nome:                           p.nome,
      nomeMae:                        p.nomeMae,
      nomePai:                        p.nomePai,
      sexo:                           p.sexo,
      statusPessoa:                   p.statusPessoa,
      tipoPessoa:                     p.tipoPessoa,
      idPessoa:                       p.idPessoa,
      corRaca:                        p.corRaca,
      dataCriacao:                    p.dataCriacao,
      flagDependenteQuimico:          p.flagDependenteQuimico,
      flagGravidez:                   p.flagGravidez,
      flagLactante:                   p.flagLactante,
      flgDeficienteFisico:            p.flgDeficienteFisico,
      flgIrmaoGemeo:                  p.flgIrmaoGemeo,
      flgMaisRecente:                 p.flgMaisRecente,

      //Mandado Prisão
      mandadoPrisao:                        formataMandado(mandado),

      //pessoa
      dataCadastro:                   p.pessoa.dataCadastro,
      dataExpiracaoMandadoPrisao:     p.pessoa.dataExpiracaoMandadoPrisao,
      dataUltimaEdicao:               p.pessoa.dataUltimaEdicao,
      dataVencimentosMandados:        p.pessoa.dataVencimentosMandados,
      flgAtivo:                       p.pessoa.flgAtivo,
      justificativa:                  p.pessoa.justificativa,
      municipioCustodiaPessoa:        p.pessoa.municipioCustodiaPessoa,
      numeroIndividuo:                p.pessoa.numeroIndividuo,
      statusPessoaP:                  p.pessoa.statusPessoaP,
      ufCustodiaPessoa:               p.pessoa.ufCustodiaPessoa,

      //ContraMandado
      contramandado:                  formataContramandado(contramandado),
      descricaoOutros:                p.sinaisMarcas.descricaoOutros,
      altura:                         p.sinaisMarcas.altura,
      barba:                          p.sinaisMarcas.barba,
      bigode:                         p.sinaisMarcas.bigode,
      boca:                           p.sinaisMarcas.boca,
      biotipo:                        p.sinaisMarcas.biotipo,
      tipoCabelo:                     p.sinaisMarcas.tipoCabelo,
      corOlhos:                       p.sinaisMarcas.corOlhos,
      formatoOlhos:                   p.sinaisMarcas.formatoOlhos,
      corPele:                        p.sinaisMarcas.corPele,
      labios:                         p.sinaisMarcas.labios,
      nariz:                          p.sinaisMarcas.nariz,
      orelhas:                        p.sinaisMarcas.orelhas,
      pescoco:                        p.sinaisMarcas.pescoco,
      rosto:                          p.sinaisMarcas.rosto,
      sobrancelhas:                   p.sinaisMarcas.sobrancelhas,
      testa:                          p.sinaisMarcas.testa,

      foto:                           formataFoto(foto),
      recolhimento:                   formataGuiaRecolhimento(recolhimento),
      certidaoMandado:                formataCertidaoCumprimentoMandado(certidaoMandado),
      certidaoPunibilidade:           formataCertidaoExtincaoPunilidade(certidaoPunibilidade),
    };
  };


const formataMandado = function (mandado) {
  return mandado.map(p => {
    return {
      cargoServidor:                  p.cargoServidor,
      linkMandadoPrisao:              p.linkMandadoPrisao,
      descricaoCumprimento:           p.descricaoCumprimento,
      descricaoJustificativa:         p.descricaoJustificativa,
      descricaoLocalOcorrencia:       p.descricaoLocalOcorrencia,
      especiePrisao:                  p.especiePrisao,
      municipioCustodia:              p.municipioCustodia,
      nomeEstabelecimentoPrisional:   p.nomeEstabelecimentoPrisional,
      nomeMagistrado:                 p.nomeMagistrado,
      nomeServidor:                   p.nomeServidor,
      numeroPeca:                     p.numeroPeca,
      numeroPrazoPrisao:              p.numeroPrazoPrisao,
      numeroProcesso:                 p.numeroProcesso,
      observacao:                     p.observacao,
      orgaoJudiciario:                p.orgaoJudiciario,
      regimePrisional:                p.regimePrisional,
      seqPeca:                        p.seqPeca,
      sigilo:                         p.sigilo,
      sinteseDecisao:                 p.sinteseDecisao,
      status:                         p.status,
      tempoPenaAno:                   p.tempoPenaAno,
      tempoPenaDia:                   p.tempoPenaDia,
      tempoPenaMes:                   p.tempoPenaMes,
      tipificacaoPenal:               p.tipificacaoPenal,
      tipoPeca:                       p.tipoPeca,
      ufCustodia:                     p.ufCustodia
    };
  });
};


const formataContramandado = function (contramandado) {
  return contramandado.map(p => {
    return {
      dataConclusao:                  p.dataConclusao,
      dataConfirmacaoServidor:	      p.dataConfirmacaoServidor,
      dataCriacaoContra:              p.dataCriacao,
      dataExpedicao:                  p.dataExpedicao,
      dataExpiracaoPrisaoMP:          p.dataExpiracaoPrisaoMP,
      dataVencimentoMandados:         p.dataVencimentoMandados,
      descricaoCumprimentoContra:     p.descricaoCumprimento,
      descricaoMotivoExpedicao:       p.descricaoMotivoExpedicao,
      descricaoObservacao:            p.descricaoObservacao,
      descricaoSinteseDecisao:        p.descricaoSinteseDecisao,
      descricaoTipoContramandado:     p.descricaoTipoContramandado,
      descricaoTipoMedida:            p.descricaoTipoMedida,
      descricaoTipoPeca:              p.descricaoTipoPeca,
      flgOutrasMedidas:               p.flgOutrasMedidas,
      flgPrisaoDomiciliar:            p.flgPrisaoDomiciliar,
      numeroPecaContra:               p.numeroPeca,
      numeroProcessoContra:           p.numeroProcesso,
      seq_mandado:                    p.seq_mandado,
      seq_peca:                       p.seq_peca,
      textoJustificativaCancelamento: p.textoJustificativaCancelamento,
    };
  });
};

const formataFoto = function (fotos){
  return fotos.map(p => {
    return {
      dataFoto:                       p.dataFoto,
      flgFotoPrincipal:               p.flgFotoPrincipal,
      foto:                           p.foto,
      origem:                         p.origem,
      tipoConteudoFoto:               p.tipoConteudoFoto,
    };
  });
};

const formataGuiaRecolhimento = function (recolhimento){
  return recolhimento.map(p => {
    return {
      dataConclusao:                        p.dataConclusao,
      dataConclusaoPecaRelacionada:         p.dataConclusaoPecaRelacionada,
      dataConfirmacaoServidor	:             p.dataConfirmacaoServidor,
      dataCriacao	:                         p.dataCriacao,
      dataCriacaoPecaRelacionada	:         p.dataCriacaoPecaRelacionada,
      dataExpedicaPecaRelacionada	:         p.dataExpedicaPecaRelacionada,
      dataExpedicao	:                       p.dataExpedicao,
      dataFimSuspensao366	:                 p.dataFimSuspensao366,
      dataFimSuspensao89	:                 p.dataFimSuspensao89,
      dataInfracao	:                       p.dataInfracao,
      dataInicioSuspensao366	:             p.dataInicioSuspensao366,
      dataInicioSuspensao89	:               p.dataInicioSuspensao89,
      dataPublicacaoAcordao	:               p.dataPublicacaoAcordao,
      dataPublicacaoPronuncia	:             p.dataPublicacaoPronuncia,
      dataPublicacaoSentenca	:             p.dataPublicacaoSentenca,
      dataRecebimentoDenunciaQueixa	:       p.dataRecebimentoDenunciaQueixa,
      dataTransitoJulgadoDefesa	:           p.dataTransitoJulgadoDefesa,
      dataTransitoJulgadoMinisterioPublico: p.dataTransitoJulgadoMinisterioPublico,
      descricaoLocalOcorrenciaDelito	:     p.descricaoLocalOcorrenciaDelito,
      descricaoLocalSituacaoAtualCondenado: p.descricaoLocalSituacaoAtualCondenado,
      descricaoOutrasInformacoes	:         p.descricaoOutrasInformacoes,
      descricaoOutrosProcessos	:           p.descricaoOutrosProcessos,
      descricaoReincidencia	:               p.descricaoReincidencia,
      estabelecimento	:                     p.estabelecimento,
      municipio	:                           p.municipio,
      municipioOcorrencia	:                 p.municipioOcorrencia,
      nomeDefensor	:                       p.nomeDefensor,
      numeroPeca	:                         p.numeroPeca,
      numeroPecaRelacionada	:               p.numeroPecaRelacionada,
      numeroProcesso	:                     p.numeroProcesso,
      numeroProcessoPecaRelacionada	:       p.numeroProcessoPecaRelacionada,
      numeroTotalAnoPenaImpostaProcesso:	  p.numeroTotalAnoPenaImpostaProcesso,
      numeroTotalDiasDetracaoPena:	        p.numeroTotalDiasDetracaoPena,
      numeroTotalDiasMulta:	                p.numeroTotalDiasMulta,
      numeroTotalDiasPenaImpostaProcesso:	  p.numeroTotalDiasPenaImpostaProcesso,
      numeroTotalMesPenaImpostaProcesso:	  p.numeroTotalMesPenaImpostaProcesso,
      orgaoPecaRelacionada	:               p.orgaoPecaRelacionada,
      orgaoTribunal	:                       p.orgaoTribunal,
      regimePrisional	:                     p.regimePrisional,
      statusPecaRelacionada	:               p.statusPecaRelacionada,
      textoJustificativaCancelamento	:     p.textoJustificativaCancelamento,
      tipoGuia	:                           p.tipoGuia,
      tipoPeca	:                           p.tipoPeca,
      tipoPecaRelacionada	:                 p.tipoPecaRelacionada,
      uf	:                                 p.uf,
      ufEstabelecimento	:                   p.ufEstabelecimento,
      ufOcorrencia	:                       p.ufOcorrencia,
    };
  });
};

const formataCertidaoCumprimentoMandado = function (certidaoMandado){
  return certidaoMandado.map(p => {
    return {
      dataConclusao:                        p.dataConclusao,
      dataConfirmacaoServidor	:             p.dataConfirmacaoServidor,
      dataCriacao	:                         p.dataCriacao,
      dataExpedicao	:                       p.dataExpedicao,
      decricaoLocalCustodia	:               p.decricaoLocalCustodia,
      descricaoResponsavelPrisao:           p.descricaoResponsavelPrisao,
      estabelecimento	:                     p.estabelecimento,
      estado:                               p.estado,
      municipio	:                           p.municipio,
      numeroPeca	:                         p.numeroPeca,
      numeroProcesso	:                     p.numeroProcesso,
      textoCumprimento:                     p.textoCumprimento,
      textoJustificativaCancelamento	:     p.textoJustificativaCancelamento,
      textoObservacao:                      p.textoObservacao,
    };
  });
};

const formataCertidaoExtincaoPunilidade = function (certidaoPunilidade){
  return certidaoPunilidade.map(p => {
    return {
      dataConclusao:                        p.dataConclusao,
      dataConfirmacaoServidor	:             p.dataConfirmacaoServidor,
      dataCriacao	:                         p.dataCriacao,
      dataExpedicao	:                       p.dataExpedicao,
      decricaoLocalCustodia	:               p.decricaoLocalCustodia,
      descricaoResponsavelPrisao:           p.descricaoResponsavelPrisao,
      estabelecimento	:                     p.estabelecimento,
      estado:                               p.estado,
      municipio	:                           p.municipio,
      numeroPeca	:                         p.numeroPeca,
      numeroProcesso	:                     p.numeroProcesso,
      textoCumprimento:                     p.textoCumprimento,
      textoJustificativaCancelamento	:     p.textoJustificativaCancelamento,
      textoObservacao:                      p.textoObservacao,
    };
  });
};
