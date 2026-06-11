import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'app-ficha-suja',
  templateUrl: './pessoa.ficha_suja.datatable.component.html'
})
export class FichaSujaDatatableComponent implements OnInit {

  @Input() data;

  fichaSuja;

  // Colunas para a tabela
  dicionarioDadosCompleto = {
    orgao          : { nome: 'Órgão' },
    processo       : { nome: 'Processo' }
  }

  dicionarioDadosExpandCompleto = {
    nome                       : { nome: 'Nome' },
    processo                   : { nome: 'Número do Processo'},
    dtprocesso                 : { nome: 'Data do Processo', fn: this.utils.formataData },
    detalhe_processo           : { nome: 'Detalhe do Processo', fn: this.utils.formataData },
    esfera                     : { nome: 'Esfera' },
    data_julgamento            : { nome: 'Data do Julgamento', fn: this.utils.formataData },
    data_suspensao             : { nome: 'Data Suspensão', fn: this.utils.formataData },
    dt_inicio_condenacao       : { nome: 'Data Início Condenação', fn: this.utils.formataData },
    dt_final_condenacao        : { nome: 'Data Final Condenação', fn: this.utils.formataData },
    assunto_resumo_deliberacao : { nome: 'Resumo da Deliberação' },
    exclusao_suspensa          : { nome: 'Exclusão Suspensa' },
    partido                    : { nome: 'Partido' },
    perda_mandato_renuncia     : { nome: 'Perda/Renuncia Mandato' },
    uf_mandato                 : { nome: 'Uf Mandato' },
    registro_profissional      : { nome: 'Registro Profissional' },
    observacoes                : { nome: 'Observações' }
  }

  constructor(public utils: UtilsService) {}

  ngOnInit(): void {
    this.fichaSuja = this.data.map((dado, idx) => Object.assign(dado, {id: idx}));
  }
}
