import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaEmpenhoService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  pesquisaEmpenhoCNPJ(cnpj: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empenhos/cnpj/${cnpj}`, option);
  }

  pesquisaEmpenhoCPF(cpf: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/empenhos/cpf/${cpf}`, option);
  }
}
