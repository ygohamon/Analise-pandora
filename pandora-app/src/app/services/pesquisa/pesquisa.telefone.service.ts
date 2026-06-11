import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaTelefoneService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaTelefoneCPF(cpf: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/cpf/${cpf}`, option);
  }

  /**
   *
   * @param nome
   * @param processo
   */
  pesquisaTelefoneNome(nome: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/nome/${nome}`, option);
  }

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaTelefoneCNPJ(cnpj: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param nomefantasia
   * @param processo
   */
  pesquisaTelefoneNomeFantasia(nomefantasia: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/nomefantasia/${nomefantasia}`, option);
  }

  /**
   *
   * @param razaosocial
   * @param processo
   */
  pesquisaTelefoneRazaoSocial(razaosocial: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/razaosocial/${razaosocial}`, option);
  }

  /**
   *
   * @param telefone
   * @param processo
   */
  pesquisaTelefoneTelefone(telefone: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/telefone/${telefone}`, option);
  }

  /**
   *
   * @param telefone
   * @param processo
   */
  pesquisaTelefoneBuscaProfundaTelefone(telefone: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/telefones/simplificado/buscaprofunda/telefone/${telefone}`, option);
  }
}
