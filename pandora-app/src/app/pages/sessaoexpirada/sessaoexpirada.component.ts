import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { UtilsService } from '../../services/common/utils.service';

@Component({
    selector: 'app-sessao-expirada',
    template: `
    <div class="exception-body error">
        <div class="exception-panel">

            <div class="exception-panel-content">
                <img src="../../assets/layout/images/exception/error-icon.png">
                <h1>Sessão expirada</h1>
                <p>Sua sessão expirou, refaça o login para ter acesso ao sistema.</p>
            </div>

            <div class="exception-panel-footer ui-fluid">
                <button pButton type="button" (click)="goLogin()" label="Login"></button>
            </div>
        </div>
    </div>
    `
})
export class SessaoExpiradaComponent implements OnInit, AfterViewInit {

    constructor(private auth: AuthService,
                private route: ActivatedRoute,
                private utils: UtilsService,
                private router: Router) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
      setTimeout(() => {
          this.auth.logout();
      }, 6000);
    }

    goLogin() {
      this.auth.logout();
    }
}
