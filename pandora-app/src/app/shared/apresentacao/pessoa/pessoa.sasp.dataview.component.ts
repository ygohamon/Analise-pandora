import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ExportService } from 'src/app/services/common/export.service';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-pessoa-sasp-dataview',
  templateUrl: './pessoa.sasp.dataview.component.html'
})
export class PessoaSASPDataViewComponent implements OnInit {

  @Input() sasp;
  @Input() exportFilename: any;
  @Output() dataChange = new EventEmitter();

  msgRegistroNaoEncontrado: string;

  colunasTabela;

  dicionarioMandado = {
    alcunha:                {nome: 'Alcunha'},
    nome:                   {nome: 'Nome'},
    nomeMae:                {nome: 'Mãe'},
    nomePai:                {nome: 'Pai'},
    sexo:                   {nome: 'Sexo'},
    dataNascimento:         {nome: 'Data de Nascimento'},
    naturalidade:           {nome: 'Naturalidade'},
    tipoPessoa:             {nome: 'Tipo da Pessoa'},
    corRaca:                {nome: 'Raça'},
    dataCriacao:            {nome: 'Data de Criação'},
  }

  constructor(
    public utils: UtilsService,
    private sanitizer: DomSanitizer,
    public exporta: ExportService,
  ) { }



  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.colunasTabela = Object.keys(this.dicionarioMandado).map(d => { return { field: d, header: this.dicionarioMandado[d].nome } });
  }

  exportPdf() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.pdf` : 'export.pdf';

    const fn = (doc) => {
      doc.setFontSize(18);
      doc.text('Informações da PM', 14, 22);
    }
    this.exporta.exportPdf(this.colunasTabela, this.sasp, filename, fn, 35);
  }

  exportExcel() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.xlsx` : 'export.xlsx';
    this.exporta.exportExcel(this.sasp, filename);
  }

  sanitize(img: string) {
    const url = `data:image/png;base64,${img}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
