import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaVeiculoService } from '../../../services/pesquisa/pesquisa.veiculo.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-veiculo',
  templateUrl: './veiculo.component.html',
})
export class VeiculoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;

  veiculosEncontrados = [];
  veiculosPF;
  veiculosPJ;

  nProcesso: string;
  msgRegistroNaoEncontrado: string;

  campos = [
    {id: 'fPlaca',    nome: 'Placa', dica: 'Pode ser feita busca com wildcards através do caracter especial "_"'},
    {id: 'fNome',     nome: 'Nome Proprietário', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fCPF',      nome: 'CPF Proprietário'},
    {id: 'fCNPJ',     nome: 'CNPJ Proprietário'},
    {id: 'fChassi',   nome: 'Chassi'},
    // {id: 'fRenavam',  nome: 'Renavam', dica: 'Insira 11 números.'},
  ];


  // Colunas da tabela de resultado
  dicionarioDadosPF = {
    nome        : {nome: 'Nome' },
    cpf         : {nome: 'CPF' },
    placa       : {nome: 'Placa' },
    marcaModelo : {nome: 'Marca / Modelo' },
    cor         : {nome: 'Cor' },
    anoFab      : {nome: 'Ano' },
    anoRegistro : {nome: 'Data Registro' },
  }

  dicionarioDadosPJ = {
    razaoSocial : {nome: 'Razão Social' },
    cnpj        : {nome: 'CNPJ' },
    placa       : {nome: 'Placa' },
    marcaModelo : {nome: 'Marca / Modelo' },
    cor         : {nome: 'Cor' },
    anoFab      : {nome: 'Ano' },
    anoRegistro : {nome: 'Data Registro' },
  }

  buscaPF;
  buscaPJ;

  constructor(
    private pesquisa: PesquisaVeiculoService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.nProcesso = this.utils.getProcesso();

    this.buscaPF = false;
    this.buscaPJ = false;
  }

  ngOnDestroy() {
    this.resetaComponente();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaComponente() {
    this.buscaSucesso     = false;
    this.buscaFinalizada  = false;

    this.veiculosPF       = null;
    this.veiculosPJ       = null;
  }

  onPesquisa(pesquisaForm: FormGroup) {
    this.resetaComponente();

    const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
    if (!invalido) {
      this.chamaService(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;
          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;

            this.veiculosPF = dados.filter((dado: any) => (dado.cpf) ? true : false);
            this.veiculosPJ = dados.filter((dado: any) => (dado.cnpj) ? true : false);

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
        error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
        });
    } else {
      this.message.add(invalido[0]);
    }
  }

  chamaService(dados) {
    if (dados.fCPF) {
      this.buscaPF = true;
      this.buscaPJ = false;

      return this.pesquisa.pesquisaVeiculoCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    } else if (dados.fNome) {
      this.buscaPF = true;
      this.buscaPJ = false;

      return this.pesquisa.pesquisaVeiculoNome(dados.fNome, this.nProcesso);
    } else if (dados.fCNPJ) {
      this.buscaPF = false;
      this.buscaPJ = true;

      return this.pesquisa.pesquisaVeiculoCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fChassi) {
      this.buscaPF = true;
      this.buscaPJ = true;

      return this.pesquisa.pesquisaVeiculoChassi(dados.fChassi, this.nProcesso);
    } else if (dados.fPlaca) {
      this.buscaPF = true;
      this.buscaPJ = true;

      return this.pesquisa.pesquisaVeiculoPlaca(dados.fPlaca, this.nProcesso);
    } else if (dados.fRenavam) {
      this.buscaPF = true;
      this.buscaPJ = true;

      return this.pesquisa.pesquisaVeiculoRenavam(dados.fRenavam, this.nProcesso);
    }
  }
}
