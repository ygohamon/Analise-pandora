import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectItem, MessageService } from 'primeng/api';
import { UtilsService } from 'src/app/services/common/utils.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  templateUrl: './painelbuscas.component.html',
})
export class DialogPainelBuscasComponent {

  recursos: SelectItem[];
  recursoSelecionado;

  dado;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public message: MessageService,
    private utils: UtilsService
    ) {
  }

  ngOnInit() {
    this.recursos = [
      {label: 'Escolha uma Entidade', value: null},
      {label: 'Pessoa', value: 'pessoa'},
      {label: 'Empresa', value: 'empresa'},
      {label: 'Telefone', value: 'telefone'},
    ]
  }

  fecha() {
    this.ref.close({recurso: this.recursoSelecionado, dado: this.dado});
  }

  buscarRecurso() {
    if (this.recursoSelecionado === 'pessoa') {
      if (!this.utils.validarCPF(this.dado)){
        this.message.add(this.utils.mensagemWarning('Atenção', 'CPF inválido.'));
      } else {
        this.dado = this.utils.checaCPF(this.dado);
        this.fecha();
      }
    } else if (this.recursoSelecionado === 'empresa') {
      if (!this.utils.validarCNPJ(this.dado)){
        this.message.add(this.utils.mensagemWarning('Atenção', 'CNPJ inválido.'))
      } else {
        this.dado = this.utils.checaCNPJ(this.dado);
        this.fecha();
      }
    } else if (this.recursoSelecionado === 'telefone') {
      if (!this.dado) {
        this.message.add(this.utils.mensagemWarning('Atenção', 'Telefone inválido.'))
      } else {
        this.dado = this.dado.trim().replace(/[^0-9]/g,'');
        this.fecha();
      }
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Entidade inválida.'))
    }
  }
}

