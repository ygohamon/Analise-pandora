import * as _ from 'underscore';
import crypto = require('crypto-js');
import { v4 as uuidv4 } from 'uuid';

import { validaCPF, validaEmail, sha256 } from '../utils';
import { API_CONFIG } from '../config';

export class PessoaUsuario {
  id?: number;

  nome?: string;
  // nacionalidade?  : string;
  cpf?: string;
  identidade?: string;
  orgEmissor?: string;
  ufOrgEmissor?: string;
  matricula?: string;
  titularidade?: string;
  lotacao?: string;

  email?: string;
  telefone?: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
  ativado?: boolean;

  constructor(obj) {
    for (const attr of Object.keys(obj)) {
      this[attr] = obj[attr];
    }
  }

  dadosValidos(): boolean {
    return validaCPF(this.cpf) && validaEmail(this.email);
  }
}

export class NovoUsuario {
  id?: number;
  pessoa?: PessoaUsuario;
  idAtivador?: string;

  login?: string;
  senha?: string;
  perfil?: string;
  ativo?: boolean;
  acesso?: string;
  proximoLogon?: boolean;
  necessitaProcesso?: boolean;
  recadastramento?: boolean;
  grupos?: Array<string>;

  dataCriacao?: string;
  dataAtualizacao?: string;

  //
  permissoes: Array<Permissao>;

  constructor(obj) {
    for (const attr of Object.keys(obj)) {
      this[attr] = obj[attr];
    }
  }

  setPessoa(pessoa: PessoaUsuario) {
    this.pessoa = pessoa;
  }

  static hashSenha(senha) {
    const salt = sha256(uuidv4());
    const hash = sha256(salt + senha);

    return salt + hash;
  }

  createFromFormAtivacao(pessoa) {
    this.pessoa = new PessoaUsuario(pessoa);

    //
    this.acesso = pessoa.acesso;
    this.login = pessoa.login;
    this.senha = pessoa.acesso === 'LOCAL' ? NovoUsuario.hashSenha(pessoa.senha) : null;
    this.perfil = pessoa.perfil;
    this.idAtivador = pessoa.idCadastrador;
    this.proximoLogon = pessoa.acesso === 'LOCAL' ? true : false;
    this.necessitaProcesso = true;

    return this;
  }

  existe() {
    return Object.keys(this).length > 0;
  }

  estaAtivo() {
    return this.ativo;
  }

  setPermissoes(permissoes: Array<Permissao>) {
    this.permissoes = permissoes;
  }

  getPermissoes() {
    const grupos = _.groupBy(this.permissoes, 'secao');

    const permissoes = {};
    for (const g of Object.keys(grupos)) {
      permissoes[g] = grupos[g].map(permissao => permissao.item);
    }
    return permissoes;
  }

  getPermissoesCrypt() {
    const permissoes = this.getPermissoes();

    return crypto.AES.encrypt(JSON.stringify(permissoes), API_CONFIG.SERVER_AES_PW).toString();
  }

  isMembro() {
    if (!this.grupos) {
      return null;
    }
    return this.grupos.includes('membro');
  }

  isAdmin() {
    if (!this.grupos) {
      return null;
    }
    return this.grupos.includes('admin');
  }

  isOperacoes() {
    if (!this.grupos) {
      return null;
    }
    return this.grupos.includes('operacoes');
  }

  toToken() {
    const token: any = {
      id: this.id,
      perfil: this.meuPerfil(),
      grupos: this.grupos,
    };

    if (this.necessitaProcesso) {
      token.necessita_processo = this.isAdmin() ? false : this.necessitaProcesso ? true : false;
    }

    if (this.recadastramento) {
      token.recadastramento = true;
    }

    if (this.isMembro()) {
      token.membro = true;
    }

    if (this.proximoLogon && this.acesso === 'LOCAL') {
      token.troca_senha = true;
    }

    return token;
  }

  meuPerfil() {
    return this.perfil;
  }
}

export class Permissao {
  id_secao: number;
  secao: string;
  id_item: number;
  item: string;

  encode(permissao) {
    return { s: btoa(this.secao), i: btoa(this.item) };
  }

  decode(permissao) {
    return { secao: atob(permissao.s), item: atob(permissao.i) };
  }
}

export class Usuario {
  id?: number;
  nome?: string;
  login?: string;
  email?: string;
  ativo?: string;

  administrador?: string;
  ad?: string;
  perfil?: string;
  senha?: string;
  proximoLogon?: string;

  processo?: string;
  membro?: string;
  operacoes?: number;
  grupo?: string;
  idCadastrador?: number;

