import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';
import { mapeamentoSecoesAcesso as mps } from '../auth/controle.acesso';
import { mapeamentoItensAcesso as mpi } from '../auth/controle.acesso';

@Injectable()
export class AplicativoService {

  constructor(
    private http: HttpClient,
    private auth: AuthService) {

    }

  criarAplicativo(dados): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.post<ApiResponse>(`${environment.API_URL}/aplicativos/criar`, dados, option);
  }

  atualizarAplicativo(id: string, dados): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.patch<ApiResponse>(`${environment.API_URL}/aplicativos/atualizar/${id}`, dados, option);
  }

  salvarAplicativo(dados): Observable<ApiResponse> {
    dados.dataInicio = dados.dataInicio.toLocaleDateString("en-US")
    dados.dataExpiracao = dados.dataExpiracao.toLocaleDateString("en-US")
    if (dados.id){
      return this.atualizarAplicativo(dados.id, dados);
    }
    else{
      return this.criarAplicativo(dados);
    }
  }

  removerAplicativo(id: string): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.delete<ApiResponse>(`${environment.API_URL}/aplicativos/${id}`, option);
  }

  getAplicativos(): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/aplicativos/`, option);
  }

}
