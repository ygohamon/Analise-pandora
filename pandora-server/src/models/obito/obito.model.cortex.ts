
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.obito'].fonte;
const rank   = MODEL_PRIORITY['cortex.obito'].rank;
const grupo  = MODEL_PRIORITY['cortex.obito'].grupo;

const formataDado = function (dado) {
  if (dado == null ) {
    return {};
  }

  return [{
    obito_cpf                     : dado?.cpf,
    obito_dataLavratura           : dado?.dataLavratura,
    obito_dataNascimento          : dado?.dataNascimento,
    obito_dataObito               : dado?.dataObito,
    obito_dataOperacao            : dado?.dataOperacao,
    obito_documentos              : dado?.documentos,
    obito_matricula               : dado?.matricula,
    obito_metodoBuscaCpf          : dado?.metodoBuscaCpf,
    obito_municipioNaturalidade   : dado?.municipioNaturalidade,
    obito_municipioObito          : dado?.municipioObito,
    obito_nome                    : dado?.nome,
    obito_nomeMae                 : dado?.nomeMae,
    obito_nomePai                 : dado?.nomePai,
    obito_cnpjServentia           : dado?.serventia.cnpjServentia,
    obito_nomeFantasia            : dado?.serventia.nomeFantasia,
    obito_razaoSocial             : dado?.serventia.razaoSocial,
    obito_ufServentia             : dado?.serventia.ufServentia,
    obito_municipioServentia      : dado?.serventia.municipioServentia,
    obito_bairro                  : dado?.serventia.bairro,
    obito_endereco                : dado?.serventia.endereco,
    obito_numero                  : dado?.serventia.numero,
    obito_complemento             : dado?.serventia.complemento,
    obito_cep                     : dado?.serventia.cep,
    obito_distrito                : dado?.serventia.distrito,
    obito_subDistrito             : dado?.serventia.subDistrito,
    obito_fax                     : dado?.serventia.fax,
    obito_site                    : dado?.serventia.site,
    obito_emailServentia          : dado?.serventia.emailServentia,
    obito_numeroTelefonePrincipal : dado?.serventia.numeroTelefonePrincipal,
    obito_numeroTelefoneSecundario: dado?.serventia.numeroTelefoneSecundario,
    obito_dataInicioAtividades    : dado?.serventia.dataInicioAtividades,
    obito_dataExclusao            : dado?.serventia.dataExclusao,
    obito_dataAtualizacao         : dado?.serventia.dataAtualizacao,
    obito_sexo                    : dado?.sexo,
    obito_tipoOperacao            : dado?.tipoOperacao,
    obito_ufNaturalidade          : dado?.ufNaturalidade,
    obito_ufObito                 : dado?.ufObito,
    fonte                         : modelConfig?.sigla
  }]
}

export let getObitosCPF_CORTEX = function (cpf: string, cpfUsuario: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    return await ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/sirc/obitos/${cpf}`, cpfUsuario)
    .then(obito => formataDado(obito));
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
