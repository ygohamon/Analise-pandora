import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-pessoa-boletim-ocorrencia-dataview',
  templateUrl: './boletim_ocorrencia.dataview.component.html'
})
export class BoletimOcorrenciaDataViewComponent implements OnInit {

  @Input() boletimOcorrencia;
  @Output() dataChange = new EventEmitter();

  msgRegistroNaoEncontrado: string;

  constructor(public utils: UtilsService) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
  }
}
