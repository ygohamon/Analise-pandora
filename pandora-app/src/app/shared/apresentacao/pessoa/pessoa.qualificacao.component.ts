import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';
import { QualificacaoService } from '../../../services/common/qualificacao.service';

@Component({
  selector: 'app-pessoa-qualificacao',
  template: `
    <div class="ui-g">
      <div class="ui-g-3 ui-sm-1"></div>
      <div class="ui-g-6 ui-sm-10 text-justify">
        <div class="r-card b-0 py-3">
          <strong>{{pessoa.nome}}</strong>
          {{qualificacao.getTemplatePessoa(pessoa)}}.
        </div>
      </div>
    </div>
  `
})
export class PessoaQualificacaoComponent implements OnChanges {

  @Input() data;

  pessoa;

  constructor(
    public utils: UtilsService,
    public qualificacao: QualificacaoService,
  ) {}

  ngOnChanges() {
    this.pessoa = this.processaPessoa(this.data);
  }

  processaPessoa(dadosEncontrados) {
    if (!dadosEncontrados.pessoa) return null;

    return this.qualificacao.processaPessoa(dadosEncontrados);
  }
}
