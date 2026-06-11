import * as geocoordenadasModel from '../../models/geocoordenada';

import {
    filtraNaoEncontrados,
    print,
    limpaNumero
} from './../../utils';

export let procuraGeoCoordenadasEmpresasCPF = function (cpf: string, datainicio, datafim){
    cpf = limpaNumero(cpf);
 
    return Promise.all([
        geocoordenadasModel.getGeocoordenadasMapaCalorCPFPeriodo(cpf, datainicio, datafim)
    ])

        .then(dados => filtraNaoEncontrados(dados))
}
