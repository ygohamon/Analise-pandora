import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaPessoaService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaPessoaCPF(cpf: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/cpf/${cpf}`, option);
  }

  /**
   *
   * @param nome
   * @param processo
   */
  pesquisaPessoaNome(nome: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/nome/${nome}`, option);
  }

  /**
   *
   * @param cnh
   * @param processo
   */
  pesquisaPessoaCNH(cnh: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/cnh/${cnh}`, option);
  }

  /**
   *
   * @param rg
   * @param processo
   */
  pesquisaPessoaRG(rg: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/rg/${rg}`, option);
  }

  /**
   *
   * @param titulo
   * @param processo
   */
  pesquisaPessoaTitulo(titulo: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/titulo/${titulo}`, option);
  }

  /**
   *
   */
  pesquisaPessoaNomePai(nomePai: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/nomepai/${nomePai}`, option);
  }

  /**
   *
   * @param nomeMae
   * @param processo
   */
  pesquisaPessoaNomeMae(nomeMae: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/nomemae/${nomeMae}`, option);
  }

  /**
   *
   * @param endereco
   * @param processo
   */
  pesquisaPessoaEndereco(endereco: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/endereco/${endereco}`, option);
  }

  /**
   *
   * @param telefone
   * @param processo
   */
  pesquisaPessoaTelefone(telefone: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/telefone/${telefone}`, option);
  }

  /**
   *
   * @param email
   * @param processo
   */
  pesquisaPessoaEmail(email: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/simplificado/email/${email}`, option);
  }

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaIntegradaCPF(cpf: string, processo: string = null, funcao: string = '', extra = {}): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca({processo, funcao, ...extra});
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/integrado/cpf/${cpf}`, option);
  }

  /**
   *
   * @param rg
   * @param processo
   */
  pesquisaIntegradaRG(rg: string, processo: string = null, funcao: string = '', extra = {}): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca({processo, funcao, ...extra});
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/integrado/rg/${rg}`, option);
  }

  /**
   *
   * @param nome
   * @param processo
   */
  pesquisaIntegradaNome(nome: string, processo: string = null, funcao: string = '', extra = {}): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca({processo, funcao, ...extra});
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/integrado/nome/${nome}`, option);
  }

  pesquisaQualificacaoCPF(cpf: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/qualificacao/cpf/${cpf}`, option);

  }

  pesquisaQualificacaoRG(rg: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/qualificacao/rg/${rg}`, option);

  }

  pesquisaQualificacaoNome(nome: string, processo: string = null): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/pessoas/qualificacao/nome/${nome}`, option);

  }
  
}
