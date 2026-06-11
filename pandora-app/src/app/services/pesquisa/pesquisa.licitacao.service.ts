import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class PesquisaLicitacaoService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   *
   * @param cnpj
   * @param processo
   */
  pesquisaLicitacoesCNPJ(cnpj: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/licitacoes/cnpj/${cnpj}`, option);
  }

  /**
   *
   * @param cpf
   * @param processo
   */
  pesquisaLicitacoesCPF(cpf: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);
    return this.http.get<ApiResponse>(`${environment.API_URL}/licitacoes/cpf/${cpf}`, option);
  }
  /**
   *
   * @param dadosLicitacao
   * @param processo
   */
  pesquisaLicitacoesDadosLicitacao(dadosLicitacao: string, processo: string = null) {
    const option = this.auth.criaCabecalhoSeguranca(processo);

    const dados = dadosLicitacao.split('|');
    const cdUgestora = dados[0]?.trim();
    const nuLicitacao = dados[1]?.trim();
    const cdMdLicitacao = dados[2]?.trim();

    option.params = option.params.set('cdugestora', cdUgestora);
    option.params = option.params.set('nulicitacao', nuLicitacao);
    option.params = option.params.set('cdmdlicitacao', cdMdLicitacao);

    return this.http.get<ApiResponse>(`${environment.API_URL}/licitacoes/dados`, option);
  }
}
