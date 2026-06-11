import * as tipologiaModel from '../../models/tipologia';
import * as empresaModel from '../../models/empresa';
import * as socioModel from '../../models/socio';
import * as enderecoModel from '../../models/endereco';
import * as eleitoralModel from '../../models/eleitoral';
import * as utilsModel from '../../models/utils/utils.model';
import * as sefazMlModel from '../../models/_apps/sefazML'

import * as dnaModel from '../../models/_apps/dna';

import {
    filtraNaoEncontrados,
    flat,
    print,
    limpaNumero,
} from '../../utils';

export let getInformacoesEmpresa = function (cnpj: string) {
    cnpj = limpaNumero(cnpj);

    return Promise.all([
        empresaModel.getEmpresaDetalhadoCNPJ_BD_Receita(cnpj),

        socioModel.getSocioPFEmpresaSimplificadoCNPJ_BD_Receita(cnpj),
        socioModel.getSocioPJEmpresaSimplificadoCNPJ_BD_Receita(cnpj),

        enderecoModel.getEnderecoCNPJ_BD_Receita(cnpj).then(end => utilsModel.getGeoCoordenadas(end)),
        enderecoModel.getEnderecoCNPJ_BD_Receita(cnpj),

        dnaModel.getInformacoesSociosCNPJ(cnpj),
        dnaModel.getValoresMunicipioCNPJ_Sagres_Municipal(cnpj),

        dnaModel.getTotalEmpenhadoPagoCNPJ_Sagres_Municipal(cnpj),
        dnaModel.getTotalEmpenhadoPagoCNPJ_Sagres_Estadual(cnpj),

        dnaModel.getModalidadesCNPJ_Sagres_Municipal(cnpj),
        dnaModel.getModalidadesCNPJ_Sagres_Estadual(cnpj),

        dnaModel.getTopEmpenhosPagosCNPJ_Sagres_Municipal(cnpj),
        dnaModel.getTopEmpenhosPagosCNPJ_Sagres_Estadual(cnpj),

        dnaModel.getValoresModalidadesCNPJ_Sagres_Municipal(cnpj),
        dnaModel.getValoresModalidadesCNPJ_Sagres_Estadual(cnpj),

        dnaModel.getContadoresCNPJ(cnpj),
        dnaModel.getEmpresasContadoresCNPJ(cnpj),
        dnaModel.getEmpresasContadoresReceberamEstadoCNPJ(cnpj),
        dnaModel.getEmpresasContadoresParticiparamCNPJ(cnpj),
        // dnaModel.getEmpresasReceberamDoEstado(cnpj),

        dnaModel.getEmpresasMesmoTelefoneCNPJ(cnpj),
        dnaModel.getEmpresasMesmoEmailCNPJ(cnpj),

        dnaModel.getAtividadeEconomicaCNPJ(cnpj),

        sefazMlModel.getItensAnomalos(null ,cnpj, null, null, null, null),

        tipologiaModel.getTipologiaSimplificadoCNPJ_Tipologias(cnpj),
        tipologiaModel.getTipologiasPJSimplificadoTCEFinger_Tipologias(cnpj),
        tipologiaModel.getTipologiasLicitacoesPJTCEFinger_Tipologias(cnpj),

        eleitoralModel.getDoacoesFeitasSimplificadoCNPJ_Eleitoral(cnpj),
        eleitoralModel.getCandidatosFornecedoresSimplificadoFornecedorCNPJ_Eleitoral(cnpj),
    ])
        .then(r => flat(r))
        .then(tipologias => filtraNaoEncontrados(tipologias))
}
