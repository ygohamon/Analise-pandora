import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaTCEService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}


  pesquisaTCE_ContaBancaria(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/conta_bancaria/${data}`, option);
  }

  pesquisaTCE_Empenho(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/empenho/${data}`, option);
  }

  pesquisaTCE_EmpenhoAnulado(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/empenho_anulacao/${data}`, option);
  }

  pesquisaTCE_EmpenhoSuplementacao(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/empenho_suplementacao/${data}`, option);
  }

  pesquisaTCE_Licitacao(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/licitacao/${data}`, option);
  }

  pesquisaTCE_Pagamento(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento/${data}`, option);
  }

  pesquisaTCE_Pagamento_Anulado(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_anulado/${data}`, option);
  }

  pesquisaTCE_Pagamento_Extra_Orcamentario(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_extra_orcamentario/${data}`, option);
  }

  pesquisaTCE_Pagamento_Orcamentario(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_orcamentario/${data}`, option);
  }

  pesquisaTCE_Pagamento_Orcamentario_Anulado(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_orcamentario_anulado/${data}`, option);
  }

  pesquisaTCE_Pagamento_Restituicao_Receita(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_restituicao_receita/${data}`, option);
  }

  pesquisaTCE_Pagamento_Restos_Pagar(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_restos_pagar/${data}`, option);
  }

  pesquisaTCE_Pagamento_Retencao(data: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/tce/pagamento_retencao/${data}`, option);
  }

}
