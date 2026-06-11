import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms';

import { UtilsService } from '../services/common/utils.service';

@Component({
  selector: 'app-campos-busca',
  templateUrl: 'camposbusca.component.html',
})
export class CamposBuscaComponent implements OnInit {

  @Input() titulo;
  @Input() nProcesso;
  @Input() campos;
  @Input() buscaFinalizada;
  @Output() buscaFinalizadaChange = new EventEmitter();
  @Output() pesquisa: EventEmitter<any> = new EventEmitter();

  processoTitulo: string;

  mobileCampos;
  mobileCampoSelecionado;
  mobileConteudoCampo;

  mostraInput: boolean = false;

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    if (this.nProcesso) {
      this.processoTitulo = `Buscas relativas ao processo: ${this.nProcesso}`;
    }

    this.mobileCampos = this.campos.map(d => {
      return {
        label: d.nome,
        value: d.id,
        icon: 'fa fa-check'
      };
    });
  }

  setaCampoSelecionado(data) {
    this.mobileCampoSelecionado = data;
    this.mostraInput = true;
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  getCampoData() {
    return this.campos.filter(d => d.id === this.mobileCampoSelecionado.value)[0];
  }

  confirmaCampoSelecionado() {
    this.mostraInput = true;
  }

  desconfirmaCampoSelecionado() {
    this.mostraInput = false;
    this.mobileCampoSelecionado = null;
    this.mobileConteudoCampo = null;
    this.buscaFinalizadaChange.emit(false);
  }

  confirmaConteudoBusca() {
    const conteudoForm = {};
    conteudoForm[`${this.getCampoData().id}`] = new FormControl(this.mobileConteudoCampo);

    const form = new FormGroup(conteudoForm);
    this.pesquisa.emit(form);
  }

  onPesquisa(pesquisaForm) {
    this.pesquisa.emit(pesquisaForm);
  }

  desabilitaCampo(form, index: number) {
    const campoAtual = this.campos[index].id;
    return Object.keys(form.value)
      .filter(campo => campo !== campoAtual)
      .reduce((acc, campo) => (form.value[campo]) ? acc || true : acc, false);
  }

  desabilitaButao(form) {
    return !Object.keys(form.value)
      .reduce((acc, campo) => (form.value[campo]) ? acc || true : acc, false);
  }
}
