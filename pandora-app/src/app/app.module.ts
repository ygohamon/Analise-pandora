import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

/**
 * Importações de 3rd parties
 */
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';

/**
 * PrimeNG
 */
import { CaptchaModule } from 'primeng/captcha';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

/**
 * Importações da aplicação
 */
import { environment } from '../environments/environment';

import { AppRootRoutes } from './app.routes';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { SessaoExpiradaComponent } from './pages/sessaoexpirada/sessaoexpirada.component';
import { TrocaSenhaComponent } from './pages/trocasenha/trocasenha.component';

import { AuthService } from './services/auth/auth.service';
import { UtilsService } from './services/common/utils.service';
import { UsuarioService } from './services/usuario/usuario.service';
import { AplicativoService } from './services/aplicativo/aplicativo.service';

// Guards
import { AuthGuard, AcessoGuard } from './services/auth/authguard.service';
import { AdminGuard } from './services/auth/authguard.service';
import { SessaoExpiradaGuard } from './services/auth/authguard.service';
import { TrocaSenhaGuard } from './services/auth/authguard.service';

import { JwtHttpInterceptor } from './services/auth/http.interceptor';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SessaoExpiradaComponent,
    TrocaSenhaComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),

    /**
     * 3rd parties modules
     */
    RecaptchaModule,
    CaptchaModule,
    ButtonModule,
    ToastModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,

    /**
     * Rotas
     */
    AppRootRoutes,
  ],
  providers: [
    AuthService,
    UtilsService,
    UsuarioService,
    AplicativoService,
    MessageService,

    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: environment.GOOGLE_RECAPTCHA_SECRET_KEY } as RecaptchaSettings
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtHttpInterceptor, multi: true },

    /**
     * Guards para proteger as rotas
     */
    AcessoGuard,
    AuthGuard,
    AdminGuard,
    SessaoExpiradaGuard,
    TrocaSenhaGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
