import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-orcrim-dashboard',
  templateUrl: './dashboard.orcrim.component.html'
})
export class DashboardComponent implements OnInit {
  private _destroy$ = new Subject();

  @Input() dados;

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
