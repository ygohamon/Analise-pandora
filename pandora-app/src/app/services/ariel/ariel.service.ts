import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class ArielService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  enviaFotoCapturada(fotoCapturada: string, limiarTorelancia: number): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    const limiar = limiarTorelancia / 100;
    const data = {
      img: fotoCapturada,
      tolerance: limiar
    }

    return this.http.post<ApiResponse>(`${environment.API_URL}/ariel/foto`, data, option);
  }
}
