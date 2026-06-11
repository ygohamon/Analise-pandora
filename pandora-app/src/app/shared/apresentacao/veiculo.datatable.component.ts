import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Component, Input, OnChanges } from '@angular/core';
import { uniq, uniqBy } from 'lodash-es';

import { UtilsService } from '../../services/common/utils.service';

@Component({
  selector: 'app-veiculo-datatable',
  templateUrl: './veiculo.datatable.component.html'
})
export class VeiculoDatatableComponent implements OnChanges {

  @Input() veiculos;

  dadosCompleto;
  dadosHistorico;


  // Colunas para a tabela
  dicionarioDadosCompleto = {
    placa          : { nome: 'Placa' },
    marcaModelo    : { nome: 'Modelo' },
    cor            : { nome: 'Cor' },
    anoFab         : { nome: 'Fabricado' },
    anoMod         : { nome: 'Ano Modelo' },
    anoRegistro    : { nome: 'Data do Registro' },
    fonte          : { nome: 'Fonte'},
  }

  dicionarioDadosExpandCompleto = {
    chassi                : { nome: 'Chassi' },
    renavam               : { nome: 'RENAVAM' },
    municipio             : { nome: 'Município' },
    uf                    : { nome: 'UF' },
    situacao              : { nome: 'Situação' },
    tipo                  : { nome: 'Tipo' },
    cor                   : { nome: 'Cor' },
    especie               : { nome: 'Espécie' },
    combustivel           : { nome: 'Combustível' },
    responsavel           : { nome: 'Responsável' },
    cpf_cnpjResponsavel   : { nome: 'Documento Responsável' },
    restricao_1           : { nome: 'Restrição' },
    restricao_2           : { nome: 'Restrição' },
    restricao_3           : { nome: 'Restrição' },
    restricao_4           : { nome: 'Restrição' },
    restricaoJud          : { nome: 'Restrição RenaJUD' },
    valor                 : { nome: 'Valor',                      /* fnRow : (d) => `R$: ${d.valor} - Referência: ${d.valorReferencia}` */ },
    dataInicioPosse       : { nome: 'Data de Posse/Emplacamento', fn: this.utils.formataData },
    dataFinalPosse        : { nome: 'Data Final de Posse', fn: this.utils.formataData },
    dataAtualizacao       : { nome: 'Data de Atualização',        fn: this.utils.formataData },

    proprietario          : { nome: 'Proprietario',              /*  fnRow: (proprietario) => `${proprietario.proprietario.nomeProprietario}` */},
    possuidor             : { nome: 'Possuidor',                  /* fnRow: (possuidor) => `${possuidor.possuidor.nomePossuidor}` */},


    // anoBO                 : { nome: 'Ano do BO'},
    // dataOcorrencia        : { nome: 'Data Ocorrencia',            fn: this.utils.formataData },
    // dddContato            : { nome: 'Numero de Contato'},
    // historico             : { nome: 'Historico'},
    // municipioBO           : { nome: 'Municipio do BO'},
    // ufBO                  : { nome: 'UF do BO'},
    // naturezaOcorrencia    : { nome: 'Natureza da Ocorrencia'},
    // nomeDeclarante        : { nome: 'Declarante'},
    // numeroBO              : { nome: 'Numero do BO'},
    // ramalContato          : { nome: 'Ramal do Contato'},
    // sistema               : { nome: 'Sistema'},
    // telefoneContato       : { nome: 'Telefone'},
    // unidadePolicial       : { nome: 'Unidade da Policia'},
  }



  completoPlaca;
  completoModelos;
  completoCores;
  completoFabricacao;
  completoModelo;
  completoRegistro;
  completoFonte;

    constructor(public utils: UtilsService) {}

    ngOnChanges() {

      this.dadosCompleto        = this.veiculos.map((dado, idx) => Object.assign(dado, {id: idx}));

      // Para o filtro
      this.completoPlaca        = uniqBy(this.dadosCompleto.map(d => { return { label: d.placa,       value: d.placa        } }), 'value');
      this.completoModelos      = uniqBy(this.dadosCompleto.map(d => { return { label: d.marcaModelo, value: d.marcaModelo  } }), 'value');
      this.completoCores        = uniqBy(this.dadosCompleto.map(d => { return { label: d.cor,         value: d.cor          } }), 'value');
      this.completoFabricacao   = uniqBy(this.dadosCompleto.map(d => { return { label: d.anoFab,      value: d.anoFab       } }), 'value');
      this.completoModelo       = uniqBy(this.dadosCompleto.map(d => { return { label: d.anoMod,      value: d.anoMod       } }), 'value');
      this.completoRegistro     = uniqBy(this.dadosCompleto.map(d => { return { label: d.anoRegistro, value: d.anoRegistro  } }), 'value');
      this.completoFonte        = uniqBy(this.dadosCompleto.map(d => { return { label: d.fonte,       value: d.fonte,       } }), 'value');
    }

    fixPeriodo(periodo) {
      return uniq(periodo.split('-')).sort().join('-');
    }
}
