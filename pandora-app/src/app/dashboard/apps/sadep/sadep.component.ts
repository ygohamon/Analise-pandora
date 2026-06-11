import { Component, OnDestroy, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UtilsService } from "../../../services/common/utils.service";
import { SadepService } from "./sadep.service";
import { countBy, uniqWith, isEqual, orderBy } from "lodash-es";

@Component({
  selector: 'app-sadep',
  templateUrl: 'sadep.component.html'
})
export class SadepComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  msgRegistroNaoEncontrado : string;
  ufSelecionado            : string = 'PB';
  ufs                      : Object;
  dadosDetalhamento        : Object;

  mandadosList             : boolean = false;
  detalhaMandado           : boolean = false;
  totalizadores            : boolean = false;

  mandados                 : Object;
  totalizadoresCrimes      : Object;
  anosEmprego              : Object;
  municipios               : Object;

  opcoesOrgaos             : Object;
  opcoesCrimes             : Object;

  // Colunas da tabela
  cols = [
    { field: 'cpf',             header: 'CPF'   },
    { field: 'nome',            header: 'Nome'  },
    { field: 'crime',           header: 'Crime' },
    { field: 'municipio',       header: 'Município'},
    { field: 'orgao_expedidor', header: 'Órgão Expeditor' }
  ];

  dicionarioDados = {
    cpf:                   { nome: 'CPF' },
    nome:                  { nome: 'Nome' },
    crime:                 { nome: 'Crime' },
    municipio:             { nome: 'Município' },
    orgao_expedidor:       { nome: 'Órgão Expeditor' }
  }

  constructor(
    private sadepService: SadepService,
    private messages: MessageService,
    public utils: UtilsService,
  ) {}

  ngOnInit(): void {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.detalhaMandado           = false;
    this.ufs                      = this.utils.opcoesUF.map(
      ufs => Object.assign({
        value: ufs.value,
        label: ufs.descricao.toUpperCase()
      })
    );

    this.buscaMandadosEmAbertoPorUF();
  }

  ngOnDestroy(): void {
    this.mandadosList   = false;
    this.detalhaMandado = false;
    this.mandados       = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaBusca() {
    this.mandadosList   = false;
    this.detalhaMandado = false;
    this.mandados       = null;
    this.buscaMandadosEmAbertoPorUF();
  }

  buscaMandadosEmAbertoPorUF() {
    this.messages.add(this.utils.mensagemInfo('Aguarde!', `Buscando mandados de prisão em aberto para ${this.ufSelecionado}.`));

    this.sadepService.getMandadosEmAbertoPorUF(this.ufSelecionado)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.mandados = Object.assign(dados.filter(r => Object.keys(r).shift() === 'sadep')).shift().sadep.map((dado, idx) => Object.assign(dado, {id: idx}));

          this.opcoesOrgaos = uniqWith(Object.assign(this.mandados).map(m => { return { label: m.orgao_expedidor, value: m.orgao_expedidor }}), isEqual);
          this.opcoesCrimes = uniqWith(Object.assign(this.mandados).map(m => { return { label: m.crime, value: m.crime } }), isEqual);
          this.anosEmprego  = orderBy(uniqWith(Object.assign(this.mandados).map(m => { return { label: m.ano_emprego, value: m.ano_emprego}}), isEqual), 'value', 'desc');
          this.municipios   = orderBy(uniqWith(Object.assign(this.mandados).map(m => { return { label: m.municipio, value: m.municipio}}), isEqual), 'value', 'asc');
          this.totalizadoresCrimes = countBy(Object.assign(this.mandados).map(m => m.crime));

          this.mandadosList = true;
          this.totalizadores = true;
          this.messages.add(this.utils.mensagemSucesso('Sucesso!', 'Pesquisa concluída com sucesso!'));
        } else {
          this.messages.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.messages.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  onDetalhar(mandado) {

    this.sadepService.getDetalhamentoParadeiros(mandado.cpf)
    .pipe(takeUntil(this._destroy$))
    .subscribe(resultado => {
      let { status, msg, dados } = resultado;

      if (status === 'OK') {
        this.dadosDetalhamento = dados;
        this.detalhaMandado = true;
        this.mandadosList   = false;
        this.totalizadores  = false;
        }
      });
  }

  buscaPorOutraUF() {
    this.resetaBusca();
  }
}
