import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'descricao-orcrim-component',
  template: `
    <div class="ui-g-12 px-0" *ngIf="descricaoOrcrim.organizacao">
      <div class="p-card mb-0 ui-corner-all">
        <div class="p-card-subtitulo text-center">{{this.utils.toUpperCase(descricaoOrcrim.organizacao)}}</div>
      </div>
    </div>

    <div class="ui-g-12 px-0" *ngIf="descricaoOrcrim.descricao">
      <div class="p-card mb-0 ui-corner-all">
        <div class="text-center">{{descricaoOrcrim.descricao}}</div>
      </div>
    </div>
  `
})
export class DescricaoOrcrimComponent implements OnInit {
  @Input() dados;

  descricaoOrcrim;

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.descricaoOrcrim = this.utils.first(
      this.utils.first(
        this.dados.filter(
          x => Object.keys(x)[0] === 'organizacao_criminosa'
        )
      )?.organizacao_criminosa);
  }
}
