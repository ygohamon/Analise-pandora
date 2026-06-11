const got = require('got');

import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

import {
  getNomeFuncao,
  modelFactory as mf,
  resultFoundRaw,
  formataDado,
  flat
} from './../../utils';

const modelConfig = getModelConfig('WEBSERVICE_TCE');

const fonte = MODEL_PRIORITY['tce'].fonte;
const rank = MODEL_PRIORITY['tce'].rank;
const grupo = MODEL_PRIORITY['tce'].grupo;


export let getTCE_ContaBancaria = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_conta_bancaria?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataContaBancaria(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_Empenho = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_empenho?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataEmpenho(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_EmpenhoAnulacao = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_empenho_anulacao?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataEmpenhoAnulacao(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_EmpenhoSuplementacao = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_empenho_suplementacao?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataEmpenhoSuplementacao(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_Licitacao = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_licitacao?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataLicitacao(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_Pagamento = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamento(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoAnulado = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_anulado?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoAnulado(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoExtraOrcamentario = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_extra_orcamentario?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoExtraOrcamentario(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoOrcamentario = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_orcamentario?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoOrcamentaria(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoOrcamentarioAnulado = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_orcamentario_anulado?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoOrcamentarioAnulado(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoRestituicaoReceita = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_restituicao_receita?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoRestituicaoReceita(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoRestosPagar = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_restos_a_pagar?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoRestoPagar(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

export let getTCE_PagamentoRetencao = function (exercicio: string, mes: string, dia: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {
        const timeout = modelConfig.get('CODATA_TIMEOUT') || 5000;
        const gotConfig = {
            timeout,
            retry: 0,
            headers: {
                'Isis-Token': `${modelConfig.get('CODATA_TOKEN')}`,
            }
        };

        const resultado = await got(`${modelConfig.get('CODATA_URL')}tce_pagamento_retencao?exercicio=${exercicio}&mes=${mes}&dia=${dia}`, gotConfig).json()
        if (resultado?.status === 'SUCCESS' && resultado?.result?.data?.length > 0) {
            return formataPagamentoRetencao(resultado.result.data)
          } else {
            return null;
          }
    };

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, {
        fonte,
        rank,
        grupo,
        fnRetorno,
    });

}

// FORMATAÇÕES
const formataContaBancaria = function (dados) {
    return dados.map(r => {
      return {
        banco:                              r.banco,
        agencia:                            r.agencia,
        codigo:                             r.codigo,
        descricao:                          r.descricao,
        transferencia_banco:                r.transferencia_banco,
        transferencia_agencia:              r.transferencia_agencia,
        transferencia_codigo:               r.transferencia_codigo,
        conta_contabil:                     r.conta_contabil,
        data_atualizacao:                   r.data_atualizacao,
        fonte_recurso:                      r.fonte_recurso,
      }
    })
}

const formataEmpenho = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        item_despesa:                       r.item_despesa,
        modalidade_licitacao:               r.modalidade_licitacao,
        valor:                              r.valor,
        historico:                          r.historico,
        credor:                             r.credor,
        credor_cnpj_cpf:                    r.credor_cpf_cnpj_historico,
        credor_nome:                        r.credor_nome_historico,
        dotacao:                            r.dotacao,
        tipo_credito:                       r.tipo_credito,
        registro_cge:                       r.registro_cge,
        ordenador:                          r.ordenador,
        situacao:                           r.situacao,
        reserva:                            r.reserva,
        contra_partida:                     r.contra_partida,
        diaria_data_saida:                  r.diaria_data_saida,
        diaria_data_chegada:                r.diaria_data_chegada,
        diaria_destino:                     r.diaria_destino,
        diaria_matricula:                   r.diaria_matricula,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

const formataEmpenhoAnulacao = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        empenho_anulado:                    r.empenho_anulado,
        valor:                              r.valor,
        historico:                          r.historico,
        ordenador:                          r.ordenador,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento
      }
    })
}

const formataEmpenhoSuplementacao = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        empenho_suplementado:               r.empenho_suplementado,
        modalidade_licitacao:               r.modalidade_licitacao,
        valor:                              r.valor,
        historico:                          r.historico,
        registro_cge:                       r.registro_cge,
        ordenador:                          r.ordenador,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento
      }
    })
}

const formataLicitacao = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        codigo:                             r.codigo,
        descricao:                          r.descricao,
        data_insercao:                      r.data_insercao_atualizacao
      }
    })
}

