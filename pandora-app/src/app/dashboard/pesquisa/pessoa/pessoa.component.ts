import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { PesquisaPessoaService } from '../../../services/pesquisa/pesquisa.pessoa.service';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-pessoa',
  templateUrl: './pessoa.component.html',
})
export class PessoaComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  isMobile:        boolean = false;
  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;
  nProcesso:       string;

  pessoasEncontradas = [];

  campos = [
    {id: 'fCPF',            nome: 'CPF'},
    {id: 'fNome',           nome: 'Nome', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fRG',             nome: 'RG'},
    // {id: 'fCNH',            nome: 'CNH'},
    {id: 'fNomePai',        nome: 'Nome do Pai', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fNomeMae',        nome: 'Nome da Mãe', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fTituloEleitor',  nome: 'Título de Eleitor'},
    {id: 'fTelefone',       nome: 'Telefone', dica: 'Tente combinações com/sem DDD e/ou com/sem 9 extra.'},
    {id: 'fEndereco',       nome: 'Endereço', dica: 'Insira o logradouro.'},
    {id: 'fEmail',          nome: 'Email'},
  ];

  // Colunas da tabela de resultado
  dicionarioDados = {
    nome          : {nome: 'Nome'},
    cpf           : {nome: 'CPF'},
    rg            : {nome: 'RG'},
    nomeMae       : {nome: 'Nome Mãe'},
    dataNascimento: {nome: 'Data Nascimento'},
    municipio     : {nome: 'Município'},
    uf            : {nome: 'UF'},
  }

  constructor(
    private pesquisa: PesquisaPessoaService,
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
    this.pessoasEncontradas = null;
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
          this.buscaFinalizada       = true;
          if (status === 'OK') {
            this.buscaSucesso       = true;
            this.pessoasEncontradas = dados;

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'))

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
      return this.pesquisa.pesquisaPessoaCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    } else if (dados.fNome) {
      return this.pesquisa.pesquisaPessoaNome(dados.fNome, this.nProcesso);
    } else if (dados.fRG) {
      return this.pesquisa.pesquisaPessoaRG(dados.fRG, this.nProcesso);
    } else if (dados.fTituloEleitor) {
      return this.pesquisa.pesquisaPessoaTitulo(dados.fTituloEleitor, this.nProcesso);
    } else if (dados.fNomePai) {
      return this.pesquisa.pesquisaPessoaNomePai(dados.fNomePai, this.nProcesso);
    } else if (dados.fNomeMae) {
      return this.pesquisa.pesquisaPessoaNomeMae(dados.fNomeMae, this.nProcesso);
    } else if (dados.fCNH) {
      return this.pesquisa.pesquisaPessoaCNH(dados.fCNH, this.nProcesso);
    } else if (dados.fTelefone) {
      return this.pesquisa.pesquisaPessoaTelefone(dados.fTelefone, this.nProcesso);
    } else if (dados.fEmail) {
      return this.pesquisa.pesquisaPessoaEmail(dados.fEmail, this.nProcesso);
    } else if (dados.fEndereco) {
      return this.pesquisa.pesquisaPessoaEndereco(dados.fEndereco, this.nProcesso);
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
      return null;
    }
  }
}
