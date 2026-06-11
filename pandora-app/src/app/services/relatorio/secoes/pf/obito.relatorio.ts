import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../../relatorio.utils';
import { UtilsService } from './../../../common/utils.service';

@Injectable()
export class RelatorioSecaoObitoService {

    constructor(private utils: UtilsService,
            private relatorio: RelatorioUtilsService) { }

    criaSecaoObitos(registros) {
        if (!registros || registros.length === 0) { return null; }

        const ordemAtributos = [
            'obito_cnpjServentia', 'obito_nomeFantasia', 'obito_razaoSocial', 'obito_endereco', 'obito_numero',
            'obito_complemento','obito_bairro','obito_municipioServentia','obito_ufServentia', 'obito_cep',
            'obito_distrito','obito_subDistrito','obito_site','obito_emailServentia', 'obito_numeroTelefonePrincipal',
            'linha_vazia',

            'obito_livro', 'obito_folha', 'obito_termo', 'obito_dataObito','obito_matricula',
            'linha_vazia',

            'obito_nome', 'obito_cpf', 'obito_nomeMae', 'obito_nomePai', 'obito_dataNascimento',
        ];
 
        return [
            { text: 'Registros Encontrados de Óbito', style: 'secao' },
            this.relatorio.criaPainel(registros, ordemAtributos)
        ];
    }

    criaTabelaResumidaObitos(registros) {
        const headerTabela = [['Nome', 'CPF', 'Data de Nascimento', 'Data de Óbito', 'Cartório - Município', 'Cartório - UF']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.obito_nome)           ? registro.obito_nome : '',
                (registro.obito_cpf)            ? this.utils.formataDado(registro.obito_cpf, '###.###.##-##') : '',
                (registro.obito_dataNascimento) ? this.utils.formataData(registro.obito_dataNascimento) : '',
                (registro.obito_dataObito)      ? this.utils.formataData(registro.obito_dataObito) : '',
                (registro.obito_municipioServentia)   ? registro.obito_municipioServentia : '',
                (registro.obito_ufServentia)          ? registro.obito_ufServentia : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoResumidaObitos(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [{ text: 'Registro de Óbito', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto' ],
                body: this.criaTabelaResumidaObitos(registros)
            },
            layout: this.relatorio.layout
        }];
    }
}
