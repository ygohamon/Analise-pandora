import { Component, OnInit } from '@angular/core';

import { AppDashboardComponent } from './../dashboard/app.dashboard.component';
import { AuthService } from '../services/auth/auth.service';
import { UtilsService } from '../services/common/utils.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

  nome;

  constructor(public app: AppDashboardComponent,
              public utils: UtilsService,
              private auth: AuthService) {}

  ngOnInit() {
    this.nome = this.auth.getNome().toLowerCase();
  }

  onLogout() {
    this.auth.logout();
  }

  onMenuSlim() {
    this.app.changeToSlimMenu();
  }

  onMenuStatic() {
    this.app.changeToStaticMenu();
  }

  onMenuDark() {
    this.app.darkMenu = true;
  }

  onMenuLight() {
    this.app.darkMenu = false;
  }
}
