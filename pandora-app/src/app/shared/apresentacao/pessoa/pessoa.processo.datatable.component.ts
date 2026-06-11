import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-processo-datatable',
    templateUrl: './pessoa.processo.datatable.component.html'
})
export class PessoaProcessoDatatableComponent implements OnChanges {

    @Input() data;
    @Output() dataChange = new EventEmitter();

    msgRegistroNaoEncontrado: string;

    dataProcessoTJPB;
    dataProcesso;
    dataProgressaoPena;
    dataTREPB;
    dataTRF5;
    dataCEIS;
    dataCadicon;
    dataCEI;
    dataCNEP;
    dataCEAF;
    dataCEIST; // CEIS da Transparência

    dataCondenacaoTCU;
    dataProcessoTCU;
    dataAcordaoTCU;

    dicionarioDadosTJPB = {
      numero           : {nome: 'Número'},
      numeroAntigo     : {nome: 'Número Antigo'},
      classe           : {nome: 'Classe'},
      unidadeJudiciaria: {nome: 'Unidade Judiciária'},
      assunto          : {nome: 'Assunto'},
      dataDistribuicao : {nome: 'Distribuição'},
      sigilo           : {nome: 'Sigilo'},
      status           : {nome: 'Status'},
      transitouJulgado : {nome: 'Transitou Julgado'},
      valorAcao        : {nome: 'Valor Ação'},
      sistema          : {nome: 'Sistema'},
    }

    dicionarioDadosVEP = {
      numeroProcesso          : {nome: 'Número Processo'},
      dataRecebimento         : {nome: 'Dt Recebimento', fn: this.utils.formataData},
      dataArquivamento        : {nome: 'Dt Arquivamento', fn: this.utils.formataData},
      status                  : {nome: 'Status'},
      prioridade              : {nome: 'Prioridade'},
      segredoJustica          : {nome: 'Segredo'},
      numeroProcessoUnificado : {nome: 'Num. Proc. Unificado'},
      numeroProcessoDependente: {nome: 'Num. Proc. Dependente'},
    }

    dicionarioDadosPP = {
      numeroProcesso: {nome: 'Número Processo'},
      dataInicioPena: {nome: 'Dt Início Pena', fn: this.utils.formataData},
      dataFimPena   : {nome: 'Dt Fim Pena', fn: this.utils.formataData},
      status        : {nome: 'Status'},
      penaACumprir  : {nome: 'A Cumprir'},
      totalPena     : {nome: 'Total'},
      situacaoPenal : {nome: 'Situação Penal'},
      dataSituacao  : {nome: 'Dt Situação', fn: this.utils.formataData},
    }

    dicionarioDados_TCEPB = {
      processo          : {nome: 'Processo'},
      jurisdicionado    : {nome: 'Jurisdicionado'},
      dataJulgamento    : {nome: 'Data Julgamento', fn: this.utils.formataData},
      decisao           : {nome: 'Decisão'},
      decisaoLegislativo: {nome: 'Decisão Legislativo'},
    }

    dicionarioDados_TRF5 = {
      processo      : {nome: 'Processo'},
      dataProcesso  : {nome: 'Data Processo', fn: this.utils.formataData},
      dataJulgamento: {nome: 'Data Julgamento', fn: this.utils.formataData},
      resultado     : {nome: 'Decisão'},
      decisao       : {nome: 'Observação'},
    }

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

    dicionarioDadosCadicon = {
      siglaTribunal       : {nome: 'Tribunal'},
      colegiado           : {nome: 'Colegiado'},
      dataTransitoJulgado : {nome: 'Trânsito Julgado', fn: this.utils.formataData},
      acordao             : {nome: 'Acórdão'},
      processo            : {nome: 'Processo'},
      vDebito             : {nome: 'Valor Débito'},
      vMulta              : {nome: 'Valor Multa'},
    }

    dicionarioDadosCEI = {
      deliberacoes        : {nome: 'Deliberações'},
      processo            : {nome: 'Processo'},
      municipio           : {nome: 'Município'},
      uf                  : {nome: 'UF'},
      dataTransitoJulgado : {nome: 'Trânsito Julgado', fn: this.utils.formataData},
      dataFinal           : {nome: 'Data Final', fn: this.utils.formataData},
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

    dicionarioDadosCEAF = {
      dataReferencia        : {nome: 'Data Referência', fn: this.utils.formataData},
      dataPublicacao        : {nome: 'Data Publicação', fn: this.utils.formataData},
      processo              : {nome: 'Processo'},
      tipoSancao            : {nome: 'Tipo' },
      orgaoLotacao          : {nome: 'Órgão' },
      ufLotacao             : {nome: 'UF - Órgão' },
      cargo                 : {nome: 'Cargo Efetivo' },
      cargoComissao         : {nome: 'Cargo Comissão' },
      fundamentacao         : {nome: 'Fundamentação' },
      municipio             : {nome: 'Município'},
      uf                    : {nome: 'UF'},
    }

    constructor(
      public utils: UtilsService,
      private auth: AuthService
    ) {}

    ngOnChanges() {
      this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

      this.dataProcessoTJPB   = this.onRemoveProcessoSigilososTJPB(this.data.filter(dado => dado.tipo === 'processo_tjpb'));
      this.dataProcesso       = this.data.filter(dado => dado.tipo === 'processo');
      this.dataProgressaoPena = this.data.filter(dado => dado.tipo === 'progressaopena');
      this.dataTREPB          = this.data.filter(dado => dado.fonte === 'trepb');
      this.dataTRF5           = this.data.filter(dado => dado.fonte === 'trf5');
      this.dataCEIS           = this.data.filter(dado => dado.fonte === 'CEIS');
      this.dataCadicon        = this.data.filter(dado => dado.fonte === 'CADICON');
      this.dataCEI            = this.data.filter(dado => dado.fonte === 'CEI');

      this.dataCNEP  = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo.toUpperCase() === 'CNEP');
      this.dataCEAF  = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo.toUpperCase() === 'CEAF');
      this.dataCEIST = this.data.filter(dado => dado.fonte === 'transparencia' && dado.tipo.toUpperCase() === 'CEIS');

      this.dataProcessoTCU = this.data.filter(dado => dado.fonte === 'tcu' && dado.tipo === 'processo');
      this.dataCondenacaoTCU = this.data
        .filter(dado => dado.fonte === 'tcu' && dado.tipo === 'condenacao')
        .map((dado, idx) => Object.assign(dado, {key: idx}));
      this.dataAcordaoTCU = this.data
        .filter(dado => dado.fonte === 'tcu' && dado.tipo === 'acordao')
        .map((dado, idx) => Object.assign(dado, {key: idx}));
    }

    /**
     * Valida se o usuário autenticado é do GAECO para não exibir processos sigilosos
     * para usuários fora deste grupo
     * @param dataProcessoTJPB
     * @returns
     */
     onRemoveProcessoSigilososTJPB(dataProcessoTJPB) {

      if (this.auth.getGrupos().includes('GAECO')) {
        return dataProcessoTJPB;
      }

      return  dataProcessoTJPB.filter(dado => dado.sigilo === false);
    }
}
