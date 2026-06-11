import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from '../../typings/login.typing';
import { environment } from '../../../environments/environment';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class PesquisaOrcrimService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  listaOrganizacoesCriminosas(processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/orcrins/`, option);
  }

  /**
   * Retorna todos as orcrins.
   * @param orcrim
   * @param processo
   */
  pesquisaOrcrim(orcrim: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/orcrins/orcrim/${orcrim}`, option);
  }
}
