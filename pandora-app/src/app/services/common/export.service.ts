import { Injectable } from '@angular/core';

@Injectable()
export class ExportService {

  constructor() {}

  exportPdf(cols, dados, filename, fn = null, offsetY =0) {
    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(x => {
        const doc = new jsPDF.default(0,0);

        if (fn) {
          fn(doc);
        }

        doc.autoTable({
          columns: cols.map(col => ({header: col.header, dataKey: col.field})),
          body: dados,
          startY: offsetY
        });

        doc.save(filename);
      })
    })
  }

  exportExcel(dados, filename) {
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(dados);
        const workbook  = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

        import("file-saver").then(FileSaver => {
          let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
          const data: Blob = new Blob([excelBuffer], {
              type: EXCEL_TYPE
          });
          FileSaver.saveAs(data, filename);
        });
    });
  }

  exportDocx(dados, filename) {
    import("docx").then(docx => {
        const doc = new docx.Document();
        const cabecalho = [new docx.Paragraph({
          text: "Qualificações",
          heading: docx.HeadingLevel.TITLE,
        })];

        const qualificacoes = dados.map(d => {
          return new docx.Paragraph({
            alignment: docx.AlignmentType.JUSTIFIED,
            spacing: {
              before: 200,
            },
            children: [
              new docx.TextRun({ text: d.destaque, bold: true }),
              new docx.TextRun({ text: d.texto }),
            ],
          })
        })

        doc.addSection({ children: cabecalho.concat(qualificacoes)});

        import("file-saver").then(FileSaver => {
          // let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
          docx.Packer.toBlob(doc).then(blob => {
            FileSaver.saveAs(blob, filename);
          });
        });
    });
  }
}
