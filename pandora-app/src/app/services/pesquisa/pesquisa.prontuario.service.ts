import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaProntuarioService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   * Retorna todos as embarcações encontradas para o CPF.
   * @param cpf
   * @param processo
   */
  pesquisaProntuarioCPF(cpf: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/prontuarios/cpf/${cpf}`, option);
  }

  /**
   * Retorna todos as embarcações encontradas para o CPF.
   * @param nome
   * @param processo
   */
  pesquisaProntuarioNome(nome: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/prontuarios/nome/${nome}`, option);
  }

    /**
   * Retorna todos as embarcações encontradas para o CPF.
   * @param alcunha
   * @param processo
   */
  pesquisaProntuarioAlcunha(alcunha: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/prontuarios/alcunha/${alcunha}`, option);
  }

  /**
   * Retorna todos as embarcações encontradas para o CPF.
   * @param rg
   * @param processo
   */
  pesquisaProntuarioRG(rg: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/prontuarios/rg/${rg}`, option);
  }
}