import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';
import { mapeamentoSecoesAcesso as mps } from '../auth/controle.acesso';
import { mapeamentoItensAcesso as mpi } from '../auth/controle.acesso';

@Injectable()
export class UsuarioService {

  constructor(
    private http: HttpClient,
    private auth: AuthService) {

    }

  /**
   *  METODOS PARA PESSOA_USUARIO
   */

  cadastroPessoaUsuario(dadosCadastro): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.API_URL}/preusuarios`, dadosCadastro);
  }
  recadastramentoPessoaUsuario(dadosCadastro): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.post<ApiResponse>(`${environment.API_URL}/preusuarios/recadastramento`, dadosCadastro, option);
  }


  /**
   *  METODOS PARA USUARIO
   */


  atualizarUsuario(id: string, dadosUsuario): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.patch<ApiResponse>(`${environment.API_URL}/usuarios/${id}`, dadosUsuario, option);
  }
  removerUsuario(id: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.delete<ApiResponse>(`${environment.API_URL}/usuarios/${id}`, option);
  }
  getInfoUsuario(): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/usuarios/me`, option);
  }
  getPermissoes(): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/usuarios/me/permissao`, option);
  }
  redefinirSenhaUsuario(id: string, dadosUsuario): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.patch<ApiResponse>(`${environment.API_URL}/usuarios/${id}/redefinirsenha`, dadosUsuario, option);
  }

  getPermissoesUsuario(id: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/usuarios/${id}/permissao`, option);
  }

  atualizarPermissoesUsuario(id: string, controles): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    return this.http.patch<ApiResponse>(`${environment.API_URL}/usuarios/${id}/permissao`, controles, option);
  }
}
