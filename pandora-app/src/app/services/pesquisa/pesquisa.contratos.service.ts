import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaContratoService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  pesquisaContratoCNPJ(cnpj: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/contratos/cnpj/${cnpj}`, option);
  }

  pesquisaContratoCPF(cpf: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/contratos/cpf/${cpf}`, option);
  }

  pesquisaContratoNuLicitacao(nuLicitacao: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/contratos/nulicitacao/${nuLicitacao}`, option);
  }

  pesquisaContratoNuContrato(nuContrato: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/contratos/nucontrato/${nuContrato}`, option);
  }
}
