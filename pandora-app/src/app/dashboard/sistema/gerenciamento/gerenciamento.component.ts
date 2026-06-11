import { Component, OnDestroy, OnInit } from '@angular/core';

import {uniq, groupBy} from 'lodash-es';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UsuarioService } from './../../../services/usuario/usuario.service';
import { SistemaService } from './../../../services/sistema/sistema.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-gerenciamento',
  templateUrl: './gerenciamento.component.html',
  providers: [ConfirmationService],
})
export class GerenciamentoComponent implements OnInit, OnDestroy {

  buscaSucesso                 : boolean = false;
  buscaFinalizada              : boolean = false;
  buscaPermissoesUsuarioSucesso: boolean = false;
  mostraControleAcesso         : boolean = false;
  mostraTelaDetalhes           : boolean = false;
  mostraLogsAcesso             : boolean = false;

  msgRegistroNaoEncontrado: string;

  usuariosEncontrados = [];
  usuarioSelecionadoDetalhes;
  logsUsuario = [];

  opcoesPerfil;
  opcoesAcesso;
  opcoesAtivo;
  opcoesProcesso;
  opcoesProximoLogon;
  opcoesRecadastramento;

  perfilUsuario;
  perfilUsuarioAdmin: boolean;

  // Colunas da tabela
  cols = [
    // { field: 'nome',   header: 'Nome' },
    { field: 'login',             header: 'Login' },
    { field: 'acesso',            header: 'Acesso' },
    { field: 'perfil',            header: 'Perfil' },
    { field: 'ativo',             header: 'Ativo' },
    { field: 'recadastramento',   header: 'Recadastramento' },
    { field: 'necessitaProcesso', header: 'Processo' },
    // { field: 'email',  header: 'Email' },
  ];

  dicionarioDados = {
    login: {nome: 'Login' },
    acesso: {nome: 'Acesso' },
    perfil: {nome: 'Perfil' },
    ativo: {nome: 'Ativo' },
    recadastramento: {nome: 'Recadastramento' },
    necessitaProcesso: {nome: 'Processo' },
  }

  colsLog = [
    { field: 'usuario',   header: 'Usuário' },
    { field: 'processo',  header: 'Nº Processo' },
    { field: 'secao',     header: 'Seção' },
    { field: 'item',      header: 'Item' },
    { field: 'chave',     header: 'Chave' },
    { field: 'valor',     header: 'Valor'},
    { field: 'mensagem',  header: 'Mensagem'},
    { field: 'ip',        header: 'IP' },
    { field: 'data_hora', header: 'Data/Hora' }
  ];

  dicionarioDadosLogsAcesso = {
    usuario:   { Nome: 'Usuário' },
    processo:  { Nome: 'Nº Processo' },
    secao:     { Nome: 'Seção' },
    item:      { Nome: 'Item' },
    chave:     { Nome: 'Chave' },
    valor:     { Nome: 'Valor' },
    mensagem:  { Nome: 'Mensagem' },
    ip:        { Nome: 'IP' },
    data_hora: { Nome: 'Data/Hora', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY [as] HH:mm:ss') }
  }

  permissoesSistema;
  secoesSistema;
  permissoesUsuario;

  constructor(
    private sistema: SistemaService,
    private usuarioService: UsuarioService,
    public utils: UtilsService,
    private confirmation: ConfirmationService,
    private message: MessageService,
    private auth: AuthService) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

    this.opcoesAtivo = [
      {label: 'Ativo',    value: true},
      {label: 'Inativo',  value: false}
    ];

    this.opcoesRecadastramento = [
      {label: 'Sim', value: true},
      {label: 'Não', value: false}
    ];

    this.opcoesProcesso = [
      {label: 'Sim', value: true},
      {label: 'Não', value: false}
    ];

    this.opcoesProximoLogon = [
      {label: 'Sim', value: true},
      {label: 'Não', value: false}
    ];

    this.perfilUsuario = this.auth.getPerfil();

    this.buscaPermissoesUsuarioSucesso = false;
    this.getListaAcessos();
    this.getListaPerfis();
    this.getListaUsuarios();
    this.getListaPermissoes();
  }

