import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class SistemaService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}


  getListaPermissoes(): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/permissao`, option);
  }
  getListaPerfis(): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/perfil`, option);
  }
  getListaAcessos(): Observable<ApiResponse> {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/acesso`, option);
  }

  getLogs() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/logs`, this.auth.criaCabecalhoSeguranca(null));
  }
  getRanking(ranking: string, duracao: string, top: string , parametro: string = null) {
    const options = this.auth.criaCabecalhoSeguranca(null);

    if (ranking) {
      options.params = options.params.set('ranking', ranking);
    }
    if (duracao) {
      options.params = options.params.set('duracao', duracao);
    }
    if (top) {
      options.params = options.params.set('top', top);
    }
    if (parametro) {
      options.params = options.params.set('parametro', parametro);
    }

    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/rankings`, options);
  }

  getRecursosMaisUtilizados(periodoBusca: string, comChave: string = null) {
    const options = this.auth.criaCabecalhoSeguranca(null);

    if (periodoBusca) {
      options.params = options.params.set('duracao', periodoBusca);
    }
    if (comChave) {
      options.params = options.params.set('chave', comChave);
    }

    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/recursos`, options);
  }

  getUsuariosQuePesquisaramValores(duracao: string, chave: string, valor: string) {
    const options = this.auth.criaCabecalhoSeguranca(null);

    if (duracao) {
      options.params = options.params.set('duracao', duracao);
    }
    if (chave) {
      options.params = options.params.set('chave', chave);
    }
    if (valor) {
      options.params = options.params.set('valor', valor);
    }

    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/usuarios`, options);
  }

  getTokensValidos() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/tokens`, this.auth.criaCabecalhoSeguranca(null));
  }

  getEstatisticasUso(categoria: string, duracao: string) {
    const options = this.auth.criaCabecalhoSeguranca(null);
    if (categoria) {
      options.params = options.params.set('categoria', categoria);
    }
    if (duracao) {
      options.params = options.params.set('duracao', duracao);
    }

    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/utilizacao`, options);
  }
  getRegistrosNaoEncontrados() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/naoencontrados`, this.auth.criaCabecalhoSeguranca(null));
  }
  getListaUsuarios() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/usuarios`, this.auth.criaCabecalhoSeguranca(null));
  }
  getListaUsuariosParcial(busca: string = '') {
    return this.http.get<ApiResponse>(`${environment.API_URL}/usuarios/parcial/${busca}`, this.auth.criaCabecalhoSeguranca(null));
  }
  getListaAprovacao() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/preusuarios/inativos`, this.auth.criaCabecalhoSeguranca(null));
  }
  deleteCadastroUsuario(id: string) {
    return this.http.delete<ApiResponse>(`${environment.API_URL}/preusuarios/${id}`, this.auth.criaCabecalhoSeguranca(null));
  }
  ativarRecadastramentoCadastroUsuario(id: string) {
    return this.http.post<ApiResponse>(`${environment.API_URL}/preusuarios/${id}/recadastra`, null, this.auth.criaCabecalhoSeguranca(null));
  }
  ativarCadastroUsuario(id: string, dados) {
    return this.http.post<ApiResponse>(`${environment.API_URL}/preusuarios/ativar/${id}`, dados, this.auth.criaCabecalhoSeguranca(null));
  }


  getListaRequisicoes() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/integra`, this.auth.criaCabecalhoSeguranca(null));
  }
  finalizaRequisicao(id: string) {
    return this.http.patch<ApiResponse>(`${environment.API_URL}/integra/finaliza/${id}`, null, this.auth.criaCabecalhoSeguranca(null));
  }

  /**
   * DBService
   */
  getDBInfo() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/db/info`, this.auth.criaCabecalhoSeguranca(null));
  }

  /**
   * APICacheService
   */
  getAPICacheInfo() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/apicache/info`, this.auth.criaCabecalhoSeguranca(null));
  }

  getAPICacheIndex() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/apicache/index`, this.auth.criaCabecalhoSeguranca(null));
  }

  clearAPICache() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/apicache/clear`, this.auth.criaCabecalhoSeguranca(null));
  }

  /**
   * ModelCacheService
   */
  getModelCacheInfo() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/modelcache/info`, this.auth.criaCabecalhoSeguranca(null));
  }

  getModelCacheIndex() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/modelcache/index`, this.auth.criaCabecalhoSeguranca(null));
  }

  clearModelCache() {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/modelcache/clear`, this.auth.criaCabecalhoSeguranca(null));
  }

  /**
   * LimiteAcesso
   */

  getLimitesAcessoPorIP(ip: string) {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/ip/${ip}`, this.auth.criaCabecalhoSeguranca(null));
   }

  getLimitesAcessoPorIPHistorico(ip: string) {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/ip/historico`, this.auth.criaCabecalhoSeguranca(null));
   }

  getLimitesAcessoPorIPBlacklist(ip: string) {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/ip/blacklist`, this.auth.criaCabecalhoSeguranca(null));
   }

  removeLimitesAcessoPorIP(ip: string) {
    return this.http.delete<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/ip/${ip}`, this.auth.criaCabecalhoSeguranca(null));
   }

  getLimitesAcessoPorUsuario(usuario: string) {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/usuario/${usuario}`, this.auth.criaCabecalhoSeguranca(null));
   }

  getLimitesAcessoPorUsuarioHistorico(usuario: string) {
    return this.http.get<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/usuario/historico`, this.auth.criaCabecalhoSeguranca(null));
   }

  removeLimitesAcessoPorUsuario(usuario: string) {
    return this.http.delete<ApiResponse>(`${environment.API_URL}/sistema/limitesacesso/usuario/${usuario}`, this.auth.criaCabecalhoSeguranca(null));
  }

  getLogsUsuario(usuario: string): Observable<ApiResponse> {
    const options = this.auth.criaCabecalhoSeguranca(null);

    return this.http.get<ApiResponse>(`${environment.API_URL}/logs/usuario/${usuario}`, options);
  }
}
