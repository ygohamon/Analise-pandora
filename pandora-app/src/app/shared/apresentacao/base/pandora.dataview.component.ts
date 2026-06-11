import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';
import { ExportService } from '../../../services/common/export.service';

@Component({
    selector: 'app-pandora-dataview',
    templateUrl: 'pandora.dataview.component.html',
    styleUrls: ['pandora.dataview.component.scss'],
})
export class PandoraDataviewComponent implements OnInit {

    @Input() values;
    @Input() header;
    @Input() dict;
    @Input() exportFilename;
    @Input() orientacao;
    // @Output() mandadosChange = new EventEmitter();

    mandadoSelecionado;
    msgRegistroNaoEncontrado: string;
    colunasTabela;

    constructor(
      public utils: UtilsService,
      public exporta: ExportService,
    ) {}

    ngOnInit() {
        this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
        this.colunasTabela = Object.keys(this.dict).map(d => { return { field: d, header: this.dict[d].nome }});
    }

    manterOrdem(a, b) {
      return a;
    }


  exportPdf() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.pdf` : 'export.pdf';

    const fn = (doc) => {
      doc.setFontSize(18);
      doc.text(`${this.header}`, 14, 22);

      // doc.setFontSize(11);
      // doc.setTextColor(100);
      // doc.text(this.descricao, 14, 30);
    }
    this.exporta.exportPdf(this.colunasTabela, this.values, filename, fn, 35);
  }

  exportExcel() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.xlsx` : 'export.xlsx';
    this.exporta.exportExcel(this.values, filename);
  }

}
