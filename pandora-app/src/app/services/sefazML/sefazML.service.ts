import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from '../../typings/login.typing';
import { environment } from '../../../environments/environment';


import { AuthService } from '../auth/auth.service';
import { JWT_OPTIONS } from '@auth0/angular-jwt';

@Injectable()
export class SefazMLService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  pesquisaItensAnomalos(municipioDestinatario : any, cnpjEmitente: any, cnpjDestinatario: any, dtInicio:any, dtFim:any, produtoSelecionado:any): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    var municipio = null;
    if (municipioDestinatario)
      municipio = municipioDestinatario.municipio;
    if (municipioDestinatario || cnpjEmitente || dtInicio || dtFim || produtoSelecionado || cnpjDestinatario) {
      if (dtInicio) { option.params = option.params.set('dtInicio', dtInicio); }
      if (dtFim) { option.params = option.params.set('dtFim', dtFim); }
      if (cnpjEmitente) { option.params = option.params.set('cnpjEmitente', cnpjEmitente);  }
      if (cnpjDestinatario) { option.params = option.params.set('cnpjDestinatario', cnpjDestinatario);  }
      if (produtoSelecionado) option.params = option.params.set('produtoSelecionado', produtoSelecionado.NomeProduto)
      return this.http.get<ApiResponse>(`${environment.API_URL}/sefazml/municipio/${municipio}`, option);
    }
    else
      return this.http.get<ApiResponse>(`${environment.API_URL}/sefazml/`, option);
  }

  pesquisaTopFornecedores(top : any, tipoProduto:any, dataIni:any, dataFim:any, periodoSelecionado:any, cnpjDestinatario:any, municipioDestinatario:any, suspeitos:any, produtoSelecionado:any) : Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    if (tipoProduto) option.params = option.params.set('tipoProduto', tipoProduto.map(t => t.tipo).join());
    if (dataIni) option.params = option.params.set('dataIni', dataIni)
    if (dataFim) option.params = option.params.set('dataFim', dataFim)
    if (cnpjDestinatario) option.params = option.params.set('cnpjDestinatario', cnpjDestinatario)
    if (municipioDestinatario) option.params = option.params.set('municipioDestinatario',  municipioDestinatario.municipio)
    if (periodoSelecionado) option.params = option.params.set('periodo', periodoSelecionado)
    if (produtoSelecionado) option.params = option.params.set('produtoSelecionado', produtoSelecionado.NomeProduto)
    option.params = option.params.set('suspeitos', suspeitos)
    return this.http.get<ApiResponse>(`${environment.API_URL}/sefazml/topfornecedores/${top}`, option);
  }

  pesquisaVendasFornecedor(tipoProduto:any, dataIni:any, dataFim:any, periodoSelecionado:any, cnpjDestinatario:any, cnpjEmitente:any, suspeitos:any, produtoSelecionado:any) : Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    if (tipoProduto) option.params = option.params.set('tipoProduto', tipoProduto.map(t => t.tipo).join());
    if (dataIni) option.params = option.params.set('dataIni', dataIni)
    if (dataFim) option.params = option.params.set('dataFim', dataFim)
    if (cnpjDestinatario) option.params = option.params.set('cnpjDestinatario', cnpjDestinatario)
    if (cnpjEmitente) option.params = option.params.set('cnpjEmitente', cnpjEmitente)
    if (periodoSelecionado) option.params = option.params.set('periodo', periodoSelecionado)
    if (produtoSelecionado) option.params = option.params.set('produtoSelecionado', produtoSelecionado.NomeProduto)
    option.params = option.params.set('suspeitos', suspeitos)
    return this.http.get<ApiResponse>(`${environment.API_URL}/sefazml/vendasfornecedor/`, option);
  }

  pesquisaItemNFDetalhado(idItem : any): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    if (idItem){
      var itens = this.http.get<ApiResponse>(`${environment.API_URL}/sefazml/item/${idItem}`, option);
      return itens;
    }
  }
}
