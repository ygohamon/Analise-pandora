import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Route } from '@angular/router';
import { AuthService } from './auth.service';

import { environment } from '../../../environments/environment';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {

    if (this.auth.getTrocaSenha() && this.auth.isAuthenticated()) {
      this.router.navigate(['trocasenha']);
    } else if (this.auth.getRecadastramento() && this.auth.isAuthenticated()) {
      this.router.navigate(['cadastro'], { queryParams: { q: 'recadastramento' } });
    } else {
      // Libera o acesso se o usuário ainda tiver um token válido, não precisar
      // trocar de senha e nem fazer um recadastramento
      if (this.auth.isAuthenticated()) {
        return true;
      } else if (!this.auth.getToken()) { // Não existe token setado
        this.router.navigate(['login']);
      } else {
        this.router.navigate(['sessaoexpirada']);
      }
    }
  }

  canActivateChild() {

    if (this.auth.isAuthenticated()) {
      return true;
    } else if (!this.auth.getToken()) { // Não existe token setado
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['sessaoexpirada']);
    }
  }
}

@Injectable()
export class TrocaSenhaGuard implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['login']);
    }
  }
}

@Injectable()
export class SessaoExpiradaGuard implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {
    if (!!this.auth.getToken() || !environment.production) {
      return true;
    } else {
      this.router.navigate(['login']);
    }
  }
}

@Injectable()
export class AcessoGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.auth.checkControleAcesso(route.data['secao'], route.data['permissao']) || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  canLoad(route: Route) {
    if (this.auth.checkControleAcesso(route.data['secao'], route.data['permissao']) || this.auth.getPerfil() === 'admin') {
      return true;
    } else if (this.auth.checkSecaoExiste(route.data['secao']) && route.data['checaSecao']) {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }
}

@Injectable()
export class OperacoesGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {
    if (this.auth.getOperacoes() || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  canLoad() {
    if (this.auth.getOperacoes() || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }
}

@Injectable()
export class AnaliseGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {
    if (this.auth.getAnalise() || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  canLoad() {
    if (this.auth.getAnalise() || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }
}

@Injectable()
export class MembrosGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {
    if (this.auth.getMembro() || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  canLoad() {
    if (this.auth.getMembro() || this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthService,
              private router: Router) {}

  canActivate() {
    if (this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  canLoad() {
    if (this.auth.getPerfil() === 'admin') {
      return true;
    } else {
      this.router.navigate(['dashboard']);
    }
  }
}
