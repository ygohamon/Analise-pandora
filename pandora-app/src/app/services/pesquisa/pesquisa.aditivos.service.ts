import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaAditivoService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  pesquisaAditivoCNPJ(cnpj: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/aditivos/cnpj/${cnpj}`, option);
  }

  pesquisaAditivoCPF(cpf: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/aditivos/cpf/${cpf}`, option);
  }

  pesquisaAditivoNuLicitacao(nuLicitacao: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/aditivos/nulicitacao/${nuLicitacao}`, option);
  }
}
