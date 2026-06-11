import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';


import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class INPService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  pesquisaUGestoraMunicipalEstadual(ugestora: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('ugestora', ugestora)

    return this.http.get<ApiResponse>(`${environment.API_URL}/utils/ugestora`, option);
  }

  getNepotismoLotacaoEsferaAno(lotacao: string, cdugestora: string, esfera: string, ano: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('lotacao', lotacao);
    option.params = option.params.set('cdugestora', cdugestora);
    option.params = option.params.set('esfera', esfera);
    option.params = option.params.set('ano', ano);

    return this.http.get<ApiResponse>(`${environment.API_URL}/nepotismo/orgao`, option);
  }

  getNepotismoCPF(cpf: string, ano: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('cpf', cpf);
    option.params = option.params.set('ano', ano);

    return this.http.get<ApiResponse>(`${environment.API_URL}/nepotismo/cpf`, option);
  }
}
