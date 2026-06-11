import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-painelcovid-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardPainelCovidComponent implements OnInit {

  @Input() dados;
  @Input() uf;

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  get isMobile() {
    return this.utils.isMobile();
  }
}
