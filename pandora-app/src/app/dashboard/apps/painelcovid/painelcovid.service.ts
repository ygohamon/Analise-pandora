import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from 'src/app/services/auth/auth.service';
import { ApiResponse } from 'src/app/typings/login.typing';
import { environment } from 'src/environments/environment';

@Injectable()
export class PainelCovidService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getTabelaGeral(uf: string) {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/painelcovid/tabelageral/${uf}`, option);
  }
}