  ngOnDestroy(): void {
    this.logsUsuario = [];
    this.mostraLogsAcesso = false;
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  getListaPerfis() {
    this.opcoesPerfil = [];

    this.sistema.getListaPerfis()
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          const opcoes: any = dados.map(d => {return { label: d, value: d }});
          this.opcoesPerfil = this.opcoesPerfil.concat(opcoes);
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  getListaAcessos() {
    this.opcoesAcesso = [];

    this.sistema.getListaAcessos()
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          const opcoes: any = dados.map(d => {return { label: d, value: d }});
          this.opcoesAcesso = this.opcoesAcesso.concat(opcoes);
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  getListaUsuarios() {

    this.sistema.getListaUsuarios()
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaSucesso = true;
          this.usuariosEncontrados = dados;
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Registros de usuários recuperados com sucesso'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar a lista de usuários.'));
      });
  }

  getListaPermissoes() {

    this.sistema.getListaPermissoes()
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.secoesSistema = uniq(dados.map((p:any) => p.secao));
          this.permissoesSistema = groupBy(dados, (d) => d.secao);
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar a lista de permissões.'));
      });
  }

  onRowSelect(usuario) {
    this.mostraTelaDetalhes = true;
    this.usuarioSelecionadoDetalhes = usuario;
  }

  onAtualizarUsuario() {
    this.mostraTelaDetalhes = false;

    this.usuarioService.atualizarUsuario(this.usuarioSelecionadoDetalhes.id, this.usuarioSelecionadoDetalhes)
      .subscribe(resultado => {

        if (resultado.status === 'OK') {
          this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
        } else {
          this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar atualizar o usuário.'));
      });
  }

  onRemoverUsuario() {
    this.mostraTelaDetalhes = false;

    this.confirmation.confirm({
        message: 'Você tem certeza que deseja excluir o usuário ?',
        header: 'Confirmação',
        icon: 'fa fa-question-circle',
        accept: () => {
            this.usuarioService.removerUsuario(this.usuarioSelecionadoDetalhes.id)
                .subscribe(resultado => {
                    if (resultado.status === 'OK') {
                      this.usuariosEncontrados = this.usuariosEncontrados.filter(p => p.id !== this.usuarioSelecionadoDetalhes.id);
                      this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
                    } else {
                      this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
                    }
                }, error => {
                  this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar ao tentar deletar o usuário.'));
              });
        }
    });
  }

  onRedefinirSenha() {
    this.mostraTelaDetalhes = false;

    this.confirmation.confirm({
      message: 'Você tem certeza que deseja redefinir a senha do usuário: <b>' + this.usuarioSelecionadoDetalhes.login + '</b>?',
      header: 'Confirmação',
      icon: 'fa fa-question-circle',
      accept: () => {
        this.usuarioService.redefinirSenhaUsuario(this.usuarioSelecionadoDetalhes.id, this.usuarioSelecionadoDetalhes)
          .subscribe(resultado => {
            if (resultado.status === 'OK') {
              this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
            } else {
              this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
            }
          }, error => {
            this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar atualizar o usuário.'));
          });
      }
    });
  }

  /**
   * Validação para exibir ou não o botão para resetar a senha do usuário.
   * Caso atenda os requisitos, o botão fica habilitado.
   *
   * @returns boolean
   */
  showButtonRedefinirSenha() {
    this.perfilUsuarioAdmin = this.perfilUsuario === 'admin' ? true : false;
    const tipoAcesso = this.usuarioSelecionadoDetalhes.acesso === 'LOCAL' ? true : false;
    const showButton: boolean = (this.perfilUsuarioAdmin && tipoAcesso) ? true : false;

    return showButton;
  }

  isAdmin() {
    return this.perfilUsuario === 'admin' ? true : false;
  }


  abreControleAcesso() {
    this.permissoesUsuario             = null;
    this.buscaPermissoesUsuarioSucesso = false;

    const id = this.usuarioSelecionadoDetalhes.id;

    this.usuarioService.getPermissoesUsuario(id)
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.buscaPermissoesUsuarioSucesso = true;
          this.permissoesUsuario = groupBy(dados, (d) => d.secao);
          for (let secao of Object.keys(this.permissoesUsuario)) {
            this.permissoesUsuario[secao] = this.permissoesUsuario[secao].map(p => p.item);
          }
          this.mostraControleAcesso = true;
        } else {
          this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar atualizar os acessos do usuário.'));
      });
  }

  fechaControleAcesso() {
    this.mostraControleAcesso = false;
  }

  onAtualizarPermissoesUsuario() {
    const id = this.usuarioSelecionadoDetalhes.id;

    const permissoes = this.permissoesUsuario;

    this.usuarioService.atualizarPermissoesUsuario(id, permissoes)
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
        } else {
          this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar atualizar os acessos do usuário.'));
      });
  }

  onShowLogs(loginUsuario: string) {
    this.message.add(this.utils.mensagemInfo('Aguarde!', `Buscando registros de logs do usuário: ${loginUsuario}`));

    this.sistema.getLogsUsuario(loginUsuario)
      .subscribe(resultado => {
        let { status, msg, dados } = resultado;

        if (status === 'OK' && dados.length > 0) {
          this.logsUsuario = dados;
          this.mostraLogsAcesso = true;

          this.message.add(this.utils.mensagemSucesso('Sucesso!', 'Registros encontrados'));
        } else if (status === 'OK' && dados.length === 0) {
          this.message.add(this.utils.mensagemInfo('Informação', `Não existe registro nos logs para o usuário ${loginUsuario}`));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os registros!'));
      })
  }
}
