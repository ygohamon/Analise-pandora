import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ExportService } from 'src/app/services/common/export.service';
import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-pessoa-prontuario-dataview',
  templateUrl: './pessoa.prontuario.dataview.component.html',
  styleUrls: ['./prontuario.component.css'],
})
export class PessoaProntuarioDataViewComponent implements OnInit {

  @Input() prontuarios;
  @Input() exportFilename;
  @Output() dataChange = new EventEmitter();

  alvo;
  mapaOptions;
  mapaOverlays;
  endereco;

  lat
  lng

  msgRegistroNaoEncontrado: string;
  colunasTabela;

  dicionarioProntuario = {
    nome:        { nome: 'Nome' },
    data:        { nome: 'Data de Nascimento' },
    cpf:         { nome: 'CPF' },
    rg:          { nome: 'RG' },
    orgao:       { nome: 'Orgão de Expedição' },
    pai:         { nome: 'Nome do Pai' },
    mae:         { nome: 'Nome da Mãe' },
    enderecos:   { nome: 'Endereços' },
    vulgo:       { nome: 'Vulgo' },
    comparsas:   { nome: 'Comparsas' },
    faccao:      { nome: 'Facção' },
    atividade:   { nome: 'Principal Atividade' },
    cidade:      { nome: 'Cidade' },
    cabelo:      { nome: 'Cabelo' },
    olhos:       { nome: 'Olhos' },
    cutis:       { nome: 'Cutis' },
    barba:       { nome: 'Barba' },
    cicatriz:    { nome: 'Cicatriz' },
    tatuagem:    { nome: 'Tatuagem' },
    updated_at:  { nome: 'Última atualização' },
    naturalidade:{ nome: 'Naturalidade' },
    sexo:        { nome: 'Sexo' },
    conjuge:     { nome: 'Conjuge' },
    profissao:   { nome: 'Profissão' },
    falecido:    { nome: 'Falecido' },
    idade:       { nome: 'Idade' },
    imagens:     { nome: 'Imagens' },
    info:        { nome: 'Informações Adicionais' },
  }

  constructor(
    public utils: UtilsService,
    private sanitizer: DomSanitizer,
    public exporta: ExportService,
  ) { }

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;

    this.colunasTabela = Object.keys(this.dicionarioProntuario).map(d => { return { field: d, header: this.dicionarioProntuario[d].nome } });
    this.setaGeoCoordenadas();
  }

  exportPdf() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.pdf` : 'export.pdf';

    const fn = (doc) => {
      doc.setFontSize(18);
      doc.text('Informações do Prontuario', 14, 22);
    }

    this.exporta.exportPdf(this.colunasTabela, this.prontuarios, filename, fn, 35);
  }

  exportExcel() {
    const filename = (this.exportFilename) ? `${this.exportFilename}.xlsx` : 'export.xlsx';
    this.exporta.exportExcel(this.prontuarios, filename);
  }

  sanitize(img: string) {
    const url = `data:image/png;base64,${img}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  setaGeoCoordenadas() {
    const lat = this.utils.first(this.utils.first(this.prontuarios.map(d => d.lat)))
    const lng = this.utils.first(this.utils.first(this.prontuarios.map(d => d.lng)))

    const alvo = { lat: parseFloat(lat), lng: parseFloat(lng) };

    const localizacao = new google.maps.Marker({
      position: alvo,
      title: 'Localização',
    });

    const geo = [{lat: lat, lng: lng}];

    this.mapaOptions = { center: alvo, zoom: 16 };
    this.mapaOverlays = [localizacao].concat(
      geo.map((d) => {
          return new google.maps.Marker({
            position: { lat: parseFloat(d.lat), lng: parseFloat(d.lng) },
          });
        })
    );
  }

}
