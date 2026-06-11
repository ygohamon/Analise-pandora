import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaInvestigadoService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   * Retorna todos os investigados encontrados para o CPF.
   * @param cpf
   */
  pesquisaInvestigadoCPF(cpf: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/investigados/cpf/${cpf}`, option);
  }

  /**
   * Retorna todos os investigados encontrados para o Nome.
   * @param nome
   */
  pesquisaInvestigadoNome(nome: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/investigados/nome/${nome}`, option);
  }

  /**
   * Retorna todos os investigados encontrados para o CNPJ.
   * @param cnpj
   */
  pesquisaInvestigadoCNPJ(cnpj: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/investigados/cnpj/${cnpj}`, option);
  }

  /**
   * Retorna todos os investigados encontrados para a Razão Social.
   * @param razaosocial
   */
  pesquisaInvestigadoRazaoSocial(razaosocial: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/investigados/razaosocial/${razaosocial}`, option);
  }

  /**
   * Retorna todos os investigados encontrados para o nome da Operação.
   * @param operacao
   */
  pesquisaInvestigadoOperacao(operacao: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/investigados/operacao/${operacao}`, option);
  }

    /**
   * Retorna todos os investigados encontrados para o alcunha.
   * @param alcunha
   */
  pesquisaInvestigadoAlcunha(alcunha: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/investigados/alcunha/${alcunha}`, option);
  }
}
