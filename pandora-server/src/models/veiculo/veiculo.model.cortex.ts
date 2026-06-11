
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, formataDado, limpaNumero } from '../../utils';
import { MODEL_PRIORITY } from './../../config';

import { getModelConfig } from '../../config.models';
import { fixVeiculoCPF_CNPJ } from '.';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.veiculo'].fonte;
const rank   = MODEL_PRIORITY['cortex.veiculo'].rank;
const grupo  = MODEL_PRIORITY['cortex.veiculo'].grupo;

const parser = function (dado) {
  return {
    placa                       : dado?.placa,
    chassi                      : dado?.chassi,
    proprietario                : dado?.nomeProprietario,
    nome                        : dado?.nomeProprietario,
    possuidor                   : dado?.nomePossuidor,
    tipoDocumentoFaturado       : dado?.tipoDocumentoFaturado,
    numeroIdentificacaoFaturado : dado?.numeroIdentificacaoFaturado,
    ufFatura                    : dado?.ufFatura,
    numeroMotor                 : dado?.numeroMotor,
    renavam                     : dado?.renavam,
    anoFab                      : dado?.anoFabricacao,
    anoMod                      : dado?.anoModelo,
    municipio                   : dado?.municipioPlaca,
    uf                          : dado?.ufEmplacamento,
    tipo                        : dado?.tipoVeiculo,
    marcaModelo                 : dado?.marcaModelo,
    cor                         : dado?.cor,
    especie                     : dado?.especie,
    combustivel                 : dado?.combustivel,
    dataAtualizacao             : dado?.dataAtualizacaoVeiculo,
    dataInicioPosse             : dado?.dataEmplacamento,
    ufEmplacamento              : dado?.ufEmplacamento,
    anoRegistro                 : dado?.dataAtualizacaoVeiculo?.slice(0, 4),

    responsavel                 : dado?.nomeProprietario,

    restricao_1                 : dado?.restricaoVeiculo1,
    restricao_2                 : dado?.restricaoVeiculo2,
    restricao_3                 : dado?.restricaoVeiculo3,
    restricao_4                 : dado?.restricaoVeiculo4,

    //restrição
    // anoBO                       : dado?.restricao.map(function(restricao){return restricao.anoBO}),
    // dataOcorrencia              : dado?.restricao.map(function(restricao){return restricao.dataOcorrencia}),
    // dddContato                  : dado?.restricao.map(function(restricao){return restricao.dddContato}),
    // historico                   : dado?.restricao.map(function(restricao){return restricao.historico}),
    // municipioBO                 : dado?.restricao.map(function(restricao){return restricao.municipioBO}),
    // naturezaOcorrencia          : dado?.restricao.map(function(restricao){return restricao.naturezaOcorrencia}),
    // nomeDeclarante              : dado?.restricao.map(function(restricao){return restricao.nomeDeclarante}),
    // numeroBO                    : dado?.restricao.map(function(restricao){return restricao.numeroBO}),
    // placaRestricao              : dado?.restricao.map(function(restricao){return restricao.placa}),
    // ramalContato                : dado?.restricao.map(function(restricao){return restricao.ramalContato}),
    // sistema                     : dado?.restricao.map(function(restricao){return restricao.sistema}),
    // telefoneContato             : dado?.restricao.map(function(restricao){return restricao.telefoneContato}),
    // ufBO                        : dado?.restricao.map(function(restricao){return restricao.ufBO}),
    // unidadePolicial             : dado?.restricao.map(function(restricao){return restricao.unidadePolicial}),
    //fim restrição

    situacao                    : dado?.situacaoVeiculo,

    tipoDado                    : 'completo',
    fonte                       : modelConfig?.sigla
  }
}

export let getVeiculoDetalhadoProprietarioCPF_CORTEX = function (cpf: string, cpfUsuario: string = '') {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/emplacamentos/proprietario/${cpf}`, cpfUsuario)
    .then(dados => {
      return (!dados) ? null : dados.map(d => ({cpf, ...parser(d)}))
    })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getVeiculoDetalhadoProprietarioCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string = '') {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/emplacamentos/proprietario/${cnpj}`, cpfUsuario)
    .then(dados => {
      return (!dados) ? null : dados.map(d => ({cnpj, ...parser(d)}))
    })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getVeiculoDetalhadoPlaca_CORTEX = function (placa: string, cpfUsuario: string = '') {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/emplacamentos/placa/${placa}`, cpfUsuario)
      .then(dado => {
        return (!dado) ? null : [{
          cpf: dado?.proprietario?.numeroDocumentoProprietario,
          ...parser(dado)
        }]
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
}
