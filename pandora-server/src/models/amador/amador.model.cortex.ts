
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.amador'].fonte;
const rank   = MODEL_PRIORITY['cortex.amador'].rank;
const grupo  = MODEL_PRIORITY['cortex.amador'].grupo;

const formataAmador = function (resultado) {
    return resultado.map(dado => {
        return {
            bairroEnderecoAmador                        : dado?.bairroEnderecoAmador,
            categoriaHabilitacaoAmador                  : dado?.categoriaHabilitacaoAmador,
            celularAmador                               : dado?.celularAmador,
            cepEnderecoAmador                           : dado?.cepEnderecoAmador,
            codigoBarras                                : dado?.codigoBarras,
            cpfAmador                                   : dado?.cpfAmador,
            dataEmissaoCarteiraAmador                   : dado?.dataEmissaoCarteiraAmador,
            dataNascimento                              : dado?.dataNascimento,
            dataValidadeCarteiraAmador                  : dado?.dataValidadeCarteiraAmador,
            emailAmador                                 : dado?.emailAmador,
            enderecoAmador                              : dado?.enderecoAmador,
            id                                          : dado?.id,
            motivoEmissaoCarteiraAmador                 : dado?.motivoEmissaoCarteiraAmador,
            municipioEnderecoAmador                     : dado?.municipioEnderecoAmador,
            nomeAmador                                  : dado?.nomeAmador,
            numeroIdentidadeAmador                      : dado?.numeroIdentidadeAmador,
            numeroInscricaoAmadorFormatoAnterior        : dado?.numeroInscricaoAmadorFormatoAnterior,
            numeroInscricaoAmadorVersaoAtualSistema     : dado?.numeroInscricaoAmadorVersaoAtualSistema,
            orgaoEmissorIdentidade                      : dado?.orgaoEmissorIdentidade,
            situacaoCarteiraAmador                      : dado?.situacaoCarteiraAmador,
            statusDataValidade                          : dado?.statusDataValidade,
            telefoneAmador                              : dado?.telefoneAmador,
            ufEnderecoAmador                            : dado?.ufEnderecoAmador,

            fonte                                       : modelConfig?.sigla
        };
    });
};
export let getAmadorCPF_CORTEX = function (cpf: string, cpfUsuario: string = '') {
    const nomeFuncao = getNomeFuncao(1, 2);
    const fnRetorno = resultFoundRaw;

    const query = async () => {

      //Constante que ira pesquisar todos os mandados do BNMP apartir de um determinado CPF
      const resultado = await ctx.get(
        `${modelConfig.get("CORTEX_URL_PESSOAS")}/amadores/listarAmadores/${cpf}`,
        cpfUsuario
      );


      // Validação para caso a consulta retorne nenhuma pessoa, lembrando que a API do cortex
      // ja possui essa validação mas é bom coloca por via das duvidas.
      if(!resultado) return null;
      return Promise.all(resultado.map(amador => getAmadorLista_CORTEX(amador.id, cpfUsuario)))
      .then(formataAmador(resultado));
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
  const getAmadorLista_CORTEX = async function (id: number, cpfUsuario: string) {

    const resultado = await ctx.get(
      `${modelConfig.get("CORTEX_URL_PESSOAS")}/amadores/amador/${id}`,
      cpfUsuario
    )
    return resultado;
  };


