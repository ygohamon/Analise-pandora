import { Component, OnInit, OnDestroy, Output, Input, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilsService } from '../../../services/common/utils.service';

import { PesquisaInvestigadoService } from 'src/app/services/pesquisa/pesquisa.investigado.service';
import { PesquisaProntuarioService } from 'src/app/services/pesquisa/pesquisa.prontuario.service';
import { PesquisaOrcrimService } from 'src/app/services/pesquisa/pesquisa.orcrim.service';
import { ExportService } from 'src/app/services/common/export.service';
import { PesquisaSASPService } from 'src/app/services/pesquisa/pesquisa.sasp.service';
import { ConselhoTableComponent } from 'src/app/shared/apresentacao/pessoa/conselho.table.component';


@Component({
  selector: 'app-investigado',
  templateUrl: './investigado.component.html',
  styleUrls: ['./prontuario.component.css'],
})
export class InvestigadoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso = false;
  buscaFinalizada = false;
  nProcesso:       string;
  @Input() exportFilename;

  // Resultado da consulta
  prontuariosEncontrados;
  saspPessoa;
  pessoa;
  saspVinculo;
  vinculo;
  saspFatos;
  fatos;
  saspAbordagem;
  abordagem;
  saspOcorrencia;
  ocorrencia;

  orcrimsEncontrados = [];
  investigadosPF;
  investigadosPJ;
  colunasTabelaInvestigado;
  colunasTabelaProntuario;
  colunasTabelaSASP;
  colunasTabelaORCRIM;

  msgRegistroNaoEncontrado: string;

  // Colunas da tabela de resultado
  dicionarioDadosPF = {
    nomeOperacao                  : {nome : 'Nome da Operação'},
    dataOperacao                  : {nome : 'Data da Operação'},
    acaoPenal                     : {nome : 'Ação Penal'},
    nome                          : {nome : 'Nome'},
    faccao                        : {nome : 'Facção'},
    cpf                           : {nome : 'CPF'},
    nomeMae                       : {nome : 'Nome da Mãe'},
    dataNascimento                : {nome : 'Data de Nascimento'},
    municipio                     : {nome : 'Município'},
    uf                            : {nome : 'UF'},
  }

  dicionarioDadosPJ = {
    nomeOperacao                  : {nome : 'Nome da Operação'},
    dataOperacao                  : {nome : 'Data da Operação'},
    acaoPenal                     : {nome : 'Ação Penal'},
    razaoSocial                   : {nome : 'Razão Social'},
    cnpj                          : {nome : 'CNPJ'},
    nomeFantasia                  : {nome : 'Nome Fantasia'},
    dataInicioAtividade           : {nome : 'Data Início Atividade'},
    municipio                     : {nome : 'Município'},
    uf                            : {nome : 'UF'},
  }

  dicionarioOrcrim = {
    nome                          : { nome: 'Nome' },
    faccao                        : { nome: 'Facção' },
    cpf                           : { nome: 'CPF' },
    rg                            : { nome: 'RG'},
    dataNascimento                : { nome: 'Data de Nascimento', fn: this.utils.formataData },
    municipio                     : { nome: 'Municipio'},
  }

  dicionarioProntuario = {
    nome                          : {nome : 'Nome'},
    data                          : {nome : 'Data de Nascimento'},
    cpf                           : {nome : 'CPF'},
    rg                            : {nome : 'RG'},
    orgao                         : {nome : 'Orgão de Expedição'},
    pai                           : {nome : 'Nome Pai'},
    mae                           : {nome : 'Nome Mãe'},
    enderecos                     : {nome : 'Endereços'},
    vulgo                         : {nome : 'Vulgo'},
    comparsas                     : {nome : 'Comparsas'},
    faccao                        : {nome : 'Facção'},
    atividade                     : {nome : 'Principal Atividade'},
    cidade                        : {nome : 'Cidade'},
    cabelo                        : {nome : 'Cabelo'},
    olhos                         : {nome : 'Olhos'},
    cutis                         : {nome : 'Cutis'},
    barba                         : {nome : 'Barba'},
    cicatriz                      : {nome : 'Cicatriz'},
    tatuagem                      : {nome : 'Tatuagem'},
    updated_at                    : {nome : 'Ultima atualização'},
    naturalidade                  : {nome : 'Naturalidade'},
    sexo                          : {nome : 'Sexo'},
    conjuge                       : {nome : 'Conjuge'},
    profissao                     : {nome : 'Profissão'},
    falecido                      : {nome : 'Falecido'},
    idade                         : {nome : 'Idade'},
    imagens                       : {nome : 'Imagens'},
    info                          : {nome : 'Informações Adicionais'},
  }

  dicionarioSASP = {
    alcunha                       : {nome : 'Alcunha'},
    tipo_documento                : {nome : 'Tipo do Documento'},
    documento                     : {nome : 'Documento'},
    nome                          : {nome : 'Nome'},
    mae                           : {nome : 'Mãe'},
    pai                           : {nome : 'Pai'},
    nascimento                    : {nome : 'Data de Nascimento'},
    descricao_inconsistencias     : {nome : 'Descrição Inconsistencias'},
    colaborador_inconsistencias   : {nome : 'Colaborador Inconsistencias'},
    rotulacao                     : {nome : 'Rotulação'},
    tatuagem                      : {nome : 'Tatuagem'},
    tipo_vinculos                 : {nome : 'Tipo Veiculo'},
    descricao_vinculos            : {nome : 'Descrição Veiculo'},
    relato_fato                   : {nome : 'Relato Fato'},
    descricao_fato_crime          : {nome : 'Descrição Fato Crime'},
  }

  campos = [
    {id: 'fCPF',                     nome: 'CPF'},
    {id: 'fNome',                    nome: 'Nome'},
    {id: 'fCNPJ',                    nome: 'CNPJ'},
    {id: 'fRazaoSocial',             nome: 'Razão Social'},
    {id: 'fGenerico',                nome: 'Nome da Operação'},
    {id: 'fORCRIM',                  nome: 'ORCRIM'},
    {id: 'fAlcunha',                 nome: 'Alcunha'},
  ]

  constructor(
      private pesquisaInvestigado: PesquisaInvestigadoService,
      private pesquisaProntuario: PesquisaProntuarioService,
      private pesquisaOrcrim: PesquisaOrcrimService,
      private pesquisaSasp: PesquisaSASPService,
      private message: MessageService,
      public utils: UtilsService,
      private sanitizer: DomSanitizer,
      public exporta: ExportService,
  ) {}

  @Output() dataChange = new EventEmitter();

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
    // tslint:disable-next-line: max-line-length
    this.colunasTabelaInvestigado = Object.keys(this.dicionarioDadosPF).map(d => { return { field: d, header: this.dicionarioDadosPF[d].nome } });
    this.colunasTabelaORCRIM = Object.keys(this.dicionarioOrcrim).map(d => { return { field: d, header: this.dicionarioOrcrim[d].nome } });
    // tslint:disable-next-line: max-line-length
    this.colunasTabelaProntuario = Object.keys(this.dicionarioProntuario).map(d => { return { field: d, header: this.dicionarioProntuario[d].nome } });
    this.colunasTabelaSASP = Object.keys(this.dicionarioSASP).map(d => { return { field: d, header: this.dicionarioSASP[d].nome } });
  }

  ngOnDestroy(): void {
    this.resetaComponente();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaComponente() {
    this.buscaSucesso      = false;
    this.buscaFinalizada   = false;

    this.investigadosPF = null;
    this.investigadosPJ = null;
    this.prontuariosEncontrados = null;
    this.orcrimsEncontrados = null;
    this.saspPessoa = null;
    this.pessoa = null;
    this.saspVinculo = null;
    this.vinculo = null;
    this.saspFatos = null;
    this.fatos = null;
    this.saspAbordagem = null;
    this.abordagem = null;
    this.saspOcorrencia = null;
    this.ocorrencia = null;
  }

  sanitize(img: string) {
    const url = `data:image/png;base64,${img}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  exportPdf() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.pdf` : 'export.pdf';

    const fn = (doc) => {
      doc.setFontSize(18);
      doc.text('Registro da Investigação', 14, 22);
    }
    // tslint:disable-next-line: max-line-length
    this.exporta.exportPdf(this.colunasTabelaInvestigado, this.investigadosPF && this.investigadosPJ, filename, fn, 35);
    this.exporta.exportPdf(this.colunasTabelaORCRIM, this.pesquisaOrcrim, filename, fn, 35);
    this.exporta.exportPdf(this.colunasTabelaProntuario, this.pesquisaProntuario, filename, fn, 35);
    this.exporta.exportPdf(this.colunasTabelaSASP, this.pesquisaSasp, filename, fn, 35);
  }

  exportExcel() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.xlsx` : 'export.xlsx';
    // tslint:disable-next-line: max-line-length
    this.exporta.exportExcel(this.investigadosPF && this.investigadosPJ, filename);
    this.exporta.exportExcel(this.prontuariosEncontrados, filename);
    this.exporta.exportExcel(this.orcrimsEncontrados, filename);
  }

  onPesquisa(pesquisaForm: FormGroup) {
    this.resetaComponente();
    if(pesquisaForm.value.fORCRIM){
      return null
    };

    const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
    if (!invalido) {
      this.chamaServiceInvestigado(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const {status, msg, dados} = resultado;
          this.buscaFinalizada       = true;

          if (status === 'OK') {
            this.buscaSucesso   = true;
            this.investigadosPF = dados.filter((d: any) => !!d.cpf);
            this.investigadosPJ = dados.filter((d: any) => !!d.cnpj);

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
      error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });

      this.chamaServiceProntuario(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {


          const {status, msg, dados} = resultado;
          this.buscaFinalizada       = true;

          if (status === 'OK') {
            this.buscaSucesso   = true;
            this.prontuariosEncontrados = dados.map((d, i) => Object.assign(d, { id: i }));

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa de prontuario concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
      error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro de prontuario.'));
      });

      this.chamaServiceSASP(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const {status, msg, dados} = resultado;
          this.buscaFinalizada       = true;

          if (status === 'OK') {
            this.buscaSucesso   = true;

            const dadop = dados.filter((d: any) => !!d.documentos)
            this.pessoa = this.utils.first(dadop.map(d => Object.assign(d)))
            this.saspPessoa = this.pessoa.documentos.map(d => Object.assign(d))

            const dadov = dados.filter((d: any) => !!d.vinculo)
            this.vinculo = this.utils.first(dadov.map(d => Object.assign(d)))
            this.saspVinculo = this.vinculo.vinculo.map(d => Object.assign(d))

            const dadof = dados.filter((d: any) => !!d.fatos)
            this.fatos = this.utils.first(dadof.map(d => Object.assign(d)))
            this.saspFatos = this.fatos.fatos.map(d => Object.assign(d))

            const dadoa = dados.filter((d: any) => !!d.abordagem)
            this.abordagem = this.utils.first(dadoa.map(d => Object.assign(d)))
            this.saspAbordagem = this.abordagem.abordagem.map(d => Object.assign(d))

            const dado = dados.filter((d: any) => !!d.ocorrencia)
            this.ocorrencia = this.utils.first(dado.map(d => Object.assign(d)))
            this.saspOcorrencia = this.ocorrencia.ocorrencia.map(d => Object.assign(d))

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa de PM concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
      error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro de PM.'));
      });

    } else {
      this.message.add(invalido[0]);
    }
  }

  onPesquisaOrcrim(pesquisaForm: FormGroup) {
    this.resetaComponente();
    if(!pesquisaForm.value.fORCRIM){
      return null
    }

    const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
    if (!invalido) {
      this.chamaServiceOrcrim(pesquisaForm.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        const {status, msg, dados} = resultado;
        this.buscaFinalizada       = true;

        if (status === 'OK') {
          this.buscaSucesso   = true;
          const orcrim = dados.filter((d: any) => !!d.organizacoes_criminosas);
          const dado = this.utils.first(orcrim.map(d => Object.assign(d)))
          this.orcrimsEncontrados = dado.organizacoes_criminosas.map(d => Object.assign(d))

          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      },
      error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro de prontuario.'));
      });

    } else {
      this.message.add(invalido[0]);
    }
  }

  /**
   *
   * @param dados
   */
  chamaServiceInvestigado(dados) {
    if (dados.fCPF) {
      return this.pesquisaInvestigado.pesquisaInvestigadoCPF(this.utils.checaCPF(dados.fCPF));
    } else if (dados.fCNPJ) {
      return this.pesquisaInvestigado.pesquisaInvestigadoCNPJ(this.utils.checaCNPJ(dados.fCNPJ));
    } else if (dados.fNome) {
      return this.pesquisaInvestigado.pesquisaInvestigadoNome(dados.fNome);
    } else if (dados.fRazaoSocial) {
      return this.pesquisaInvestigado.pesquisaInvestigadoRazaoSocial(dados.fRazaoSocial);
    } else if (dados.fGenerico) {
      return this.pesquisaInvestigado.pesquisaInvestigadoOperacao(dados.fGenerico);
    } else if (dados.fAlcunha) {
      return this.pesquisaInvestigado.pesquisaInvestigadoAlcunha(dados.fAlcunha);
    } else {
      if(!dados.fORCRIM){
        this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
      }
      return null;
    }
  }

  chamaServiceProntuario(dados){
    if(dados.fCPF) {
      return this.pesquisaProntuario.pesquisaProntuarioCPF(this.utils.checaCPF(dados.fCPF));
    } else if (dados.fNome) {
      return this.pesquisaProntuario.pesquisaProntuarioNome(dados.fNome);
    } else if (dados.fRG) {
      return this.pesquisaProntuario.pesquisaProntuarioRG(dados.fRG);
    } else if (dados.fAlcunha) {
      return this.pesquisaProntuario.pesquisaProntuarioAlcunha(dados.fAlcunha);
    } else {
      return null;
    }
  }

  chamaServiceSASP(dados){
    if(dados.fCPF) {
      return this.pesquisaSasp.pesquisaSASPCPF(this.utils.checaCPF(dados.fCPF));
    } else if (dados.fNome) {
      return this.pesquisaSasp.pesquisaSASPNOME(dados.fNome);
    } else if (dados.fRG) {
      return this.pesquisaSasp.pesquisaSASPRG(dados.fRG);
    } else if (dados.fAlcunha) {
      return this.pesquisaSasp.pesquisaSASPALCUNHA(dados.fAlcunha);
    } else {
      return null;
    }
  }

  chamaServiceOrcrim(dados){
    if(dados.fORCRIM){
      return this.pesquisaOrcrim.pesquisaOrcrim(dados.fORCRIM);
    } else {
      return null;
    }
  }

}
