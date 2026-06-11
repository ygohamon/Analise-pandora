import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { UtilsService } from './../common/utils.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaVeiculoService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaVeiculoCPF(cpf: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/veiculos/detalhado/cpf/${cpf}`, option);
  }

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaVeiculoCNPJ(cnpj: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/veiculos/detalhado/cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param nome
   * @param processo
   */
  pesquisaVeiculoNome(nome: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/veiculos/detalhado/nome/${nome}`, option);
  }

  /**
   *
   * @param chassi
   * @param processo
   */
  pesquisaVeiculoChassi(chassi: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/veiculos/detalhado/chassi/${chassi}`, option);
  }

  /**
   *
   * @param renavam
   * @param processo
   */
  pesquisaVeiculoRenavam(renavam: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/veiculos/detalhado/renavam/${renavam}`, option);
  }

  /**
   *
   * @param placa
   * @param processo
   */
  pesquisaVeiculoPlaca(placa: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/veiculos/detalhado/placa/${placa}`, option);
  }
}
