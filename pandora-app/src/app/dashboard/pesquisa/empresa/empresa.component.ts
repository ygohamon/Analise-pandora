import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PesquisaEmpresaService } from '../../../services/pesquisa/pesquisa.empresa.service';
import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
})
export class EmpresaComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:         boolean = false;
  buscaFinalizada:      boolean = false;
  empresasEncontradas           = [];
  nProcesso: string;

  campos = [
    {id: 'fCNPJ',               nome: 'CNPJ'},
    {id: 'fNomeFantasia',       nome: 'Nome Fantasia', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fRazaoSocial',        nome: 'Razão Social', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fSocioPFNome',        nome: 'Sócio - Nome', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fSocioPFCPF',         nome: 'Sócio - CPF'},
    // {id: 'fSocioPJRazaoSocial', nome: 'Sócio - Razão Social', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fSocioPJCNPJ',        nome: 'Sócio - CNPJ'},
    {id: 'fEndereco',           nome: 'Endereço', dica: 'Insira o logradouro.'},
    {id: 'fEmail',              nome: 'Email'},
    {id: 'fTelefone',           nome: 'Telefone', dica: 'Tente combinações com/sem DDD e/ou com/sem 9 extra.'},
  ];

  // Colunas da tabela de resultado
  dicionarioDados      = {
    razaoSocial        : {nome: 'Razão Social' },
    cnpj               : {nome: 'CNPJ' },
    nomeFantasia       : {nome: 'Nome Fantasia' },
    dataInicioAtividade: {nome: 'Data Início Atividade' },
    municipio          : {nome: 'Município' },
    uf                 : {nome: 'UF' },
  }

  constructor(
    private pesquisa: PesquisaEmpresaService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
  }

  ngOnDestroy() {
    this.resetaComponente();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaComponente() {
    this.empresasEncontradas = null;
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
          const {status, dados, msg} = resultado;
          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;
            this.empresasEncontradas = dados;

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
    if (dados.fCNPJ) {
      return this.pesquisa.pesquisaEmpresaCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fNomeFantasia) {
      return this.pesquisa.pesquisaEmpresaNomeFantasia(dados.fNomeFantasia, this.nProcesso);
    } else if (dados.fRazaoSocial) {
      return this.pesquisa.pesquisaEmpresaRazaoSocial(dados.fRazaoSocial, this.nProcesso);
    } else if (dados.fEndereco) {
      return this.pesquisa.pesquisaEmpresaEndereco(dados.fEndereco, this.nProcesso);
    } else if (dados.fTelefone) {
      return this.pesquisa.pesquisaEmpresaTelefone(dados.fTelefone, this.nProcesso);
    } else if (dados.fEmail) {
      return this.pesquisa.pesquisaEmpresaEmail(dados.fEmail, this.nProcesso);
    } else if (dados.fSocioPJCNPJ) {
      return this.pesquisa.pesquisaEmpresaSocioPJCNPJ(this.utils.checaCNPJ(dados.fSocioPJCNPJ), this.nProcesso);
    } else if (dados.fSocioPFCPF) {
      return this.pesquisa.pesquisaEmpresaSocioPFCPF(this.utils.checaCPF(dados.fSocioPFCPF), this.nProcesso);
    } else if (dados.fSocioPFNome) {
      return this.pesquisa.pesquisaEmpresaSocioPFNome(dados.fSocioPFNome, this.nProcesso);
    }
  }
}
