import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';


import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class SimbaService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  pesquisaTopDadosBancariosCPF(cpf: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/simba/top/cpf/${cpf}`, option);
  }

  pesquisaTopDadosBancariosCNPJ(cnpj: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/simba/top/cnpj/${cnpj}`, option);
  }
}