  constructor(obj) {
    if (obj.id) this.id = obj.id;
    if (obj.nome) this.nome = obj.nome;
    if (obj.login) this.login = obj.login;
    if (obj.email) this.email = obj.email;
    if (obj.ativo) this.ativo = obj.ativo;

    if (obj.administrador) this.administrador = obj.administrador;
    if (obj.AD) this.ad = obj.AD;
    if (obj.perfil) this.perfil = obj.perfil;
    if (obj.senha) this.senha = obj.senha;
    if (obj.proximo_logon) this.proximoLogon = obj.proximo_logon;

    if (obj.processo) this.processo = obj.processo;
    if (obj.membro) this.membro = obj.membro;
    if (obj.id_cadastrador) this.idCadastrador = obj.id_cadastrador;
    if (obj.GRUPO) this.grupo = obj.GRUPO;

    if (obj.operacoes || obj.Operacoes) this.operacoes = obj.operacoes || obj.Operacoes;
  }

  existe() {
    if (Object.keys(this).length > 0) return true;
    else return false;
  }

  estaAtivo() {
    if (this.ativo === 'S') return true;
    else return false;
  }

  meuPerfil() {
    if (this.administrador === 'S') {
      return 'admin';
    } else {
      return this.perfil;
    }
  }
}

export class ControleAcesso {
  acesso: { pesquisa: object; apps: object };

  pesquisa: object;
  apps: object;

  constructor(pesquisa, apps) {
    if (pesquisa) this.acesso.pesquisa = pesquisa;
    if (apps) this.acesso.apps = apps;
  }
}

export class CadastroUsuario {
  id?: number;
  nome?: string;
  nacionalidade?: string;
  cpf?: string;
  identidade?: string;

  orgaoEmissor?: string;
  ufOrgaoEmissor?: string;
  matricula?: string;
  titularidade?: string;
  promotoria?: string;

  email?: string;
  telefone?: string;
  dataCadastro?: string;
  ativado?: string;

  constructor(obj) {
    if (obj.id) this.id = obj.id;
    if (obj.nome) this.nome = obj.nome;
    if (obj.nacionalidade) this.nacionalidade = obj.nacionalidade;
    if (obj.cpf) this.cpf = obj.cpf;
    if (obj.identidade) this.identidade = obj.identidade;

    if (obj.orgaoEmissor) this.orgaoEmissor = obj.org_emissor;
    if (obj.ufOrgaoEmissor) this.ufOrgaoEmissor = obj.uf_orgao_emissor;
    if (obj.matricula) this.matricula = obj.matricula;
    if (obj.titularidade) this.titularidade = obj.titularidade;
    if (obj.promotoria) this.promotoria = obj.promotoria;

    if (obj.email) this.email = obj.email;
    if (obj.telefone) this.telefone = obj.telefone;
    if (obj.dataCadastro) this.dataCadastro = obj.dt_cadastro;
    if (obj.ativado) this.ativado = obj.ativado;
  }

  existe() {
    if (Object.keys(this).length > 0) return true;
    else return false;
  }
}

// export class Pessoa{

//       constructor(
//           public cpf: string,
//           public nome: string,
//           public nomeMae: string,
//           public nomePai: string,
//           public tituloEleitor: string,
//           public dataNascimento: Date,
//           public situacaoCadastral: string,

//           public residenteExterior: string,
//           public nomePaisExterior: string,
//           public sexo: string,
//           public anoObito: Date,

//           public estrangeiro: string,
//           public dataAtualizacao: Date,
//           public fonte: string
//       ){}

// }

export interface Pessoa {
  cpf?: string;
  nome?: string;
  nomeMae?: string;
  nomePai?: string;
  tituloEleitor?: string;
  dataNascimento?: Date;
  situacaoCadastral?: string;

  residenteExterior?: string;
  nomePaisExterior?: string;
  sexo?: string;
  anoObito?: Date;

  estrangeiro?: string;
  dataAtualizacao?: Date;
  fonte?: string;

  Codigo?: string;
  rg?: string;
  dataExpedicao?: Date;
  naturalidade?: string;
  UFNaturalidade?: string;

  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
}

export interface Empresa {
  cnpj?: string;
  nomeFantasia?: string;
  razaoSocial?: string;
  dtInicioAtividade?: Date;

  tipoLogradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  municipio?: string;
  uf?: string;

  cpfResponsavel?: string;
  nomeResponsavel?: string;
  descResponsavel?: string;

  ddd?: string;
  telefone?: string;
  ddd2?: string;
  telefone2?: string;
  dddFax?: string;
  telefoneFax?: string;
}

export interface MovimentoVeiculo {
  idMovimento?: number;
  dataPassagem?: Date;
  local?: string;
  latitude?: number;
  longitude?: number;
}
