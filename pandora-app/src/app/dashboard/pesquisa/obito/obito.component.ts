import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PesquisaObitoService } from '../../../services/pesquisa/pesquisa.obito.service';
import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-obito',
  templateUrl: './obito.component.html',
})
export class ObitoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso = false;
  buscaFinalizada = false;

  obitosEncontrados = [];

  nProcesso: string;

  campos = [
    {id: 'fCPF',      nome: 'CPF'},
    {id: 'fNome',     nome: 'Nome Falecido', dica: 'Insira ao menos 2 nomes.'},
  ];

  dicionarioDados = {
    obito_nome               : {nome: 'Nome' },
    obito_cpf                : {nome: 'CPF' },
    obito_nomeMae            : {nome: 'Nome Mãe' },
    dataNascimento           : {nome: 'Data Nascimento' },
    dataObito                : {nome: 'Data Óbito' },
    obito_municipioServentia : {nome: 'Cartório Município' },
    obito_ufServentia        : {nome: 'Cartório UF' },
  }

  constructor(
    private pesquisa: PesquisaObitoService,
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
    this.buscaSucesso      = false;
    this.buscaFinalizada   = false;

    this.obitosEncontrados = null;
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
            this.obitosEncontrados = dados;

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
      return this.pesquisa.pesquisaObitoCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    } else if (dados.fNome) {
      return this.pesquisa.pesquisaObitoNome(dados.fNome, this.nProcesso);
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
      return null;
    }
  }
}
