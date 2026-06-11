import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaImovelService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   * Retorna todos os imóveis encontrados para o CPF.
   * @param cpf
   */
  pesquisaImovelCPF(cpf: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/imoveis/cpf/${cpf}`, option);
  }

  /**
   * Retorna todos os imóveis encontrados para o CNPJ.
   * @param cnpj
   */
  pesquisaImovelCNPJ(cnpj: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/imoveis/cnpj/${cnpj}`, option);
  }

}
