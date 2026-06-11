import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-gerenciamento-usuarios-table',
  templateUrl: './gerenciamento.usuarios.table.component.html',
})
export class GerenciamentoUsuariosTableComponent implements OnInit, OnDestroy {

  @Input() usuariosEncontrados;

  // usuarioSelecionado;
  @Output() usuarioSelecionado = new EventEmitter()
  
  cols = [
    // { field: 'nome',   header: 'Nome' },
    { field: 'login',  header: 'Login' },
    { field: 'acesso', header: 'Acesso' },
    { field: 'perfil', header: 'Perfil' },
    { field: 'ativo',  header: 'Ativo' },
    { field: 'email',  header: 'Email' },
  ];

  msgRegistroNaoEncontrado;

  constructor(public utils: UtilsService) { }

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
  }

  ngOnDestroy() {
  }

  onRowSelect(event) {
    this.usuarioSelecionado.emit(event.data);
  }
}
