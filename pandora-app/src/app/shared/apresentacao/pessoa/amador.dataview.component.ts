import { Component, Input , Output, OnInit , EventEmitter} from '@angular/core';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-amador-dataview',
    templateUrl: './amador.dataview.component.html'
})
export class AmadorDataViewComponent implements OnInit{

    @Input() amador;
    @Output() dataChange = new EventEmitter();

    msgRegistroNaoEncontrado: string;
  
    constructor( public utils: UtilsService ) {}

    ngOnInit() {
      this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    }


}
