import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class DownloadService {

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  downloadAnexoRequisicao(idAnexo: string) {
    const options = this.auth.criaCabecalhoSeguranca(null);
    options['responseType'] = 'blob';

    return this.http.get(`${environment.API_URL}/integra/anexo/${idAnexo}`, options)
            // .map((r: any) => {
            //   const mime = r.headers._headers.get('content-type')[0]  || 'application/pdf';
            //   return new Blob([r._body], { type: mime});
            // });
      }
}
