import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-obito-datalist',
    templateUrl: 'pessoa.obito.datalist.component.html'
})
export class PessoaObitoDatalistComponent implements OnInit {

    @Input() obitos;
    @Output() obitosChange = new EventEmitter();

    obitoSelecionado;
    msgRegistroNaoEncontrado: string;

    constructor(public utils: UtilsService) {}

    ngOnInit() {
      this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    }

    onRemoverObito(index) {
        this.obitos = this.obitos.filter((registro, i, array) => i !== index);
        this.obitos = this.obitos.map((registro, i) => {
            registro['index'] = i;
            return registro;
        });
        this.obitosChange.emit(this.obitos);
    }
}
