import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-pessoa-pep-datatable',
  template: `
      <pandora-table
        caption="Pessoa Exposta Politicamente"
        exportFilename="pep"
        [value]="data"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class PessoaPEPDatatableComponent {
  @Input() data;

  dicionarioDados = {
    ano  : { nome: 'Ano' },
    orgao: { nome: 'Órgão' },
    cargo: { nome: 'Cargo' }
  }
}
