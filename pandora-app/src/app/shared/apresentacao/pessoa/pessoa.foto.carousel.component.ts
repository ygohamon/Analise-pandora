import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-foto-carousel',
    templateUrl: 'pessoa.foto.carousel.component.html'
})
export class PessoaFotoCarouselComponent implements OnInit {

    @Input() fotos;
    @Output() fotosChange = new EventEmitter();

    fotoSelecionada;
    msgRegistroNaoEncontrado: string;

    mostraFotoAmpliada: boolean = false;
    imagemAmpliada;

    constructor(
      public utils: UtilsService,
      private _sanitizer: DomSanitizer
    ) {}

    ngOnInit() {
        this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
        this.mostraFotoAmpliada       = false;
    }

    ampliaImagem(img) {
        this.mostraFotoAmpliada = true;
        this.imagemAmpliada = img;
    }

    sanitize(img: string) {
        const url = `data:image/png;base64,${img}`;
        return this._sanitizer.bypassSecurityTrustUrl(url);
    }
}
