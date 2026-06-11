import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-preso-datalist',
    templateUrl: 'pessoa.preso.datalist.component.html'
})
export class PessoaPresoDatalistComponent implements OnChanges {

    @Input() data;
    @Output() dataChange = new EventEmitter();

    presoSelecionada;
    mostraTelaEdicaoPreso: boolean = false;
    msgRegistroNaoEncontrado: string;

    dadosPrisional;
    dadosSDS;
    dadosSISDEPEN;

    constructor(public utils: UtilsService) {}

    ngOnChanges() {
        this.msgRegistroNaoEncontrado   = this.utils.registroNaoEncontrado;
        this.dadosPrisional             = this.data.filter(dado => dado.fonte === 'PRS').map((dado, i) => { dado.index = i; return dado; });
        this.dadosSDS                   = this.data.filter(dado => dado.fonte === 'SDS').map((dado, i) => { dado.index = i; return dado; });
        this.dadosSISDEPEN              = this.data.filter(dado => dado.fonte === 'DEP').map((dado, i) => { dado.index = i; return dado; });
    }

    onEditarPreso(registro) {
        this.mostraTelaEdicaoPreso = true;
        this.presoSelecionada = registro;
    }

    onRemoverPrisional(index) {
        // this.data = this.data.filter((registro, i, array) => i !== index);
        // this.presos = this.presos.map((registro, i) => {
        //     registro['index'] = i;
        //     return registro;
        // });
        // this.presosChange.emit(this.presos);
    }

    onRemoverSDS(index) {
        // this.presos = this.presos.filter((registro, i, array) => i !== index);
        // this.presos = this.presos.map((registro, i) => {
        //     registro['index'] = i;
        //     return registro;
        // });
        // this.presosChange.emit(this.presos);
    }
}
