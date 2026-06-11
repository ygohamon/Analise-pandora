import { Component, OnInit, OnDestroy, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from 'src/app/services/common/utils.service';
import { PesquisaProntuarioService } from 'src/app/services/pesquisa/pesquisa.prontuario.service';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { ExportService } from 'src/app/services/common/export.service';

@Component({
    selector: 'app-prontuario',
    templateUrl: './prontuario.component.html',
    styleUrls: ['./prontuario.component.css'],
})
export class ProntuarioComponent implements OnInit, OnDestroy {

    constructor(
        private pesquisa: PesquisaProntuarioService,
        private message: MessageService,
        public utils: UtilsService,
        private sanitizer: DomSanitizer,
        public exporta: ExportService,
    ) {}

    private _destroy$ = new Subject();

    buscaSucesso = false;
    buscaFinalizada = false;
    nProcesso: string;


    alvo;
    mapaOptions;
    mapaOverlays;

    // Resultado da consulta
    prontuariosEncontrados;

    @Output() dataChange = new EventEmitter();
    @Input() exportFilename;


    msgRegistroNaoEncontrado: string;
    colunasTabela;

    // tslint:disable-next-line: member-ordering
    dicionarioProntuario = {
        nome                          : {nome : 'Nome'},
        data                          : {nome : 'Data de Nascimento'},
        cpf                           : {nome : 'CPF'},
        rg                            : {nome : 'RG'},
        orgao                         : {nome : 'Orgão de Expedição'},
        pai                           : {nome : 'Nome Pai'},
        mae                           : {nome : 'Nome Mãe'},
        enderecos                     : {nome : 'Endereços'},
        vulgo                         : {nome : 'Vulgo'},
        comparsas                     : {nome : 'Comparsas'},
        faccao                        : {nome : 'Facção'},
        atividade                     : {nome : 'Principal Atividade'},
        cidade                        : {nome : 'Cidade'},
        cabelo                        : {nome : 'Cabelo'},
        olhos                         : {nome : 'Olhos'},
        cutis                         : {nome : 'Cutis'},
        barba                         : {nome : 'Barba'},
        cicatriz                      : {nome : 'Cicatriz'},
        tatuagem                      : {nome : 'Tatuagem'},
        updated_at                    : {nome : 'Ultima atualização'},
        naturalidade                  : {nome : 'Naturalidade'},
        sexo                          : {nome : 'Sexo'},
        conjuge                       : {nome : 'Conjuge'},
        profissao                     : {nome : 'Profissão'},
        falecido                      : {nome : 'Falecido'},
        idade                         : {nome : 'Idade'},
        imagens                       : {nome : 'Imagens'},
        info                          : {nome : 'Informações Adicionais'},
    }

    campos = [
        { id: 'fCPF',       nome: 'CPF' },
        { id: 'fNome',      nome: 'Nome' },
        { id: 'fRG',        nome: 'RG'},
        { id: 'fAlcunha',   nome: 'Alcunha'}
    ];

    sanitize(img: string) {
      const url = `data:image/png;base64,${img}`;
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    exportPdf() {
        const filename = (this.exportFilename) ? `${this.exportFilename}.pdf` : 'export.pdf';
        const fn = (doc) => {
          doc.setFontSize(18);
          doc.text('Registro do Prontuário', 14, 22);
        }
        this.exporta.exportPdf(this.colunasTabela, this.prontuariosEncontrados, filename, fn, 35);
    }

    exportExcel() {
        const filename = (this.exportFilename) ? `${this.exportFilename}.xlsx` : 'export.xlsx';
        this.exporta.exportExcel(this.prontuariosEncontrados, filename);
    }

    ngOnInit() {
        this.nProcesso = this.utils.getProcesso();
        this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

        // this.prontuariosEncontrados.map((d, i) => Object.assign(d, { id: i }))

        // tslint:disable-next-line: max-line-length
        this.colunasTabela = Object.keys(this.dicionarioProntuario).map(d => { return { field: d, header: this.dicionarioProntuario[d].nome }});
    }

    ngOnDestroy() {
        this.resetaComponente();
        this._destroy$.next();
        this._destroy$.complete();
    }

    resetaComponente() {
        this.buscaSucesso = false;
        this.buscaFinalizada = false;
        this.prontuariosEncontrados = null;
    }

    onPesquisa(pesquisaForm: FormGroup) {
        this.resetaComponente();

        const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
        if (!invalido) {
            this.chamaService(pesquisaForm.value)
                .pipe(takeUntil(this._destroy$))
                .subscribe(resultado => {
                    const { status, msg, dados } = resultado;
                    this.buscaFinalizada = true;
                    if (status === 'OK') {
                        this.buscaSucesso = true;
                        this.prontuariosEncontrados = dados;

                        this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
                    } else {
                        this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
                    }
                },
                    error => {
                        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
                    });
        } else {
            this.message.add(invalido[0]);
        }
    }

    // setaGeoCoordenadas() {
    //     const alvo = { lat: parseFloat(this.prontuariosEncontrados.lat), lng: parseFloat(this.prontuariosEncontrados.lng) };

    //     const localizacao = new google.maps.Marker({
    //       position: alvo,
    //       title: 'Localização',
    //     });

    //     this.mapaOptions = { center: alvo, zoom: 16 };
    //     this.mapaOverlays = [localizacao].concat(
    //         this.prontuariosEncontrados.map((d) => {
    //           return new google.maps.Marker({
    //             position: { lat: parseFloat(d.lat), lng: parseFloat(d.lng) },
    //             title: d.logradouro,
    //           });
    //         })
    //     );
    //   }

    /**
     *
     * @param dados
     */
    chamaService(dados) {
        if (dados.fCPF) {
            return this.pesquisa.pesquisaProntuarioCPF(this.utils.checaCPF(dados.fCPF));
        } else if (dados.fNome) {
            return this.pesquisa.pesquisaProntuarioNome(dados.fNome);
        } else if (dados.fRG) {
            return this.pesquisa.pesquisaProntuarioRG(dados.fRG);
        } else if (dados.fAlcunha) {
            return this.pesquisa.pesquisaProntuarioAlcunha(dados.fAlcunha);
        } else {
            this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
            return null;
        }
    }

}
