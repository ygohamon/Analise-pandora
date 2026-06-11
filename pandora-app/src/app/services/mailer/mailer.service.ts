import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Email } from './../../typings/email.typings';
import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class MailerService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  enviaEmail(email: Email): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    const data = { email };

    return this.http.post<ApiResponse>(`${environment.API_URL}/sistema/mail/enviar`, data, option);
  }

  getMailInfo(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/mail/info`, this.auth.criaCabecalhoSeguranca(null));
  }
}
