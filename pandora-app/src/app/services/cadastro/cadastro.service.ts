import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';


@Injectable()
export class CadastroService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   *
   * @param form
   */
  cadastroEndereco(form): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.post<ApiResponse>(`${environment.API_URL}/enderecos`, form, option);
  }

  /**
   *
   * @param form
   */
  cadastroTelefone(form) {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.post<ApiResponse>(`${environment.API_URL}/telefones`, form, option);
  }
}
