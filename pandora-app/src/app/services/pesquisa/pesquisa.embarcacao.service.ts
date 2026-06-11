import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaEmbarcacaoService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   * Retorna todos as embarcações encontradas para o CPF.
   * @param cpf
   */
  pesquisaEmbarcacaoCPF(cpf: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/embarcacoes/cpf/${cpf}`, option);
  }

  /**
   * Retorna todos as embarcações encontradas para o CNPJ.
   * @param cnpj
   */
  pesquisaEmbarcacaoCNPJ(cnpj: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/embarcacoes/cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param processo
   */
  pesquisaEmbarcacaoNome(embarcacao: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/embarcacoes/embarcacao/${embarcacao}`, option);
  }

  /**
   *
   * @param processo
   */
  pesquisaEmbarcacaoInscricao(inscricao: string): Observable<ApiResponse> {
    const option =  this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/embarcacoes/inscricao/${inscricao}`, option);
  }

}
