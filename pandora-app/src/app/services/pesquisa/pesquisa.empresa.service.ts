import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaEmpresaService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaEmpresaCNPJ(cnpj: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param nomeFantasia
   * @param processo
   */
  pesquisaEmpresaNomeFantasia(nomeFantasia: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/nomefantasia/${nomeFantasia}`, option);
  }

  /**
   *
   * @param razaoSocial
   * @param processo
   */
  pesquisaEmpresaRazaoSocial(razaoSocial: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/razaosocial/${razaoSocial}`, option);
  }

  /**
   *
   * @param razaoSocial
   * @param processo
   */
  pesquisaEmpresaEndereco(endereco: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/endereco/${endereco}`, option);
  }

  /**
   *
   * @param telefone
   * @param processo
   */
  pesquisaEmpresaTelefone(telefone: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/telefone/${telefone}`, option);
  }

  /**
   *
   * @param email
   * @param processo
   */
  pesquisaEmpresaEmail(email: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/email/${email}`, option);
  }

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaEmpresaSocioPFCPF(cpf: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/sociopf_cpf/${cpf}`, option);
  }

  /**
   *
   * @param nome
   * @param processo
   */
  pesquisaEmpresaSocioPFNome(nome: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/sociopf_nome/${nome}`, option);
  }

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaEmpresaSocioPJCNPJ(cnpj: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/simplificado/sociopj_cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaIntegradaCNPJ(cnpj: string, processo: string = null, funcao: string = null, extra = {}): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca({processo, funcao, ...extra});
    return this.http.get<ApiResponse>(`${environment.API_URL}/empresas/integrado/cnpj/${cnpj}`, option);
  }
}
