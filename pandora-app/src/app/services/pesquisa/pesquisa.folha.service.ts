import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaFolhaService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   *
   * @param orgao
   */
  pesquisaOrgaoMunicipalEstadual(orgao: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('orgao', orgao)

    return this.http.get<ApiResponse>(`${environment.API_URL}/utils/orgao`, option);
  }

  /**
   *
   * @param cdugestora
   * @param processo
   */
  pesquisaFolhaMunicipalCdOrgao(cdorgao: string, orgao:string, mes: string, ano: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);

    option.params = option.params.set('cdorgao', cdorgao);
    option.params = option.params.set('orgao', orgao);
    option.params = option.params.set('mes', mes);
    option.params = option.params.set('ano', ano);

    return this.http.get<ApiResponse>(`${environment.API_URL}/folhapagamento/municipal`, option);
  }

  /**
   *
   * @param ugestora
   * @param processo
   */
  pesquisaFolhaEstadualCdOrgao(cdorgao: string, orgao:string, mes: string, ano: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);

    option.params = option.params.set('cdorgao', cdorgao);
    option.params = option.params.set('orgao', orgao);
    option.params = option.params.set('mes', mes);
    option.params = option.params.set('ano', ano);

    return this.http.get<ApiResponse>(`${environment.API_URL}/folhapagamento/estadual`, option);
  }
}
