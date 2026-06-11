import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaSASPService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   * Retorna todos os investigados encontrados para o CPF.
   * @param cpf
   */
  pesquisaSASPCPF(cpf: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sasp/cpf/${cpf}`, option);
  }

  /**
   * Retorna todos os investigados encontrados para o CPF.
   * @param rg
   */
   pesquisaSASPRG(rg: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sasp/rg/${rg}`, option);
  }
  
  /**
   * Retorna todos os investigados encontrados para o CPF.
   * @param nome
   */
   pesquisaSASPNOME(nome: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sasp/nome/${nome}`, option);
  }

  /**
   * Retorna todos os investigados encontrados para o CPF.
   * @param alcunha
   */
   pesquisaSASPALCUNHA(alcunha: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sasp/alcunha/${alcunha}`, option);
  }

}
