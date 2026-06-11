import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from './../services/common/utils.service';

@Component({
  selector: 'app-mensagem-erro',
  styles: [`
      img {
          width: 100%;
          height: auto;
          max-width: 100px;
      }
  `],
  template: `
      <div class="card card-w-title">
          <div class="ui-g">

              <div class="ui-g-2 ui-sm-12"></div>

              <div class="ui-g-6 ui-sm-8">
                  <h1 style="font-size: 5em; text-align: center;">
                      500
                  </h1>

                  <div class="ui-g-12" style="font-size: 1.3em; text-align: justify;">
                      <span>Desculpe-nos, ocorreu um erro inesperado e sua requisição não pode ser feita corretamente.</span>
                  </div>
                  <div class="ui-g-12" style="font-size: 1.1em;">
                      <span>Favor, tentar novamente em breve.</span>
                  </div>
              </div>

              <div class="ui-g-2 ui-sm-4" style="text-align: center;">
                  <img src="../../assets/layout/images/exception/error-icon.png" alt="!" />
              </div>

              <div class="ui-g-2 ui-sm-12"></div>
          </div>
      </div>
  `
})
export class MensagemErroComponent implements OnInit {

    constructor(private utils: UtilsService) { }

    ngOnInit() {
    }
}
