import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';


import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class CacaFantasmasService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  pesquisaOrgaoSagresMunicipal(orgao: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/cacafantasmas/orgao/municipal/${orgao}`, option);
  }

  analisaOrgao(cdugestora: string, dtinicio: string, dtfim: string, tipoAnalise: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    if (dtinicio) { option.params = option.params.set('dtinicio', dtinicio); }
    if (dtfim) { option.params = option.params.set('dtfim', dtfim); }
    if (tipoAnalise) { option.params = option.params.set('tipoanalise', tipoAnalise); }

    return this.http.get<ApiResponse>(`${environment.API_URL}/cacafantasmas/cdugestora/${cdugestora}`, option);
  }
}
