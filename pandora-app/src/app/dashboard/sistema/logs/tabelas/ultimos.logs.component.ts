import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-ultimos-logs',
  template: `
    <pandora-table
      caption="Últimos registros"
      exportFilename="logs"
      [value]="dados"
      dataKey="key"
      [rows]="20"
      mostraEspacamentoExpand="true"
      [dicionarioDadosExpand]="dicionarioDadosExpand"
      [dicionarioDados]="dicionarioDados">
    </pandora-table>
    `
})
export class UltimosLogsComponent implements OnInit {

  @Input() logsEncontrados;
  dados;

  dicionarioDados = {
    ip      : {nome: 'IP' },
    usuario : {nome: 'Usuário', fn: (x) => this.utils.toLowerCase(x) },
    secao   : {nome: 'Seção', fn: (x) => this.utils.toUpperCase(x) },
    item    : {nome: 'Item', fn: (x) => this.utils.toUpperCase(x) },
    chave   : {nome: 'Chave', fn: (x) => this.utils.toUpperCase(x) },
    valor   : {nome: 'Valor', fn: (x) => this.utils.toUpperCase(x) },
    tipo    : {nome: 'Tipo', fn: (x) => this.utils.toUpperCase(x) },
    mensagem: {nome: 'Mensagem', fn: (x) => this.utils.toUpperCase(x) },
    dataHora: {nome: 'Data/Hora', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY [as] HH:mm:ss') },
  }

  dicionarioDadosExpand = {
    ip      : {nome: 'IP' },
    url     : {nome: 'URL' },
    usuario : {nome: 'Usuário', fn: (x) => this.utils.toLowerCase(x) },
    secao   : {nome: 'Seção', fn: (x) => this.utils.toUpperCase(x) },
    item    : {nome: 'Item', fn: (x) => this.utils.toUpperCase(x) },
    chave   : {nome: 'Chave', fn: (x) => this.utils.toUpperCase(x) },
    valor   : {nome: 'Valor', fn: (x) => this.utils.toUpperCase(x) },
    tipo    : {nome: 'Tipo', fn: (x) => this.utils.toUpperCase(x) },
    mensagem: {nome: 'Mensagem', fn: (x) => this.utils.toUpperCase(x) },
    processo: {nome: 'Processo', fn: (x) => this.utils.toUpperCase(x) },
    dataHora: {nome: 'Data/Hora', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY [as] HH:mm:ss') },
    userAgent:{nome: 'Agente' },
    browser:  {nome: 'Browser' },
    device:   {nome: 'Device' },
    os:       {nome: 'OS' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dados = this.logsEncontrados.map((l, idx) => Object.assign(l, {key: idx}));
  }
}
