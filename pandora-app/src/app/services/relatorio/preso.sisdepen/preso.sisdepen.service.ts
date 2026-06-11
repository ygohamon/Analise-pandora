import { Injectable } from '@angular/core';

import { AuthService } from './../../auth/auth.service';
import { UtilsService } from './../../common/utils.service';

import { logo_mp, RelatorioUtilsService } from './../relatorio.utils';

@Injectable()
export class RelatorioPresoSisdepenService {

  valorProtocolo;

  constructor(private auth: AuthService,
              private rutils: RelatorioUtilsService,
              private utils: UtilsService) {}

  private criaCabecalho(protocolo, grupo = null) {
    return [
      { image: logo_mp, alignment: 'center', width: 100 },
      { text: 'MINISTÉRIO PÚBLICO DA PARAÍBA', style: 'header' },
      { text: 'PROCURADORIA-GERAL DE JUSTIÇA', style: 'header' },
      { text: 'NÚCLEO DE GESTÃO DO CONHECIMENTO E SEGURANÇA INSTITUCIONAL', style: 'subheader' },

        { text: '\n\nRelatório do Custodiado\n', style: 'secao' },
        {
            style: 'painel',
            table: {
                widths: [100, '*'],
                body: this.rutils.formataPainel([
                    ['Solicitante:', (grupo) ? this.auth.getGrupo() : this.auth.getNome()],
                    ['Data:', this.utils.formataData(new Date(), 'DD [de] MMMM [de] YYYY')],
                    (this.utils.getProcesso()) ? ['Processo:', this.utils.getProcesso()] : null,
                    ['Protocolo:', protocolo],
                ].filter(linha => linha !== null))
            },
            layout: this.rutils.layout
        }];
  }

  private criaCorpo(dados) {
      if (!dados || dados.length === 0) { return null; }

      return [
      {
          style: 'tabela',
          table: {
              widths: ['auto', '*'],
              body: this.criaTabela(dados)
          },
          layout: this.rutils.layout
      }];
  }

  private criaTabela(dados) {

    return [
        ['Foto:', (dados.foto) ? {
            image: `data:image/png;base64,${dados.foto}`,
            width: 80
        }: ''],
        ['Nome:', (dados.nome) ? dados.nome : ''],
        ['Nome Apresentação:', (dados.nomeApresentacao) ? dados.nomeApresentacao : ''],
        ['Nome Social:', (dados.nomeSocial) ? dados.nomeSocial : ''],
        ['CPF:', (dados.cpf) ? this.utils.formataDado(dados.cpf, '###.###.###-##') : ''],
        ['CNC:', (dados.cnc) ? this.utils.formataDado(dados.cnc, '############-##') : ''],
        ['Vulgo:', (dados.vulgo) ? dados.vulgo : ''],
        ['Naturalidade:', (dados.naturalidade) ? dados.naturalidade : ''],
        ['Naturalidade UF:', (dados.naturalidadeUF) ? dados.naturalidadeUF : ''],
        ['Nacionalidade:', (dados.nacionalidade) ? dados.nacionalidade : ''],
        ['RG:', (dados.rg) ? `${dados.rg} ${dados.rgOrgaoEmissor}/${dados.rgUf}` : ''],
        ['Data Expedição:', (dados.rgDataExpedicao) ? dados.rgDataExpedicao : ''],
        ['Cadeia:', (dados.cadeia) ? dados.cadeia : ''],
        ['Cadeia UF:', (dados.cadeiaUF) ? dados.cadeiaUF : ''],
        ['Cadeia Âmbito:', (dados.cadeiaAmbito) ? dados.cadeiaAmbito : ''],
        ['Situação:', (dados.situacao) ? dados.situacao : ''],
        ['Recolhimento:', (dados.tipoRecolhimento) ? dados.tipoRecolhimento : ''],
        ['Regime:', (dados.regimePrisional) ? dados.regimePrisional : ''],
        ['Tipificação:', (dados.tipificacao) ? dados.tipificacao : ''],
        ['Data Informação:', (dados.rg) ? this.utils.formataData(dados.dataInformacao) : ''],
        ['Fonte:', 'SISDEPEN'],
    ];
  }

  relatorioPresoDetalhadoSisdepen(dados, grupo = null, filename, url) {
    this.valorProtocolo = btoa(`user:${this.auth.getId()}data:${(new Date()).toISOString()}`);

    const doc = {
        content: [
            this.criaCabecalho(this.valorProtocolo, grupo),
            this.criaCorpo(dados),
            this.rutils.criaRodape(url)
        ],
        styles: this.rutils.styles
    };

    this.rutils.criaPdf(doc, filename);
  }
}
