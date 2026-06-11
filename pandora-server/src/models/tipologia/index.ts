import { removerAcentos } from '../../utils';
import * as ss from 'string-similarity';

export * from './tipologia.tcu.model';
export * from './tipologia.cacafantasmas.simplificado';
export * from './tipologia.cacafantasmas.detalhado';
export * from './tipologia.tce.model';


export let trataResultadosCruzamentoSisobi = function (dados) {
  return dados.map(registro => {
    const tmp_nome         = removerAcentos(registro.nome.trim());
    const tmp_nomeFalecido = removerAcentos(registro.nomeFalecido.trim());

    const semelhanca = ss.compareTwoStrings(tmp_nome, tmp_nomeFalecido);

    if (semelhanca > 0.9) {
        const {nomeFalecido, ...dado } = registro;
        return dado;
    } else {
        return null;
    }
  }).filter(d => d !== null);
}
