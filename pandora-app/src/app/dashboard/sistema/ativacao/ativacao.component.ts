import { Component, OnInit } from '@angular/core';

import { SelectItem, ConfirmationService, MessageService } from 'primeng/api';

import { SistemaService } from './../../../services/sistema/sistema.service';
import { AuthService } from './../../../services/auth/auth.service';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-ativacao',
  templateUrl: './ativacao.component.html',
  providers: [ConfirmationService],
})
export class AtivacaoComponent implements OnInit {

  preUsuariosEncontrados = [];
  usuarioParaAtivar;

  msgRegistroNaoEncontrado: string;

  buscaFinalizada:      boolean = false;
  buscaSucesso:         boolean = false;
  telaAtivacaoBool:     boolean = false;

  opcoesAcesso: SelectItem[];
  opcaoAcessoEscolhida;

  opcoesPerfil: SelectItem[];
  opcaoPerfilEscolhida;

  dicionarioDados = {
    origem:          {nome: 'Origem', fn: (x) => x.toUpperCase() },
    nome:            {nome: 'Nome', fn: (x) => x.toUpperCase() },
    titularidade:    {nome: 'Titularidade', fn: (x) => x.toUpperCase() },
    lotacao:         {nome: 'Lotação', fn: (x) => x !== null ? x.toUpperCase() : ''},
    dataCadastro:    {nome: 'Data Cadastro', fn: (x) => this.utils.formataData(x) },
    dataAtualizacao: {nome: 'Data Atualização', fn: (x) => this.utils.formataData(x) },
  }

  constructor(
    private sistema: SistemaService,
    private confirmation: ConfirmationService,
    private message: MessageService,
    private auth: AuthService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

    this.getListaAcessos();
    this.getListaPerfis();
    this.getListaPreUsuarios();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  getListaPerfis() {
    this.opcoesPerfil = [{label: 'Selecione perfil', value: null}];

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
    this.opcoesAcesso = [{label: 'Selecione acesso', value: null}];

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

  getListaPreUsuarios() {

    this.sistema.getListaAprovacao()
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaSucesso = true;
          this.preUsuariosEncontrados = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  onAtivarRecadastro(preUsuario) {
    this.usuarioParaAtivar = preUsuario;

    this.sistema.ativarCadastroUsuario(this.usuarioParaAtivar.id, this.usuarioParaAtivar)
      .subscribe(resultado => {

        if (resultado.status === 'OK') {
          this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
          this.preUsuariosEncontrados = this.preUsuariosEncontrados.filter(p => p.id !== this.usuarioParaAtivar.id);
        } else {
          this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar ativar o usuário.'));
      });

  }

  onAtivarCadastro(preUsuario) {
    this.usuarioParaAtivar = preUsuario;
    this.usuarioParaAtivar.login = preUsuario.email.split('@')[0];
    this.telaAtivacaoBool = true;
  }

  onAtivarComAcessos() {
      this.telaAtivacaoBool = false;

      this.usuarioParaAtivar.perfil = this.opcaoPerfilEscolhida;
      this.usuarioParaAtivar.acesso = this.opcaoAcessoEscolhida;
      this.usuarioParaAtivar.idCadastrador = this.auth.getId();

      this.opcaoAcessoEscolhida = null;
      this.opcaoPerfilEscolhida = null;

      this.sistema.ativarCadastroUsuario(this.usuarioParaAtivar.id, this.usuarioParaAtivar)
        .subscribe(resultado => {

          if (resultado.status === 'OK') {
            this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
            this.preUsuariosEncontrados = this.preUsuariosEncontrados.filter(p => p.id !== this.usuarioParaAtivar.id);
          } else {
            this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
          }
        }, error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar ativar o usuário.'));
        });
  }

  onDeletar(preUsuario) {
    this.confirmation.confirm({
        message: 'Você tem certeza que deseja excluir o usuário ?',
        header: 'Confirmação',
        icon: 'fa fa-question-circle',
        accept: () => {
          this.sistema.deleteCadastroUsuario(preUsuario.id)
            .subscribe(resultado => {

              if (resultado.status === 'OK') {
                this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
                this.preUsuariosEncontrados = this.preUsuariosEncontrados.filter(p => p.id !== preUsuario.id);
              } else {
                this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
              }
            }, error => {
              this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar deletar o usuário.'));
            });
        },
        reject: () => {
            // this.msgs = [{severity: 'info', summary: 'Rejeitado', detail: 'You have rejected'}];
        }
    });
  }

  onRecadastrar(preUsuario) {
    this.confirmation.confirm({
        message: 'Você tem certeza que deseja forçar o recadastro do usuário ?',
        header: 'Confirmação',
        icon: 'fa fa-question-circle',
        accept: () => {
          this.sistema.ativarRecadastramentoCadastroUsuario(preUsuario.id)
            .subscribe(resultado => {

                if (resultado.status === 'OK') {
                  this.message.add(this.utils.mensagemSucesso('Confirmado', resultado.msg));
                  this.preUsuariosEncontrados = this.preUsuariosEncontrados.filter(p => p.id !== preUsuario.id);
                } else {
                  this.message.add(this.utils.mensagemErro('Erro', resultado.msg));
                }
            }, error => {
              this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao tentar recadastrar o usuário.'));
            });
        },
        reject: () => {
            // this.msgs = [{severity: 'info', summary: 'Rejeitado', detail: 'You have rejected'}];
        }
    });
  }
}
