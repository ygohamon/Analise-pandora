import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaPresoService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}


  pesquisaPresoNome(nome: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/presos/simplificado/nome/${nome}`, option);
  }
  pesquisaPresoVulgo(vulgo: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/presos/simplificado/vulgo/${vulgo}`, option);
  }
  pesquisaPresoCPF(cpf: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/presos/simplificado/cpf/${cpf}`, option);
  }
  pesquisaPresoNomeMae(nomemae: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/presos/simplificado/nomemae/${nomemae}`, option);
  }
  pesquisaPresoCNC(cnc: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/presos/simplificado/cnc/${cnc}`, option);
  }
  pesquisaDetalhadaPresoCNC(cnc: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/presos/detalhado/cnc/${cnc}`, option);
  }
}
