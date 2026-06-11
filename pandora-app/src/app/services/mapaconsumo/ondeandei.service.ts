import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class OndeAndeiService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getMovimentacoesVeiculo(placa: string, dataInicial: string, dataFinal: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    if (dataInicial) {
      option.params = option.params.set('dataInicial', dataInicial);
    }

    if (dataFinal) {
      option.params = option.params.set('dataFinal', dataFinal);
    }

    return this.http.get<ApiResponse>(`${environment.API_URL}/ondeandei/placa/${placa}`, option);
  }

  getMovimentacoesPessoa(cpf: string, dtinicio: string, dtfim: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('cpf', cpf);
    option.params = option.params.set('dtinicio', dtinicio);
    option.params = option.params.set('dtfim', dtfim);

    return this.http.get<ApiResponse>(`${environment.API_URL}/mapaconsumo`, option);
  }

}
