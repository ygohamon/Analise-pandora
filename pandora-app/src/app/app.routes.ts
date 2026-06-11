import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { LoginComponent } from './pages/login/login.component';
import { TrocaSenhaComponent } from './pages/trocasenha/trocasenha.component';
import { SessaoExpiradaComponent } from './pages/sessaoexpirada/sessaoexpirada.component';

import {
    AuthGuard,
    AdminGuard,
    TrocaSenhaGuard,
    SessaoExpiradaGuard,
} from './services/auth/authguard.service';

export const routes: Routes = [
  { path: '',  pathMatch: 'full', redirectTo: 'login' },
  { path: 'login',  component: LoginComponent },
  {
    path: 'cadastro',
    loadChildren: () => import('./pages/cadastro/cadastro.module').then(m => m.CadastroModule)
  },
  { path: 'trocasenha',  component: TrocaSenhaComponent, canActivate: [TrocaSenhaGuard] },
  { path: 'sessaoexpirada',  component: SessaoExpiradaComponent, canActivate: [SessaoExpiradaGuard] },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/app.dashboard.module').then(m => m.AppDashboardModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  },

  { path: '**', redirectTo: 'login'}
];

export const AppRootRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
