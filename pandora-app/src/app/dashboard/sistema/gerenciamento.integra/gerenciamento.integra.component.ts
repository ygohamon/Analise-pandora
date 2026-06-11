import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UsuarioService } from '../../../services/usuario/usuario.service';
import { SistemaService } from '../../../services/sistema/sistema.service';
import { UtilsService } from '../../../services/common/utils.service';
import { DownloadService } from '../../../services/download/download.service';

@Component({
  selector: 'app-gerenciamento-integra',
  templateUrl: './gerenciamento.integra.component.html',
  providers: [ConfirmationService],
  styles: ['./gerenciamento.integra.component.css']
})
export class GerenciamentoIntegraComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  requisicaoSelecionada;
  requisicoesEncontradas           = [];
  buscaFinalizada:      boolean = false;
  buscaSucesso:         boolean = false;
  telaDetalhesBool:     boolean = false;

  msgRegistroNaoEncontrado: string;

  opcoesTipoReferencia;
  opcoesArea;
  opcoesGrupo;
  opcoesFinalizado;
  opcoesTempoInformacao;

  dicionarioDados = {
    nome: {nome: 'Requerente' },
    email: {nome: 'E-mail' },
    promotoria: {nome: 'Promotoria' },
    tipoReferencia: {nome: 'Referência', fn: (x) => this.getLabel(this.opcoesTipoReferencia, x) },
    doc: {nome: 'Número' },
    tipoArea: {nome: 'Área', fn: (area) => this.getLabel(this.opcoesArea, area)},
    tipoGrupo: {nome: "Grupo", fn: (grupo) => this.getLabel(this.opcoesGrupo, grupo)},
    finalizado: {nome: "Finalizado", fn: (finalizado) => this.getLabel(this.opcoesFinalizado, finalizado)},
    tempoInformacao: {nome: "Tempo Útil", fn: (tempo) => this.getLabel(this.opcoesTempoInformacao, tempo)},
    dataRequisicao: {nome: "Data Requisição", fn: (dtRequisicao) => this.utils.formataData(dtRequisicao) }
  }

  constructor(
    private sistema: SistemaService,
    private downloadService: DownloadService,
    public utils: UtilsService,
    protected msgs: MessageService
  ) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

    this.opcoesTipoReferencia = [
      {label: 'Processo',     value: 'processo'},
      {label: 'Procedimento', value: 'procedimento'},
      {label: 'PIC',          value: 'pic'}
    ];

    this.opcoesArea = [
      {label: 'Penal',  value: 'penal'},
      {label: 'Cível',  value: 'cível'}
    ];

    this.opcoesGrupo = [
      {label: 'Patrimônio',             value: 'patrimonio'},
      {label: 'Terceiro Setor',         value: 'terceiroSetor'},
      {label: 'Cidadão',                value: 'cidadao'},
      {label: 'Meio Ambiente',          value: 'meioAmbiente'},
      {label: 'Idoso',                  value: 'idoso'},
      {label: 'Infância e Juventude',   value: 'infanciaJuventude'},
      {label: 'Educação',               value: 'educacao'},
      {label: 'Consumidor',             value: 'consumidor'},
      {label: 'Saúde',                  value: 'saude'},
    ];

    this.opcoesFinalizado = [
      {label: 'Sim', value: true},
      {label: 'Não', value: false}
    ];

    this.opcoesTempoInformacao = [
      {label: '10 dias',  value: 10},
      {label: '15 dias',  value: 15},
      {label: '30 dias',  value: 30},
    ];

    this.getListaRequisicoes();
  }

  getListaRequisicoes() {

    this.sistema.getListaRequisicoes()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        const {status, msg, dados} = resultado;
        this.buscaFinalizada       = true;

        if (status === 'OK') {
          this.buscaSucesso           = true;
          this.requisicoesEncontradas = dados;
        } else {
          this.msgs.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.msgs.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar a lista de requisições.'));
      });
  }

  onRowSelect(event) {
    this.telaDetalhesBool = true;
    this.requisicaoSelecionada = event;
  }

  onFinalizarRequisicao() {
    this.telaDetalhesBool = false;

    this.sistema.finalizaRequisicao(this.requisicaoSelecionada.idRequisicao)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        if (resultado.status === 'OK') {
            this.msgs.add({severity: 'success', summary: 'Confirmado', detail: resultado.msg});
        } else {
          this.msgs.add({severity: 'error', summary: 'Erro', detail: resultado.msg});
        }
      }, error => {
        this.msgs.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao finalizar a requisição.'));
      });
  }

  getLabel(obj, chave) {
    return obj.filter((el, index) => el.value === chave)[0].label;
  }

  mostraAnexo(idAnexo, nomeArquivo) {
    this.downloadService.downloadAnexoRequisicao(idAnexo)
      .subscribe((data: any) => {
        const filename = `${nomeArquivo}`;

        FileSaver.saveAs(data, filename);
      }, error =>  {
        this.msgs.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao fazer o download do anexo.'));
      }
    );
  }
}
