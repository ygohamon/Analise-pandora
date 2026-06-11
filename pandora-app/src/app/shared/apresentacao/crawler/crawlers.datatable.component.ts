import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-datatable',
    templateUrl: 'crawlers.datatable.component.html'
})
export class CrawlersDatatableComponent implements OnChanges {

  @Input() data;
  @Output() dataChange = new EventEmitter();

  msgRegistroNaoEncontrado: string;

  escavador:      Array<any>;
  jusbrasil:      Array<any>;
  instagram:      Array<any>;
  facebook:       Array<any>;
  linkedin:       Array<any>;
  transparencia:  any[];
  motoresbusca:   Array<any>;
  doe: any[]

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.motoresbusca = this.data.filter(dado => dado.tipo === 'buscageral');

    this.instagram    = this.data.filter(dado => dado.tipo === 'instagram');
    this.facebook     = this.data.filter(dado => dado.tipo === 'facebook');
    this.linkedin     = this.data.filter(dado => dado.tipo === 'linkedin');

    this.jusbrasil    = this.data.filter(dado => dado.fonte === 'jusbrasil');
    this.escavador    = this.data.filter(dado => dado.fonte === 'escavador');
    this.transparencia    = this.data.filter(dado => dado.fonte === 'transparencia');

    this.doe          = this.data.filter(dado => dado.tipo === 'doe');
  }
}
