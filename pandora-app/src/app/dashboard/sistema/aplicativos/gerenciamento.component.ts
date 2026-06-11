import { Component, OnDestroy, OnInit } from '@angular/core';

import {uniq, groupBy} from 'lodash-es';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AplicativoService } from './../../../services/aplicativo/aplicativo.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-gerenciamento',
  templateUrl: './gerenciamento.component.html',
  providers: [ConfirmationService],
})
export class AppGerenciamentoComponent implements OnInit, OnDestroy {

  buscaSucesso                 : boolean = false;
  buscaFinalizada              : boolean = false;
  buscaPermissoesUsuarioSucesso: boolean = false;
  mostraControleAcesso         : boolean = false;
  mostraTelaDetalhes           : boolean = false;
  mostraLogsAcesso             : boolean = false;

  msgRegistroNaoEncontrado: string;

  aplicativosEncontrados = [];
  aplicativoSelecionadoDetalhes;


  opcoesAtivo;
  perfilUsuario;
  perfilUsuarioAdmin: boolean;

  // Colunas da tabela
  cols = [
    { field: 'nome',            header: 'Aplicativo' },
    { field: 'dataInicio',      header: 'Data Início' },
    { field: 'dataExpiracao',   header: 'Data Expiração' },
    { field: 'ativo',           header: 'Ativo' },
  ];

  dicionarioDados = {
    nome:             {nome: 'Aplicativo' },
    dataInicio:       {nome: 'Data Início' },
    dataExpiracao:    {nome: 'Data de Expiração' },
    ativo:            {nome: 'Ativo' }
  }

  permissoesSistema;
  secoesSistema;
  permissoesUsuario;

  constructor(
    private aplicativoService: AplicativoService,
    public utils: UtilsService,
    private confirmation: ConfirmationService,
    private message: MessageService,
    private auth: AuthService) {}

  // Locale pro calendário
  pt_br: any;

  ngOnInit() {
    this.pt_br = this.utils.locale_pt_br;
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

    this.opcoesAtivo = [
      {label: 'Ativo',    value: true},
      {label: 'Inativo',  value: false}
    ];

    this.perfilUsuario = this.auth.getPerfil();

    this.getListaAplicativos();
  }

  ngOnDestroy(): void {

  }

  getListaAplicativos() {

    this.aplicativoService.getAplicativos()
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaSucesso = true;
          this.aplicativosEncontrados = dados[0]['aplicativo'];
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Registros de aplicativos recuperados com sucesso'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar a lista de aplicativos.'));
      });
  }

  onRowSelect(aplicativo) {
    this.mostraTelaDetalhes = true;
    aplicativo.dataInicio = this.utils.toDate(aplicativo.dataInicio)
    aplicativo.dataExpiracao = this.utils.toDate(aplicativo.dataExpiracao)
    this.aplicativoSelecionadoDetalhes = aplicativo;
  }

  onAdicionarNovoApp(){
    this.aplicativoSelecionadoDetalhes = {ativo:true}
    this.mostraTelaDetalhes = true;
  }

  copiar(){
    if (this.dadosToken){
      navigator.clipboard.writeText(this.dadosToken);
      alert('Credenciais copiadas.')
    }else{
      alert('Primeiro, deve ser gerado as credenciais do aplciativo.')
    }
  }
  messageToken = null
  dadosToken = null
  onAtualizarAplicativo() {
    this.mostraTelaDetalhes = false;
    this.aplicativoService.salvarAplicativo(this.aplicativoSelecionadoDetalhes)
      .subscribe(resultado => {
        if (resultado.status === 'OK') {
          this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
          if (resultado.dados){
            this.messageToken = resultado.msg;
            this.messageToken = `Aplicativo: ${resultado.dados[0]}. Token: ${JSON.stringify(resultado.dados[1]).substring(0, 50) + '...'}`
            this.dadosToken = `Aplicativo: ${resultado.dados[0]}. Token: ${resultado.dados[1]}`
          }
          this.getListaAplicativos()
        } else {
          this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar atualizar o aplicativo.'));
      });
  }

  onRemoverAplicativo() {
    this.mostraTelaDetalhes = false;

    this.confirmation.confirm({
        message: 'Você tem certeza que deseja remover o aplicativo?',
        header: 'Confirmação',
        icon: 'fa fa-question-circle',
        accept: () => {
            this.aplicativoService.removerAplicativo(this.aplicativoSelecionadoDetalhes.id)
                .subscribe(resultado => {
                    if (resultado.status === 'OK') {
                      this.aplicativosEncontrados = this.aplicativosEncontrados.filter(p => p.id !== this.aplicativoSelecionadoDetalhes.id);
                      this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
                    } else {
                      this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
                    }
                }, error => {
                  this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar ao tentar deletar o aplicativo.'));
              });
        }
    });
  }

  isAdmin() {
    return this.perfilUsuario === 'admin' ? true : false;
  }
}
