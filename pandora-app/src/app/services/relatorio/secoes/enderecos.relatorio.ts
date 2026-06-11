import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';

@Injectable()
export class RelatorioSecaoEnderecosService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaTabelaEnderecos (enderecos) {
        const headerTabela = [['Logradouro', 'Número', 'Comp.', 'Bairro', 'CEP', 'Município', 'UF']];
        const corpoTabela = enderecos.map(endereco => {
            return [
                (endereco.logradouro)   ? endereco.logradouro : '',
                (endereco.numero)       ? endereco.numero : '',
                (endereco.complemento)  ? endereco.complemento : '',
                (endereco.bairro)       ? endereco.bairro : '',
                (endereco.cep)          ? endereco.cep : '',
                (endereco.municipio)    ? endereco.municipio : '',
                (endereco.uf)           ? endereco.uf : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoEnderecos (enderecos) {
        if (!enderecos || enderecos.length === 0) { return null; }

        return [{ text: 'Endereços', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: this.criaTabelaEnderecos(enderecos)
            },
            layout: this.relatorio.layout
        }];
    }
}
