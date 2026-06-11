import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

/**
* Serviço responsável por realizar as requisições de login, cadastro e checagens
* no token de segurança.
*/
@Injectable()
export class AuthService {

  helper;
  pwAES;

  /**
  * Cria uma instância do serviço Auth.
  * @param {HttpClient} http - Serviço HTTP.
  * @param {Router} router - Serviço de roteamento.
  * @constructor
  */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
      this.helper = new JwtHelperService();
      this.pwAES = environment.PASSWORD_ENCRYPT_AES;
    }

  /**
   * Realiza a verificação do usuário no servidor.
   *
   * @param credentials
   * @return
   */
  login(credentials): Observable<ApiResponse> {
    if (!environment.production) {
      const options = { params: new HttpParams().set('test', 's') };

      return this.http.post<ApiResponse>(`${environment.API_URL}/login`, credentials, options);
    } else {
      return this.http.post<ApiResponse>(`${environment.API_URL}/login`, credentials);
    }
  }

  /**
   *
   * @param data
   * @return
   */
  loginExterno(data): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.API_URL}/externo`, data)
  }

  /**
   *
   * @param credentials
   */
  signup(credentials): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.API_URL}/preusuarios`, credentials);
  }

  /**
   *
   * @param credentials
   */
  trocasenha(credentials): Observable<ApiResponse> {
    const extra = this.criaCabecalhoSeguranca(null);
    return this.http.patch<ApiResponse>(`${environment.API_URL}/usuarios/${this.getId()}/trocasenha`, credentials, extra);
  }

  /**
   * Remove os cookies da página.
   */
  limpaCookies(): void {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
  }

  /**
   * Remove todos os dados salvos no storage.
   */
  limpaStorage(): void {
    localStorage.clear();
  }

  /**
   * Finaliza a autenticação ao servidor:
   *
   * * Limpa o localStorage;
   * * Seta o novo token recebido;
   * * Redireciona o usuário para a rota necessária.
   *
   * @param token
   */
  finishAuthentication(token = null): void {
    if (token) {
      this.limpaStorage();
      this.setToken(token);
    }

    if (this.getRecadastramento()) {
      this.router.navigate(['cadastro'], { queryParams: { q: 'recadastramento' } });
    } else if (this.getTrocaSenha()) {
      this.router.navigate(['trocasenha']);
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  /**
   * Salva o token no localStorage do browser e calcula o offset
   * entre a aplicação e o servidor.
   *
   * @param token
   * @return void
   */
  setToken(token): void {
    localStorage.setItem('token', token);
    localStorage.setItem('off', `${Date.now() - parseInt(this.getTs(), 10)}`);
  }

  /**
   * Salva no storage os dados básicos do usuário.
   *
   * @param userData
   */
  setDadoUsuario(userData): void {
    const b64 = btoa(JSON.stringify(userData));
    localStorage.setItem('userData', b64);
  }

  /**
   * Salva no storage os dados básicos do usuário.
   *
   * @param userData
   */
  setPermissoes(permissoes): void {
    localStorage.setItem('permissoes', permissoes);
  }

  /**
   * Limpa o localStorage, removendo assim o token do usuário, e logo
   * em seguida volta para a página inicial do sistema.
   *
   * @return
   */
  logout(): void {
    this.limpaStorage();
    this.router.navigate(['login']);
  }

  /**
   * Verifica se o usuário ainda tem uma sessão válida.
   *
   * @return true|false
   */
  isAuthenticated(): boolean {
    return !this.helper.isTokenExpired(this.getToken());
  }

  /**
   * @return
   */
  getNome(): string {
    const userData = this.getUserData();
    if (!userData) { return null; }

    const nome = userData.nome.split(' ');
    if (nome.length === 1) {return nome[0];}

    return `${nome[0]} ${nome[nome.length - 1]}`;
  }

  /**
   * @return
   */
  getLogin(): string {
    const userData = this.getUserData();
    if (!userData) { return null; }

    return userData.login;
  }

  /**
   * @return
   */
  getGrupos(): Array<string> {
    const userData = this.getUserData();
    if (!userData) { return null; }

    return userData.grupos;
  }

  /**
   * Retorna o ID do usuário
   *
   * @return
   */
  getId(): string {
    return this.helper.decodeToken(this.getToken()).user.id;
  }

  /**
   * Retorna o Perfil do usuário
   * @return
   */
  getPerfil(): string {
    return this.helper.decodeToken(this.getToken()).user.perfil;
  }

  /**
   * @return
   */
  getMembro(): boolean {
    return this.helper.decodeToken(this.getToken()).user.membro;
  }

  /**
   * @return
   */
  getOperacoes(): boolean {
    return this.helper.decodeToken(this.getToken()).user.operacoes;
  }

  /**
   * @return
   */
  getAnalise(): boolean {
    return this.helper.decodeToken(this.getToken()).user.analise;
  }

  /**
   * @return
   */
  getGrupo(): boolean {
    return this.helper.decodeToken(this.getToken()).user.grupo;
  }

  /**
   * Checa se o usuário tem a permissão para acessar o recurso.
   *
   * @return boolean
   */
  checkControleAcesso(secao: string, item: string): boolean {
    if (this.getPerfil() === 'admin') { return true; }

    const permissoes = this.getPermissoes();
    if (permissoes && permissoes[secao] && permissoes[secao].includes(item)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checa se o usuário tem permissão para a seção.
   *
   * @return
   */
  checkSecaoExiste(secao: string): boolean {
    const permissoes = this.getPermissoes();

    return !!permissoes[secao];
  }


  /**
   * Retorna o timestamp salvo no token para calcular o offset entre
   * app e servidor.
   *
   * @return
   */
  getTs(): string {
    return this.helper.decodeToken(this.getToken()).ts;
  }

  /**
   * @return
   */
  getOff(): string {
    return localStorage.getItem('off');
  }

  /**
   * @return
   */
  getNecessitaProcesso(): boolean {
    return this.helper.decodeToken(this.getToken()).user.necessita_processo;
  }

  /**
   * @return
   */
  getTrocaSenha(): boolean {
    return this.helper.decodeToken(this.getToken()).user.troca_senha;
  }

  /**
   * Retorna se o usuário precisa realizar um recadastramento.
   *
   * @return
   */
  getRecadastramento(): boolean {
    return this.helper.decodeToken(this.getToken()).user.recadastramento;
  }

  /**
   * Retorna o token salvo.
   *
   * @return
   */
  getToken(): string {
    return localStorage.getItem('token');
  }

  /**
   * Retorna os dados do usuário.
   *
   * @return
   */
  getUserData() {
    const userData = localStorage.getItem('userData');
    if (!userData){ return null };

    return JSON.parse(atob(userData));
  }

  /**
   * Retorna o objeto contendo as permissões do usuário.
   *
   * @return
   */
  getPermissoes(): string {
    const permissoes = CryptoJS.AES.decrypt(localStorage.getItem('permissoes'), this.pwAES).toString(CryptoJS.enc.Utf8);

    return JSON.parse(permissoes);
  }

  /**
   *
   * @param processo
   * @return
   */
  criaCabecalhoSeguranca(_params) {

    let params = new HttpParams();

    // _params === string mantem o padrao com o argumento antigo
    // novo argumento agora é um objeto contendo pares chave-valor
    if (typeof _params === 'string') {
      params = params.set('processo', _params)
    } else if (typeof _params === 'object' && !!_params) {
      Object.keys(_params).forEach(key => {
        if (!!_params[key]) {
          params = params.set(key, _params[key]);
        }
      })
    }

    const ts = `${Date.now() - parseInt(this.getOff(), 10)}`;
    const tempHash = this.getId() + navigator.userAgent + ts;

    const headers = new HttpHeaders({
      'hs': `${CryptoJS.SHA1(tempHash) + ts}`,
    });

    return {
      params: params,
      headers: headers,
    };
  }
}
