import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaEnderecoService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   *
   * @param nome
   * @param processo
   */
  pesquisaEnderecoNome(nome: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/enderecos/simplificado/nome/${nome}`, option);
  }

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaEnderecoCPF(cpf: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/enderecos/simplificado/cpf/${cpf}`, option);
  }

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaEnderecoCNPJ(cnpj: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/enderecos/simplificado/cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaEnderecoLogradouro(logradouro: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/enderecos/simplificado/logradouro/${logradouro}`, option);
  }

  /**
   *
   * @param razaosocial
   * @param processo
   */
  pesquisaEnderecoRazaoSocial(razaosocial: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/enderecos/simplificado/razaosocial/${razaosocial}`, option);
  }
}
