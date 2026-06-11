import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-estatisticas',
  templateUrl: './estatisticas.component.html',
  styleUrls: ['./estatisticas.component.css']
})
export class EstatisticasComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso = false;
  buscaFalha   = false;

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onTabChange(event) {

    if (event.index === 0) {
      // this.getRankingSiapv2();
    } else if (event.index === 1) {
      // this.getRecursosMaisUtilizados();
    } else if (event.index === 2) {
      // this.getRecursosEChavesMaisUtilizados();
    } else if (event.index === 3) {
      // this.getEstatisticasUso();
    } else if (event.index === 4) {
      // this.getRegistrosNaoEncontrados();
    }
  }
}
