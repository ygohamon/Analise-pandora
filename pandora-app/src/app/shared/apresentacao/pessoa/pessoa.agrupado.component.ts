import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-agrupado',
    templateUrl: 'pessoa.agrupado.component.html',
    styles: [`
      .pandora-linha-dataview:nth-child(even) {
        background: #f0f0f0;
      }
    `]
})
export class PessoaAgrupadoComponent {

  @Input() pessoaAgrupado;
  @Input() mostraPessoaAgrupado;

  pessoaSelecionada;

  constructor(
    public utils: UtilsService,
    private sanitizer: DomSanitizer
  ) {}

  sanitize(img: string) {
    const url = `data:image/png;base64,${img}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
