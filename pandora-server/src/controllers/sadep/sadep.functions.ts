import { filtraNaoEncontrados, flat, limpaNumero } from '../../utils';
import * as mandadosSadepModel from './../../models/mandado';
import * as empregadorModel from './../../models/empregador';
import * as enderecoModel from './../../models/endereco';
import * as utilsModel from '../../models/utils/utils.model';

/**
 * Retorna mandados de prisão em aberto.
 * @param uf
 * @returns
 */
export let getMandadosEmAbertoPorUF_SADEP = function(uf: string) {

  return Promise.all([
    mandadosSadepModel.getMandadosEmAbertoPorUF_SADEP(uf)
  ])
  .then(mandados => filtraNaoEncontrados(mandados));
}

export let getDadosDetalhamentoCPF_SADEP = function(cpf: string) {
  cpf = limpaNumero(cpf);

  return Promise.all([
    mandadosSadepModel.getDadosMandadoPorCPF_SADEP(cpf),

    empregadorModel.getEmpregadoresDetalhadoCPFSadep_RAIS(cpf),

    // ENDEREÇOS
    enderecoModel.getEnderecoCPF_IPC(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),

    enderecoModel.getEnderecoCPF_Sispesquisa_Enderecos(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_ReceitaNovo_PessoaFisica(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_ReceitaFull_PF(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_BD_Receita(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_Sispesquisa_VeiculosNovo(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_IPVA(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_Renach_2016_08(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
    enderecoModel.getEnderecoCPF_VEP(cpf).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "endereco")),
  ])
  .then(r => flat(r))
  .then(mandados => filtraNaoEncontrados(mandados));
}