const formataPagamento = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        banco:                              r.banco,
        agencia:                            r.agencia,
        conta_bancaria:                     r.conta_bancaria,
        credor:                             r.credor,
        credor_nome_historico:              r.credor_nome_historico,
        credor_cpf_cnpj_historico:          r.credor_cpf_cnpj_historico,
        modalidade:                         r.modalidade,
        grupo_financeiro:                   r.grupo_financeiro,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

const formataPagamentoAnulado = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        pagamento:                          r.pagamento,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

const formataPagamentoExtraOrcamentario = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        grupo_financeiro:                   r.grupo_financeiro,
        numero_pagamento_principal:         r.numero_pagamento_principal,
        credor:                             r.credor,
        nome_credor_historico:              r.nome_credor_historico,
        cpf_cnpj_credor_historico:          r.cpf_cnpj_credor_historico,
        conta_contabil_despesa:             r.conta_contabil_despesa,
        modalidade:                         r.modalidade,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
        inscricao_resto_pagar_fk:           r.inscricao_resto_pagar_fk,
      }
    })
}

const formataPagamentoOrcamentaria = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        banco:                              r.banco,
        agencia:                            r.agencia,
        conta_bancaria:                     r.conta_bancaria,
        credor:                             r.credor,
        credor_nome_historico:              r.credor_nome_historico,
        credor_cpf_cnpj_historico:          r.credor_cpf_cnpj_historico,
        conta_contabil_despesa:             r.conta_contabil_despesa,
        modalidade:                         r.modalidade,
        grupo_financeiro:                   r.grupo_financeiro,
        unidade_gestora_empenho:            r.unidade_gestora_empenho,
        empenho:                            r.empenho,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

const formataPagamentoOrcamentarioAnulado = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        pagamento:                          r.pagamento,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

const formataPagamentoRestituicaoReceita = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        banco:                              r.banco,
        agencia:                            r.agencia,
        conta_bancaria:                     r.conta_bancaria,
        credor:                             r.credor,
        credor_nome_historico:              r.credor_nome_historico,
        credor_cpf_cnpj_historico:          r.credor_cpf_cnpj_historico,
        modalidade:                         r.modalidade,
        grupo_financeiro:                   r.grupo_financeiro,
        id_restos_a_pagar:                  r.id_restos_a_pagar,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
        receita:                            r.receita,
      }
    })
}

const formataPagamentoRestoPagar = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        banco:                              r.banco,
        agencia:                            r.agencia,
        conta_bancaria:                     r.conta_bancaria,
        credor:                             r.credor,
        credor_nome_historico:              r.credor_nome_historico,
        credor_cpf_cnpj_historico:          r.credor_cpf_cnpj_historico,
        modalidade:                         r.modalidade,
        grupo_financeiro:                   r.grupo_financeiro,
        id_restos_a_pagar:                  r.id_restos_a_pagar,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

const formataPagamentoRetencao = function (dados) {
    return dados.map(r => {
      return {
        exercicio:                          r.exercicio,
        gestora:                            r.unidade_gestora,
        numero:                             r.numero,
        valor:                              r.valor,
        banco:                              r.banco,
        agencia:                            r.agencia,
        conta_bancaria:                     r.conta_bancaria,
        credor:                             r.credor,
        credor_nome_historico:              r.credor_nome_historico,
        credor_cpf_cnpj_historico:          r.credor_cpf_cnpj_historico,
        modalidade:                         r.modalidade,
        grupo_financeiro:                   r.grupo_financeiro,
        exercicio_pagamento_principal:      r.exercicio_pagamento_principal,
        numero_pagamento_principal:         r.numero_pagamento_principal,
        retencao:                           r.retencao,
        data_inclusao:                      r.data_inclusao,
        data_processamento:                 r.data_processamento,
      }
    })
}

