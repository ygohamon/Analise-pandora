import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class DNAService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  getInformacoesDNA(cnpj: string) {
    const option = this.auth.criaCabecalhoSeguranca(null);

    return this.http.get<ApiResponse>(`${environment.API_URL}/dna/cnpj/${cnpj}`, option);
  }
}
