import * as painelcovidModel from '../../models/_apps/painelcovid';
import { filtraNaoEncontrados, flat } from '../../utils';

export let procuraTabelaGeralPainelCovid = function (uf: string) {
  return Promise.all([
    painelcovidModel.getTabelaGeralPainelCovid(uf),
    painelcovidModel.getValoresMunicipio(uf),

    painelcovidModel.getTipologiaFalecidoDetalhado(uf),
    painelcovidModel.getTipologiaResidenteExteriorDetalhado(uf),
    painelcovidModel.getTipologiaProprietarioEmbarcacaoDetalhado(uf),
    painelcovidModel.getTipologiaProprietarioAeronaveDetalhado(uf),
    painelcovidModel.getTipologiaProprietarioVeiculoDetalhado(uf),

    painelcovidModel.getAgregadoFalecidosUF(uf),
    painelcovidModel.getAgregadoResidenteExteriorUF(uf),
    painelcovidModel.getAgregadoProprietarioAeronaveUF(uf),
    painelcovidModel.getAgregadoProprietarioEmbarcacaoUF(uf),
    painelcovidModel.getAgregadoServidorUF(uf),
    painelcovidModel.getAgregadoSociosUF(uf),
    painelcovidModel.getAgregadoTotalAbrilUF(uf),
    painelcovidModel.getAgregadoTotalMaioUF(uf),
  ])
    .then(r => flat(r))
    .then(tipologias => filtraNaoEncontrados(tipologias))
}
