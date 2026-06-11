import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from '../../../common/utils.service';
import { RelatorioUtilsService } from '../../relatorio.utils';

@Injectable()
export class RelatorioSecaoParentescosService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaTabelaParentescos (parentescos) {
    const headerTabela = [['Relação', 'CPF', 'Nome', 'Sexo', 'Idade', 'Município', 'UF']];
    const corpoTabela = parentescos.map(parentesco => {
      return [
        (parentesco.categoria)      ? parentesco.categoria : '',
        (parentesco.cpf)            ? this.utils.formataDado(parentesco.cpf, '###.###.###-##') : '',
        (parentesco.nome)           ? parentesco.nome : '',
        (parentesco.sexo)           ? parentesco.sexo : '',
        (parentesco.idade)          ? parentesco.idade : '',
        // (parentesco.dataNascimento) ? this.utils.formataData(parentesco.dataNascimento) : '',
        (parentesco.municipio)      ? parentesco.municipio : '',
        (parentesco.uf)             ? parentesco.uf : '',
      ];
    });

    return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoParentescos (parentescos) {
    if (!parentescos || parentescos.length === 0) { return null; }

    return [{ text: '\nParentescos\n', style: 'secao' },
    {
      style: 'tabela',
      table: {
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: this.criaTabelaParentescos(parentescos)
      },
      layout: this.relatorio.layout
    }];
  }
}
