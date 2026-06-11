import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaMiscService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  pesquisaMunicipioUF(uf: string, municipio: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    option.params = option.params.set('municipio', municipio);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tiporank/uf/${uf}`, option);
  }
  pesquisaProduto(produto: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    option.params = option.params.set('produto', produto);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sefazml/produto/`, option);
  }
  pesquisaTipologiaUFMunicipio(uf: string, municipio: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tiporank/uf/${uf}/municipio/${municipio}`, option);
  }

  pesquisaOrgaoSagresMunicipal(orgao: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/cacafantasmas/orgao/municipal/${orgao}`, option);
  }

  pesquisaPromotoriasMPPB(promotoria: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/integra/promotorias/${promotoria}`, option);
  }

  //
  // App YellowPages
  //

  pesquisaYellowPagesCNPJ(cnpj: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/yellowpages/cnpj/${cnpj}`, option);
  }

  pesquisaYellowPagesRazaoSocial(razaoSocial: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/yellowpages/razaosocial/${razaoSocial}`, option);
  }
}
