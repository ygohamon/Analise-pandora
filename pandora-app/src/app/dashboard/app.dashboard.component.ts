import { Component, ElementRef, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

enum MenuMode {
  STATIC,
  OVERLAY,
  SLIM
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './app.dashboard.component.html'
})
export class AppDashboardComponent implements OnInit {

  menu: MenuMode = MenuMode.SLIM;

  layout: string = 'blue';

  darkMenu: boolean = true;

  documentClickListener: Function;

  staticMenuInactive: boolean;

  overlayMenuActive: boolean;

  mobileMenuActive: boolean;

  menuClick: boolean;

  menuButtonClick: boolean;

  topbarMenuButtonClick: boolean;

  topbarMenuClick: boolean;

  topbarMenuActive: boolean;

  activeTopbarItem: Element;

  resetSlim: boolean;

  menuHoverActive: boolean;


  constructor(public renderer: Renderer2,
              private auth: AuthService,
              private router: Router) {}

    ngOnInit() {
      // if (!this.auth.isAuthenticated()) {
      //     this.router.navigate(['/login']);
      // }
    }

    onLayoutClick() {
      if (!this.menuClick && !this.menuButtonClick) {
        this.mobileMenuActive = false;
        this.overlayMenuActive = false;
        this.resetSlim = true;
        this.menuHoverActive = false;
      }

      if (!this.topbarMenuClick && !this.topbarMenuButtonClick) {
        this.topbarMenuActive = false;
      }

      this.menuClick = false;
      this.menuButtonClick = false;
      this.topbarMenuClick = false;
      this.topbarMenuButtonClick = false;
    }

    onMenuButtonClick(event: Event) {
      this.menuButtonClick = true;

      if (this.isMobile()) {
        this.mobileMenuActive = !this.mobileMenuActive;
      } else {
        if (this.staticMenu) {
          this.staticMenuInactive = !this.staticMenuInactive;
        } else if (this.overlayMenu) {
          this.overlayMenuActive = !this.overlayMenuActive;
        }
      }

      event.preventDefault();
    }

    onTopbarMenuButtonClick(event: Event) {
      this.topbarMenuButtonClick = true;
      this.topbarMenuActive = !this.topbarMenuActive;
      event.preventDefault();
    }

    onTopbarItemClick(event: Event, item: Element) {
      if (this.activeTopbarItem === item) {
        this.activeTopbarItem = null;
      } else {
        this.activeTopbarItem = item;
      }

      event.preventDefault();
    }

    onTopbarMenuClick(event: Event) {
      this.topbarMenuClick = true;
    }

    onMenuClick(event: Event) {
      this.menuClick = true;
      this.resetSlim = false;
    }

    get slimMenu(): boolean {
      return this.menu === MenuMode.SLIM;
    }

    get overlayMenu(): boolean {
      return this.menu === MenuMode.OVERLAY;
    }

    get staticMenu(): boolean {
      return this.menu === MenuMode.STATIC;
    }

    changeToSlimMenu() {
      this.menu = MenuMode.SLIM;
    }

    changeToOverlayMenu() {
      this.menu = MenuMode.OVERLAY;
    }

    changeToStaticMenu() {
      this.menu = MenuMode.STATIC;
    }

    isMobile() {
      return window.innerWidth <= 640;
    }
  }
