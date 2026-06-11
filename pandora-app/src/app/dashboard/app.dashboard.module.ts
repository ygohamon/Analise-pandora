import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppDashboardRoutesModule } from './app.dashboard.routes';
import { AppSharedModule } from '../shared/shared.module';

import { AppDashboardComponent } from './app.dashboard.component';
import { AppMenuComponent, AppSubMenuComponent } from '../shared/app.menu.component';
import { AppTopBarComponent } from '../shared/app.topbar.component';
import { AppFooterComponent } from '../shared/app.footer.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppDashboardComponent,
    AppMenuComponent,
    AppSubMenuComponent,
    AppTopBarComponent,
    AppFooterComponent,
    HomeComponent,  
  ],
  imports: [
    AppDashboardRoutesModule,
    AppSharedModule,
  ],
  providers: [
  ]
})
export class AppDashboardModule {}
