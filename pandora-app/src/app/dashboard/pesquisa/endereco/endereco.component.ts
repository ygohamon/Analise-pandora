import { Component, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {uniqWith, isEqual} from 'lodash-es';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaEnderecoService } from '../../../services/pesquisa/pesquisa.endereco.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-endereco',
  templateUrl: './endereco.component.html',
})
export class EnderecoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;

  enderecosEncontrados = [];

  nProcesso: string;
  msgRegistroNaoEncontrado: string;

  isMobile;

  campos = [
    //{id: 'fNome',         nome: 'Nome', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fCPF',          nome: 'CPF'},
    {id: 'fCNPJ',         nome: 'CNPJ'},
    {id: 'fEndereco',     nome: 'Endereço', dica: 'Insira o logradouro. É possível fazer filtros com números e/ou municípios através do separador "|". Ex: Epitacio Pessoa | 200 ou Epitacio Pessoa | 200 | Joao Pessoa '},
    //{id: 'fRazaoSocial',  nome: 'Razão Social', dica: 'Insira ao menos 2 nomes.'},
  ];

  // Colunas da tabela de resultado
  cols = [
    { field: 'tipo', header: 'Tipo' },
    { field: 'cpf_cnpj', header: 'CPF/CNPJ' },
    { field: 'nome', header: 'Nome' },
    // { field: 'cnpj', header: 'CNPJ' },
    { field: 'logradouro', header: 'Logradouro' },
    { field: 'numero', header: 'Número' },
    { field: 'cep', header: 'CEP' },
    { field: 'municipio', header: 'Município' },
    { field: 'uf', header: 'UF' },
    { field: 'numeroInstalacao', header: 'Instalação'}
  ];

  dicionarioDados = {
    tipo          : {nome: 'Tipo' },
    cpf_cnpj      : {nome: 'CPF/CNPJ' },
    nome          : {nome: 'Nome' },
    logradouro    : {nome: 'Logradouro' },
    numero        : {nome: 'Número' },
    cep           : {nome: 'CEP' },
    municipio     : {nome: 'Município' },
    uf            : {nome: 'UF' },
  };

  constructor(
    private pesquisa: PesquisaEnderecoService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.nProcesso = this.utils.getProcesso();
  }

  ngOnDestroy() {
    this.resetaComponente();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaComponente() {
    this.enderecosEncontrados = null;
    this.buscaFinalizada = false;
    this.buscaSucesso = false;
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
            this.enderecosEncontrados = uniqWith(dados, isEqual);
            this.enderecosEncontrados = this.enderecosEncontrados.map(this.trataEndereco);

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

  trataEndereco(e) {
    return {
      cpf_cnpj: (e.cpf) ? e.cpf : e.cnpj,
      tipo: (e.cpf) ? 'PF' : 'PJ',
      nome: (e.cpf) ? e.nome : e.razaoSocial,
      ...e
    };
  }

  chamaService(dados) {
    if (dados.fCPF) {
      return this.pesquisa.pesquisaEnderecoCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    } else if (dados.fCNPJ) {
      return this.pesquisa.pesquisaEnderecoCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fEndereco) {
      return this.pesquisa.pesquisaEnderecoLogradouro(dados.fEndereco, this.nProcesso);
    }
  }
}
