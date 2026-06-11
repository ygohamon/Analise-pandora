
import * as pessoaModel from './../../models/pessoa';

import {
    filtraNaoEncontrados,
    print,
} from './../../utils';

export let procuraPessoaFotoCapturada = function (fotoCapturada: string, limiar: number) {
    return Promise.all([
        pessoaModel.getPessoaSimplificadoFotoCapturada_ARIEL(fotoCapturada, limiar),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
        
}
