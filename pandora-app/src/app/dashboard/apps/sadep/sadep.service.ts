import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "src/app/services/auth/auth.service";
import { ApiResponse } from "src/app/typings/login.typing";
import { environment } from "src/environments/environment";

@Injectable()
export class SadepService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getMandadosEmAbertoPorUF(uf: string){
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sadep/mandados/uf/${uf}`, option);
  }

  getDetalhamentoParadeiros(cpf: string) {
    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/sadep/detalhamento/cpf/${cpf}`, option)
  }
}
