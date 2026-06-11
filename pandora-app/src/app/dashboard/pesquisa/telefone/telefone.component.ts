import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaTelefoneService } from '../../../services/pesquisa/pesquisa.telefone.service';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-telefone',
  templateUrl: './telefone.component.html',
})
export class TelefoneComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;

  telefonesEncontrados = [];
  telefonesPF;
  telefonesPJ;

  nProcesso: string;
  habilitaOpcoesAvancadas;

  // Campo de busca avancada
  telefoneBuscaProfunda;

  campos = [
    {id: 'fTelefone',     nome:   'Telefone', dica: 'Insira ao menos 4 números.'},
    {id: 'fCPF',          nome:   'CPF'},
    {id: 'fNome',         nome:   'Nome', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fCNPJ',         nome:   'CNPJ'},
    // {id: 'fNomeFantasia', nome:   'Nome Fantasia', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fRazaoSocial',  nome:   'Razão Social', dica: 'Insira ao menos 2 nomes.'},
    //{id: 'fNomeFantasia', nome:   'Nome Fantasia', dica: 'Insira ao menos 2 nomes.'},
  ];

  // Colunas da tabela de resultado
  dicionarioDadosPF = {
    nome     : {nome: 'Nome' },
    cpf      : {nome: 'CPF' },
    ddd      : {nome: 'DDD' },
    telefone : {nome: 'Telefone' },
  };

  dicionarioDadosPJ = {
    razaoSocial : {nome: 'Razão Social' },
    cnpj        : {nome: 'CNPJ' },
    ddd         : {nome: 'DDD' },
    telefone    : {nome: 'Telefone' },
  };

  buscaPF;
  buscaPJ;

  constructor(
    private pesquisa: PesquisaTelefoneService,
    private message: MessageService,
    private auth: AuthService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();

    this.buscaPF = false;
    this.buscaPJ = false;
    this.habilitaOpcoesAvancadas = false;

    if (this.auth.getPerfil() === 'admin') {
      this.habilitaOpcoesAvancadas = true;
    }
  }

  ngOnDestroy() {
    this.resetaComponente();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaComponente() {
    this.buscaSucesso      = false;
    this.buscaFinalizada   = false;

    this.telefonesPJ          = null;
    this.telefonesPF       = null;
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
            this.telefonesPF = dados.filter((dado: any) => (dado.cpf) ? true : false );
            this.telefonesPJ = dados.filter((dado: any) => (dado.cnpj) ? true : false );

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

  onPesquisaBuscaProfunda() {
    if (this.telefoneBuscaProfunda) {
      const telefone = {fTelefoneBuscaProfunda: this.telefoneBuscaProfunda};

      this.chamaService(telefone)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;
            this.telefonesPF = dados.filter((dado: any) => (dado.cpf) ? true : false);
            this.telefonesPJ = dados.filter((dado: any) => (dado.cnpj) ? true : false);

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
        error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
        });
    }
  }

  chamaService(dados) {
    if (dados.fCPF) {
      this.buscaPF = true;
      this.buscaPJ = false;
      return this.pesquisa.pesquisaTelefoneCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    } else if (dados.fNome) {
      this.buscaPF = true;
      this.buscaPJ = false;
      return this.pesquisa.pesquisaTelefoneNome(dados.fNome, this.nProcesso);
    } else if (dados.fCNPJ) {
      this.buscaPF = false;
      this.buscaPJ = true;
      return this.pesquisa.pesquisaTelefoneCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fNomeFantasia) {
      this.buscaPF = false;
      this.buscaPJ = true;
      return this.pesquisa.pesquisaTelefoneNomeFantasia(dados.fNomeFantasia, this.nProcesso);
    } else if (dados.fRazaoSocial) {
      this.buscaPF = false;
      this.buscaPJ = true;
      return this.pesquisa.pesquisaTelefoneRazaoSocial(dados.fRazaoSocial, this.nProcesso);
    } else if (dados.fTelefone) {
      this.buscaPF = true;
      this.buscaPJ = true;
      return this.pesquisa.pesquisaTelefoneTelefone(dados.fTelefone, this.nProcesso);
    } else if (dados.fTelefoneBuscaProfunda) {
      this.buscaPF = true;
      this.buscaPJ = false;
      return this.pesquisa.pesquisaTelefoneBuscaProfundaTelefone(dados.fTelefoneBuscaProfunda, this.nProcesso);
    }
  }
}
