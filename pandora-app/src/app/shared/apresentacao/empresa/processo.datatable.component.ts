import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-processo',
    templateUrl: './processo.datatable.component.html'
})
export class EmpresaProcessoDatatableComponent implements OnChanges {

    @Input() data;

    dataCEIS;
    dataAcordoLeniencia;
    dataCNEP;
    dataCEPIM;
    dataCEIST; // CEIS da Transparência

    dataProcessoTCU;
    dataCondenacaoTCU;
    dataAcordaoTCU;

    dicionarioDadosCEIS = {
      processo            : {nome: 'Processo'},
      tipoSancao          : {nome: 'Tipo Sanção'},
      dataInicio          : {nome: 'Data Início', fn: this.utils.formataData},
      dataFinal           : {nome: 'Data Final', fn: this.utils.formataData},
      orgaoSancionador    : {nome: 'Orgão Sancionador'},
      ufOrgaoSancionador  : {nome: 'UF'},
      origemInformacoes   : {nome: 'Origem' },
      dataOrigem          : {nome: 'Data Origem', fn: this.utils.formataData},
      publicacao          : {nome: 'Publicação' },
      dataPublicacao      : {nome: 'Data Publicação', fn: this.utils.formataData},
    }

    dicionarioDadosAcordoLeniencia = {
      orgaoResponsavel  : {nome: 'Órgão Responsável'},
      id                : {nome: 'Identificador'},
      dataInicioAcordo  : {nome: 'Início'},
      dataFimAcordo     : {nome: 'Fim'},
      // ufEmpresa         : {nome: 'UF'},
      situacaoAcordo    : {nome: 'Situação'},
      quantidade        : {nome: 'Quantidade'},
      dataConsulta      : {nome: 'Data Consulta', fn: this.utils.formataData},
    }

    dicionarioDadosCNEP = {
      dataReferencia        : {nome: 'Data Referência', fn: this.utils.formataData},
      dataInicioSancao      : {nome: 'Data Início Sanção', fn: this.utils.formataData},
      dataFimSancao         : {nome: 'Data Fim Sanção', fn: this.utils.formataData},
      dataPublicacaoSancao  : {nome: 'Data Publicação Sanção', fn: this.utils.formataData},
      dataTransitadoJulgado : {nome: 'Trânsito Julgado', fn: this.utils.formataData},
      dataOrigemInformacao  : {nome: 'Data Origem Info', fn: this.utils.formataData},
      tipoSancao            : {nome: 'Tipo' },
      fonteSancao           : {nome: 'Fonte' },
      dispositivo           : {nome: 'Dispositivo' },
      valorMulta            : {nome: 'Multa', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
      textoPublicacao       : {nome: 'Publicação'},
      numeroProcesso        : {nome: 'Processo'},
      municipio             : {nome: 'Município'},
      uf                    : {nome: 'UF'},
    }

    dicionarioDadosCEIST = {
      dataReferencia        : {nome: 'Data Referência', fn: this.utils.formataData},
      dataInicioSancao      : {nome: 'Data Início Sanção', fn: this.utils.formataData},
      dataFimSancao         : {nome: 'Data Fim Sanção', fn: this.utils.formataData},
      dataPublicacaoSancao  : {nome: 'Data Publicação Sanção', fn: this.utils.formataData},
      dataTransitadoJulgado : {nome: 'Trânsito Julgado', fn: this.utils.formataData},
      dataOrigemInformacao  : {nome: 'Data Origem Info', fn: this.utils.formataData},
      tipoSancao            : {nome: 'Tipo' },
      fonteSancao           : {nome: 'Fonte' },
      orgaoSancionador      : {nome: 'Sancionador' },
      dispositivo           : {nome: 'Dispositivo' },
      // valorMulta            : {nome: 'Multa', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}` },
      numeroProcesso        : {nome: 'Processo'},
      textoPublicacao       : {nome: 'Publicação'},
      detalhamentoPublicacao: {nome: 'Detalhamento'},
      municipio             : {nome: 'Município'},
      uf                    : {nome: 'UF'},
      dataConsulta          : {nome: 'Data Consulta', fn: this.utils.formataData},
    }

    dicionarioDadosCEPIM = {
      dataReferencia : {nome: 'Data Referência', fn: this.utils.formataData},
      orgaoSuperior  : {nome: 'Órgão Superior' },
      motivo         : {nome: 'Motivo' },
      convenioCodigo : {nome: 'Código Convênio' },
      convenioObjeto : {nome: 'Objeto' },
      convenioNumero : {nome: 'Número Convênio' },
      municipio      : {nome: 'Município'},
      uf             : {nome: 'UF'},
      dataConsulta   : {nome: 'Data Consulta', fn: this.utils.formataData},
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
      this.dataCEIS = this.data.filter(dado => dado.fonte === 'CEIS');

      // Consultas a API da Transparencia
      this.dataAcordoLeniencia = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo === 'acordo_leniencia');
      this.dataCNEP = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo.toUpperCase() === 'CNEP');
      this.dataCEPIM = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo.toUpperCase() === 'CEPIM');
      this.dataCEIST = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo.toUpperCase() === 'CEIS');

      // Consultas ao TCU
      this.dataProcessoTCU = this.data.filter(dado => dado.fonte === 'tcu' && dado.tipo === 'processo');

      this.dataCondenacaoTCU = this.data
        .filter(dado => dado.fonte === 'tcu' && dado.tipo === 'condenacao')
        .map((dado, idx) => Object.assign(dado, {key: idx}));

      this.dataAcordaoTCU = this.data
        .filter(dado => dado.fonte === 'tcu' && dado.tipo === 'acordao')
        .map((dado, idx) => Object.assign(dado, {key: idx}));
    }
}
