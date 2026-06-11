import { Injectable, Inject } from '@angular/core';

import * as dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import * as utc from 'dayjs/plugin/utc'
import * as customParse from 'dayjs/plugin/customParseFormat'

dayjs.locale('pt-br')
dayjs.extend(utc)
dayjs.extend(customParse)

import {isArray} from 'lodash-es';

import { DeviceDetectorService } from 'ngx-device-detector';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class UtilsService {

  opcoesUF = [
    {label: 'AC', value: 'AC', descricao: 'Acre'},
    {label: 'AL', value: 'AL', descricao: 'Alagoas'},
    {label: 'AP', value: 'AP', descricao: 'Amapá'},
    {label: 'AM', value: 'AM', descricao: 'Amazonas'},
    {label: 'BA', value: 'BA', descricao: 'Bahia'},
    {label: 'CE', value: 'CE', descricao: 'Ceará'},
    {label: 'DF', value: 'DF', descricao: 'Distrito Federal'},
    {label: 'ES', value: 'ES', descricao: 'Espirito Santo'},
    {label: 'GO', value: 'GO', descricao: 'Góias'},
    {label: 'MA', value: 'MA', descricao: 'Maranhão'},
    {label: 'MT', value: 'MT', descricao: 'Mato Grosso'},
    {label: 'MS', value: 'MS', descricao: 'Mato Grosso do Sul'},
    {label: 'MG', value: 'MG', descricao: 'Minas Gerais'},
    {label: 'PA', value: 'PA', descricao: 'Pará'},
    {label: 'PB', value: 'PB', descricao: 'Paraíba'},
    {label: 'PR', value: 'PR', descricao: 'Paraná'},
    {label: 'PE', value: 'PE', descricao: 'Pernambuco'},
    {label: 'PI', value: 'PI', descricao: 'Piauí'},
    {label: 'RJ', value: 'RJ', descricao: 'Rio de Janeiro'},
    {label: 'RN', value: 'RN', descricao: 'Rio Grande do Norte'},
    {label: 'RS', value: 'RS', descricao: 'Rio Grande do Sul'},
    {label: 'RO', value: 'RO', descricao: 'Rondônia'},
    {label: 'RR', value: 'RR', descricao: 'Roraima'},
    {label: 'SC', value: 'SC', descricao: 'Santa Catarina'},
    {label: 'SP', value: 'SP', descricao: 'São Paulo'},
    {label: 'SE', value: 'SE', descricao: 'Sergipe'},
    {label: 'TO', value: 'TO', descricao: 'Tocantins'}
  ];

  mapeamentoTipologiaPJ = {
    't2': 'PJ COM UM EMPREGADO NA RAIS',
    't3': 'PJ SEM EMPREGADOS NA RAIS',
    't4': 'PJ QUE NUNCA DECLAROU RAIS',
    't5': 'PJ COM SITUAÇÃO SUSPENSA NA SRFB',
    't6': 'PJ COM SITUAÇÃO INAPTA NA SRFB',
    't7': 'PJ DECLARADA EM CAIXA POSTAL',
    't8': 'PJ COM EX-SÓCIO CANDIDATO POLÍTICO',
    't9': 'PJ COM EX-SÓCIO CANDIDATO POLÍTICO ELEITO',
    't10': 'PJ COM SÓCIO CANDIDATO POLÍTICO',
    't11': 'PJ COM SÓCIO CANDIDATO POLÍTICO ELEITO',
    //'t12': '-',
    't13': 'PJ COM EX-SÓCIO SERVIDOR EFETIVO',
    't14': 'PJ COM EX-SÓCIO SERVIDOR VÍNCULO POLÍTICO',
    //'t15': '-',
    't16': 'PJ COM SÓCIO SERVIDOR EFETIVO',
    't17': 'PJ COM SÓCIO SERVIDOR VÍNCULO POLÍTICO',
    't18': 'PJ COM 1 FATURAMENTO INCOMPATÍVEL',
    't19': 'PJ COM 2 FATURAMENTOS INCOMPATÍVEIS',
    't20': 'PJ COM 3 FATURAMENTOS INCOMPATÍVEIS',
    't21': 'PJ COM 4 FATURAMENTOS INCOMPATÍVEIS',
    't22': 'PJ COM 5 FATURAMENTOS INCOMPATÍVEIS',
    't23': 'PJ COM CAPITAL SOCIAL < 50000 E >= 10000',
    't24': 'PJ COM CAPITAL SOCIAL < 10000 E >= 5000',
    't25': 'PJ COM CAPITAL SOCIAL < 5000',
    't26': 'PJ CRIADA A MENOS DE 60 DIAS DO EMPENHO',
    't27': 'PJ CRIADA A MENOS DE 20 DIAS DO EMPENHO',
    't28': 'PJ CRIADA A MENOS DE 10 DIAS DO EMPENHO',
    't29': 'PJ CRIADA APÓS A DATA DO EMPENHO',
    't30': 'PJ ANTES SANCIONADA NO CNCIAI',
    't31': 'PJ SANCIONADA VIGENTE NO CNCIAI',
    't32': 'PJ SANCIONADA NO CNCIAI E COM DESPESA NO PERÍODO DE SANÇÃO',
    't33': 'PJ ANTES SANCIONADA NO CNEP',
    't34': 'PJ SANCIONADA VIGENTE NO CNEP',
    't35': 'PJ SANCIONADA NO CNEP E COM DESPESA NO PERÍODO DE SANÇÃO',
    't36': 'PJ ANTES SANCIONADA NO CEIS',
    't37': 'PJ SANCIONADA VIGENTE NO CEIS',
    't38': 'PJ SANCIONADA NO CEIS E COM DESPESA NO PERÍODO DE SANÇÃO',
    't39': 'PJ ANTES SANCIONADA NO CEPIM',
    't40': 'PJ COM SÓCIO EMPREGADO',
    't41': 'PJ COM SÓCIO EMPREGADO POR PJ CREDORA DE UJ',
    't42': 'PJ COM EX-SÓCIO EX-BENEFICIÁRIO DO BOLSA FAMÍLIA',
    't43': 'PJ COM EX-SÓCIO BENEFICIÁRIO DO BOLSA FAMÍLIA',
    't44': 'ENDEREÇO COM 2 PJS ATIVAS',
    't45': 'ENDEREÇO COM 3 A 5 PJS ATIVAS',
    't46': 'ENDEREÇO COM MAIS DE 5 PJS ATIVAS',
    't47': 'PJ COM 4 A 7 CNAES',
    't48': 'PJ COM 8 A 10 CNAES',
    't49': 'PJ COM MAIS DE 10 CNAES',
    't50': 'PJ COM DOAÇÕES ELEITORAIS ENTRE R$ 10.000,00 E R$ 0,01',
    't51': 'PJ COM DOAÇÕES ELEITORAIS ENTRE R$ 1.000.000 E R$ 10.000,01',
    't52': 'PJ COM DOAÇÕES ELEITORAIS ENTRE R$ 100.000.000 E R$ 1.000.000,01',
    't53': 'PJ COM DOAÇÕES ELEITORAIS ENTRE R$ 1.000.000.000 E R$ 100.000.000,01',
    't54': 'PJ COM DOAÇÕES ELEITORAIS ACIMA DE R$ 1.000.000.000'
  };

  mapeamentoTipologiaPF = {
    't1': 'PF NÃO CADASTRADA NA SRFB',
    't2': 'PF COM 5 A 10 VÍNCULOS ATIVOS NA RAIS',
    't3': 'PF COM 10 A 20 VÍNCULOS ATIVOS NA RAIS',
    't4': 'PF COM MAIS DE 20 VÍNCULOS ATIVOS NA RAIS',
    't5': 'PF CONTRATADA COM SITUAÇÃO SUSPENSA OU PENDENTE DE REGULARIZAÇÃO NA SRFB',
    't6': 'PF CONTRATADA COM SITUAÇÃO CANCELADA NA SRFB',
    't7': 'PF CONTRATADA COM SITUAÇÃO NULA NA SRFB',
    't8': 'PF COM ÓBITO INFORMADO À SRFB',
    't9': 'PF CANDIDATO POLÍTICO',
    't10': 'PF CANDIDATO POLÍTICO ELEITO',
    't11': 'PF EX-SERVIDOR NÃO EFETIVO',
    't12': 'PF SERVIDOR NÃO EFETIVO',
    't13': 'PF SERVIDOR EFETIVO',
    't14': 'PF EX-SERVIDOR EFETIVO',
    't15': 'PF MENOR DE 18 E MAIOR OU IGUAL A 10 ANOS NO EMPENHO',
    't16': 'PF MENOR DE 10 E MAIOR OU IGUAL A 5 ANOS NO EMPENHO',
    't17': 'PF MENOR DE 5 ANOS NO EMPENHO',
    't18': 'PF NASCIDA DEPOIS DO EMPENHO',
    't19': 'PF ANTERIORMENTE SANCIONADA NO CNCIAI',
    't20': 'PF COM SANÇÃO VIGENTE NO CNCIAI',
    't21': 'PF CONTRATADA COM SANÇÃO VIGENTE NO CNCIAI',
    't22': 'PF ANTERIORMENTE SANCIONADA NO CEIS',
    't23': 'PF COM SANÇÃO VIGENTE NO CEIS',
    't24': 'PF CONTRATADA COM SANÇÃO VIGENTE NO CEIS',
    't25': 'PF ANTERIORMENTE SANCIONADA NO CADICOM',
    't26': 'PF ANTERIORMENTE SANCIONADA NO CEPIM',
    't27': 'PF COM DOAÇÕES ELEITORAIS ENTRE R$ 2.000,00 E R$ 0,01',
    't28': 'PF COM DOAÇÕES ELEITORAIS ENTRE R$ 5.000,00 E R$ 2.000,01',
    't29': 'PF COM DOAÇÕES ELEITORAIS ENTRE R$ 10.000,00 E R$ 5.000,01',
    't30': 'PF COM DOAÇÕES ELEITORAIS ENTRE R$ 50.000,00 E R$ 10.000,01',
    't31': 'PF COM DOAÇÕES ELEITORAIS ACIMA DE R$ 50.000,00',
  };

  // tslint:disable-next-line: variable-name
  locale_pt_br = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    // tslint:disable-next-line: max-line-length
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  };

  registroNaoEncontrado = 'Nenhum registro foi encontrado.';
  MAP_BOX_KEY = 'pk.eyJ1IjoiYWJlbnZlbnV0byIsImEiOiJjamZud3kxa28xbXlhMnhsaXZvcGZxaXN6In0.fShZXaTT4Sd7flTi85U-IA';

  constructor(
    private deviceService: DeviceDetectorService
  ) {}

  isMobile(): boolean {
    // return window.innerWidth < 640;
    return this.deviceService.isMobile();
  }

  isDesktop(): boolean {
    return this.deviceService.isDesktop();
  }

  isTablet(): boolean {
    return this.deviceService.isTablet();
  }

  retornaKeys(objeto) {
    return Object.keys(objeto);
  }

  first(lista) {
    if (!lista) return null;

    return (lista.length) ?
      lista[0] :
      ((lista) ? lista : null);
  }

  second(lista) {
    if (!lista) return null;

    return (lista.length) ?
      lista[1] :
      ((lista) ? lista : null);
  }

  last(lista) {
    if (!lista) return null;

    return (lista.length) ?
      lista[lista.length - 1] :
      ((lista) ? lista : null);
  }

  getDialogStyle() {
    return (this.isMobile()) ?
      {width: '80vw', 'max-height': '80vw'} :
      {width: '50vw', 'max-height': '50vw'};
  }

    retornaCor(indice) {
        const listaCores = [
            '#FF6384',
            '#B0C4DE',
            '#36A2EB',
            '#FFCE56',
            '#ADFF2F',
            '#6495ED',
            '#D8BFD8',
            '#00FA9A',
            '#B22222',
            '#FFFACD',
        ];

        return listaCores[indice % listaCores.length];
    }

    toLowerCase(x: string) {
      if (!x || typeof x !== 'string') { return null; }
      return x.toLowerCase();
    }

    toUpperCase(x: string) {
      if (!x || typeof x !== 'string') { return null; }
      return x.toUpperCase();
    }

    sort(dados: any[]) {
      return dados.sort();
    }

    sortNum(dados: any[]) {
      return dados.sort((a, b) => a - b);
    }

    quartil = (dados, q) => {
      const sorted = this.sortNum(dados);
      const pos = (sorted.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;

      return (sorted[base + 1] !== undefined)
        ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
        : sorted[base];
  };

    removerAcentos(s){
      if (!s) return '';
      if (typeof s !== 'string') return s;

      const mapa={"â":"a","Â":"A","à":"a","À":"A","á":"a","Á":"A","ã":"a","Ã":"A","Ç":"C","ç":"c","ê":"e","Ê":"E","è":"e","È":"E","é":"e","É":"E","î":"i","Î":"I","ì":"i","Ì":"I","í":"i","Í":"I","õ":"o","Õ":"O","ô":"o","Ô":"O","ò":"o","Ò":"O","ó":"o","Ó":"O","ü":"u","Ü":"U","û":"u","Û":"U","ú":"u","Ú":"U","ù":"u","Ù":"U"};
      return s.replace(/[\W\[\] ]/g,function(a){return mapa[a]||a})
    };

    quebraLinha(linha){
        return linha.replace(/\s*;\s*/g,';\n')
    }

    checaErroJWT(erro) {
        if (erro && erro.message === 'No JWT present or has expired') {
            return true;
        }
        return false;
    }

    checaStatus(status) {
        if ( status === 'EPARAMINVALID' || status === 'ERECAPTCHANOTFOUND' ||
            status === 'ENOTAUTH' || status === 'ENOTFOUND' ||
            status === 'ETOKENNOTVALID' || status === 'ETOKENNOTFOUND' ||
            status === 'EHASHNOTVALID' || status === 'EHASHNOTFOUND' ||
            status === 'ERECAPTCHANOTVALID' || status === 'ELOGINFAILED' ||
            status === 'EPASSWORDNOTVALID' || status === 'ECPFNOTVALID' ||
            status === 'EQUOTAEMPTY') {
                return true;
            } else {
                return false;
        }
    }

    mensagemSucesso(header: string, mensagem: string) {
      const _header = (header) ? header : 'Sucesso';

        return {
            severity: 'success',
            summary: _header,
            detail: mensagem
        }
    }

    mensagemInfo(header: string, mensagem: string) {
      const _header = (header) ? header : 'Info';
        return {
            severity: 'info',
            summary: _header,
            detail: mensagem
        }
    }

    mensagemWarning(header: string, mensagem: string) {
      const _header = (header) ? header : 'Atenção';

        return {
            severity: 'warn',
            summary: _header,
            detail: mensagem
        }
    }

    mensagemErro(header: string, mensagem: string) {
      const _header = (header) ? header : 'Erro';

        return {
            severity: 'error',
            summary: _header,
            detail: mensagem
        }
    }

    trataRequisicaoNaoSucesso(status, msg) {
        if (status === 'ENOTFOUND') {
          return this.mensagemInfo('Falha', 'Não foram encontrados registros.');
        } else if (this.checaStatus(status)) {
          return this.mensagemWarning('Atenção', msg);
        } else if ( status === 'ESERVER') {
          return this.mensagemErro('Erro', 'Ocorreu um erro no servidor.');
        } else {
          return this.mensagemErro('Erro', 'Ocorreu um erro.');
        }
    }

    /**
     *
     * @param error
     * @param mensagemPersonalizada
     */
    trataErroRequisicao(error, mensagemPersonalizada= '') {
        // Checa se foi um erro provocado pelo vencimento do token
        if (this.checaErroJWT(error)) {
            return this.mensagemWarning('Atenção', 'Sua sessão expirou, refaça o login no sistema.');
        } else {
            // let status, msg, dados;
            const e = (error?.error) ? error?.error : error;

            if (!e) {
              return this.mensagemErro('Erro', mensagemPersonalizada);
            }

            const { status, msg, dados } = e;

            if (this.checaStatus(status)) {
              return this.mensagemErro('Erro', msg);
              } else {
              return this.mensagemErro('Erro', mensagemPersonalizada);
            }
        }
    }

    setaProcesso(processo: string) {
        localStorage.setItem('processo', processo);
        localStorage.setItem('processo_setado', 'S');
       // this.appMenu.setaProcesso();
    }

    getLiberaAcesso() {
        if (localStorage.getItem('processo_setado') === 'S' ) {
            localStorage.removeItem('processo_setado');
            return true;
        } else {
            return false;
        }
    }

    getFooterResultado(qtd) {
        if (parseInt(qtd, 10) > 1) {
            return `${qtd} registros encontrados.`;
        } else {
            return `${qtd} registro encontrado.`;
        }
    }

    getProcesso() {
        return localStorage.getItem('processo');
    }

    codificaDado(dado: string) {
        if (!dado) { return null; }

        try {
            return btoa(dado);
        } catch (err) {
            return null;
        }
    }

    decodificaDado(dado: string) {
        if (!dado) { return null; }

        try {
            return atob(dado);
        } catch (err) {
            return null;
        }
    }

    unique(arr: any[]) {
      return [...new Set(arr)]
    }

    checaCPF(cpf: string) {
        if (!cpf) { return null; }

        cpf = cpf.replace(/[^0-9]/g, '');
        if (cpf.length !== 11) { return null; }
        if (!this.validarCPF(cpf)) { return null; }

        return cpf;
    }

    validarCPF(cpf: string) {
        if (!cpf) { return null; }

        cpf = cpf.replace(/[^\d]+/g, '');
        // Elimina CPFs invalidos conhecidos
        if (cpf.length !== 11 ||
            cpf === '00000000000' ||
            cpf === '11111111111' ||
            cpf === '22222222222' ||
            cpf === '33333333333' ||
            cpf === '44444444444' ||
            cpf === '55555555555' ||
            cpf === '66666666666' ||
            cpf === '77777777777' ||
            cpf === '88888888888' ||
            cpf === '99999999999') { return null; }

        // Valida 1o digito
        let add = 0;
        for (let i = 0; i < 9; i++) {
            add += parseInt(cpf.charAt(i), 10) * (10 - i);
        }
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) { rev = 0; }
        if (rev !== parseInt(cpf.charAt(9), 10)) { return null; }

        // Valida 2o digito
        add = 0;
        for (let i = 0; i < 10; i++) {
            add += parseInt(cpf.charAt(i), 10) * (11 - i);
        }
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) { rev = 0; }
        if (rev !== parseInt(cpf.charAt(10), 10)) { return null; }

        return true;
    }

    checaCNPJ(cnpj: string) {
        if (!cnpj) { return null; }

        cnpj = cnpj.replace(/[^0-9]/g, '');

        if (cnpj.length !== 14) { return null; }
        if (!this.validarCNPJ(cnpj)) { return null; }

        return cnpj;
    }

    checaRG(rg: string) {
        if (!rg) { return null; }

        rg = rg.replace(/[^0-9]/g, '');

        return rg;
    }

    validarCNPJ(cnpj) {
        if (!cnpj) { return null; }
        cnpj = cnpj.replace(/[^\d]+/g, '');

        if (cnpj.length !== 14) { return null; }

        // Elimina CNPJs invalidos conhecidos
        if (cnpj === '00000000000000' ||
            cnpj === '11111111111111' ||
            cnpj === '22222222222222' ||
            cnpj === '33333333333333' ||
            cnpj === '44444444444444' ||
            cnpj === '55555555555555' ||
            cnpj === '66666666666666' ||
            cnpj === '77777777777777' ||
            cnpj === '88888888888888' ||
            cnpj === '99999999999999') { return null; }

        // Valida DVs
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) { pos = 9; }
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0), 10)) { return null; }

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) { pos = 9; }
    }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(1), 10)) { return null; }

        return true;
    }

    converteEmDinheiro(valor) {
        if (!valor) { return valor; }

        return parseFloat(valor).toLocaleString('pt-BR');
    }
    converteEmDinheiroFormatoBrasileiro(valor) {
        if (!valor) { return valor; }
        var formato = { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' }
        return parseFloat(valor).toLocaleString('pt-BR', formato);
    }

    round(valor) {
        if (!valor) { return valor; }

        const dado = (typeof valor === 'number') ? valor : parseFloat(valor);
        return Math.round(dado * 100)/100;
    }

    formataDado(dado: string, mask: string) {
        if (!dado) { return dado; }
        if (dado.length !== mask.replace(/[^#]/g, '').length) { return dado; }

        let i = 0,
        v = dado.toString();
        return mask.replace(/#/g, _ => v[i++]);
    }

    formataData(dado, template='DD/MM/YYYY') {
        if (!dado) { return dado; }

        let ret = dayjs(dado).utc().format(template);
        if (ret === 'Invalid Date') {
          const formatoPadraoData = 'DD/MM/YYYY';
          ret = dayjs(dado, formatoPadraoData).utc().format(template);
        }
        // Foi criado so para validar os campos com data indefinida
        if(ret === '01/01/1900'){
            const dataIndefinida = ''
            return dataIndefinida
        }
        return ret;
    }



    formataDocumentoPM(dado){
        if(dado == 0){
            return dado = 'Documento';
        } else if (dado == 1){
            return dado = 'RG';
        } else if (dado == 2){
            return dado = 'CPF';
        } else if (dado == 3){
            return dado = 'CNH';
        } else if (dado == 4){
            return dado = 'Outro';
        } else {
            return dado = null;
        }
    }

    formataVinculoPM(dado){
        if(dado == 0){
            return dado = 'Não Especifico';
        } else if (dado == 1){
            return dado = 'Parentesco';
        } else if (dado == 2){
            return dado = 'Amizade';
        } else if (dado == 3){
            return dado = 'Criminal';
        } else if (dado == 4){
            return dado = 'Outro';
        } else {
            return dado = null;
        }
    }

    formataRGLince(rg){
        //if (!dado) { return dado; }
        if (!rg) { return null; }

        rg = rg.replace(/[^\d]+/g, '');
        // Elimina CPFs invalidos conhecidos
        if (rg.length !== 14 ||
            rg === '00000000000' ||
            rg === '11111111111' ||
            rg === '22222222222' ||
            rg === '33333333333' ||
            rg === '44444444444' ||
            rg === '55555555555' ||
            rg === '66666666666' ||
            rg === '77777777777' ||
            rg === '88888888888' ||
            rg === '99999999999' ||
            rg === 'NÃO INFORMADO') { return null; }
        //foi criado especificamente para o lince
    }

    formataStatus(dado: string){
        if(dado !== 'false'){
            return dado = 'não'
        } else {
            return dado = 'sim'
        }
    }

    subtraiMesDataAtualFormatado(meses, template='DD/MM/YYYY'){
        // tslint:disable-next-line: radix
        return dayjs().subtract(parseInt(meses), 'month').utc().format(template)
    }

    getDataAtualFormatado(template='DD/MM/YYYY'){
        return dayjs().utc().format(template);
    }

    toDate(dado, template='DD/MM/YYYY'){
        return dayjs(dado, template).toDate()
    }

    decodeEntities = (function() {
        // this prevents any overhead from creating the object each time
        var element = document.createElement('div');

        function decodeHTMLEntities (str) {
          if(str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
          }

          return str;
        }

        return decodeHTMLEntities;
      })();

    sanitizeHtml(dado:string){
        if (!dado) { return dado; }
        return this.decodeEntities(dado.replace(/<[^>]*>/g, ''));
    }

    formataSexo(dado: string) {
      return (dado === 'M') ? 'Masculino' : (dado === 'F') ? 'Feminino' : dado;
    }

    formataSimNao(dado: boolean) {
      return (dado == true) ? 'SIM' : (dado == false) ? 'NÃO' : '';
    }

  entradaPesquisaInvalida(dados) {
    if (dados.fCNPJ) {
      if (!this.checaCNPJ(dados.fCNPJ)) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Preencha um CNPJ válido.' }];
      }

      return false;
    } else if (dados.fNomeFantasia) {
      if (this.removeStopWords(dados.fNomeFantasia).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }

      return false;
    } else if (dados.fInscricao) {
      if (!dados.fInscricao) {
          return [{ severity: 'info', summary: 'Falha', detail: 'Preencha uma Inscrição válida.' }];
      }

        return false;
    } else if (dados.fEmbarcacao) {
        if (this.removeStopWords(dados.fEmbarcacao).length < 1) {
          return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 1 nomes.' }];
        }

        return false;
    } else if (dados.fRazaoSocial) {
      if (this.removeStopWords(dados.fRazaoSocial).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }

      return false;
    } else if (dados.fTelefone) {
      if (!dados.fTelefone) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um telefone válido.' }];
      }

      return false;
    } else if (dados.fEmail) {
      if (!dados.fEmail) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um email válido.' }];
      }
      return false;
    } else if (dados.fSocioPFNome) {
      if (this.removeStopWords(dados.fSocioPFNome).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }
      return false;
    } else if (dados.fSocioPFCPF) {
      if (!this.checaCPF(dados.fSocioPFCPF)) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Preencha um CPF válido.' }];
      }
      return false;
    } else if (dados.fSocioPJCNPJ) {
      if (!this.checaCNPJ(dados.fSocioPJCNPJ)) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Preencha um CNPJ válido.' }];
      }
      return false;
    } else if (dados.fCPF) {
      if (!this.checaCPF(dados.fCPF)) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Preencha um CPF válido.' }];
      }
      return false;
    } else if (dados.fNome) {
      if (this.removeStopWords(dados.fNome).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }
      return false;
    } else if (dados.fRG) {
      if (!this.checaRG(dados.fRG)) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um RG válido.' }];
      }
      return false;
    } else if (dados.fTituloEleitor) {
      const titulo = dados.fTituloEleitor.replace(/[^0-9]/g, '');
      if (!(titulo.length === 12 || titulo.length === 13)) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um Título válido.' }];
      }
      return false;
    } else if (dados.fNomePai) {
      if (this.removeStopWords(dados.fNomePai).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }
      return false;
    } else if (dados.fEndereco) {
      if (this.removeStopWordsLogradouro(dados.fEndereco).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }

      return false;
    } else if (dados.fNomeMae) {
      if (this.removeStopWords(dados.fNomeMae).length < 2) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 2 nomes.' }];
      }

      return false;
    } else if (dados.fCNH) {
      if (!dados.fCNH) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um CNH válido.' }];
      }
      return false;
    } else if (dados.fPlaca) {
      if (!dados.fPlaca) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira uma Placa válida.' }];
      }
      return false;
    } else if (dados.fChassi) {
      if (!dados.fChassi) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um Chassi válido.' }];
      }
      return false;
    } else if (dados.fRenavam) {
      if (!dados.fRenavam) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um Renavam válido.' }];
      }
      return false;
    } else if (dados.fLicitacao) {
      if (!dados.fLicitacao) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira o código da Unidade Gestora, número da licitação e modalidade. Separar com o "|"' }];
      }
      return false;
    } else if (dados.fGenerico) {
      if (!dados.fGenerico) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um dado válido.' }];
      }
      return false;
    } else if (dados.fAlcunha) {
        if (this.removeStopWords(dados.fAlcunha).length < 1) {
          return [{ severity: 'info', summary: 'Falha', detail: 'Insira ao menos 1 nomes.' }];
        }
        return false;
    } else if (dados.fORCRIM) {
      if (!dados.fORCRIM) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um dado válido.' }];
      }
      return false;
    } else if (dados.fDate) {
      if (!dados.fDate) {
        return [{ severity: 'info', summary: 'Falha', detail: 'Insira um dado válido.' }];
      }
        return false;
    }  else {
      return [{ severity: 'info', summary: 'Falha', detail: 'Preencha algum campo.' }];
    }
  }

    removeStopWords(nomeCompleto: string) {
        const stopWords = ['DA', 'DAS', 'DE', 'DES', 'DO', 'DOS', 'E'];

        if (nomeCompleto.constructor === Array) {
            nomeCompleto = nomeCompleto[0];
        }

        return nomeCompleto.split(' ').filter(nome => stopWords.indexOf(nome.toUpperCase()) === -1 && nome !== '');
    }

    removeStopWordsLogradouro(logradouro: string) {
      const stopWords = ['DA', 'DAS', 'DE', 'DES', 'DO', 'DOS', 'E'];

      if (logradouro.constructor === Array) {
        logradouro = logradouro[0];
      }

      return logradouro.split(' ').filter(nome => stopWords.indexOf(nome.toUpperCase()) === -1 && nome !== '');
    }

    manterOrdem(a, b) {
      return a;
    }


    // Necessário pois podem haver arrays de tamanhos diferentes
    // Ex: dtMedico = [ '2010', '2011']
    //     resMedico = [ 'APTO' ]
    // Isso ocorre porque os resultados repetidos são retirados do array,
    private achaDadoValido(array, index) {
        if (array[index]) { return array[index]; }

        // Se chegar ao primeiro termo e ainda assim ele não for válido, retorna undefined.
        if (index === 0 && !array[index]) { return undefined; }

        return this.achaDadoValido(array, index - 1);
    }

    formataLinha(atributo, valor, obj, indexValor) {
        let nomeAtributo;
        let valorAtributo;
        const atributosInline = ['orgEmissorRg', 'ufOrgEmissorRG', 'catAtual', 'resPsicotecnico', 'resMedico'];

        if (valor && atributosInline.indexOf(atributo) === -1) {
            if (atributo === 'foto') {
                nomeAtributo  = 'Foto:';
                valorAtributo = {
                    image: `data:image/png;base64,${valor}`,
                    width: 80
                };
            } else if (atributo === 'nome') {
                nomeAtributo  = 'Nome:';
                valorAtributo = valor;
            } else if (atributo === 'nomeApresentacao') {
                nomeAtributo  = 'Nome de Apresentação:';
                valorAtributo = valor;
            } else if (atributo === 'nomeSocial') {
                nomeAtributo  = 'Nome Social:';
                valorAtributo = valor;
            } else if (atributo === 'situacaoCadastral') {
                nomeAtributo  = 'Situação Cadastral:';
                valorAtributo = valor;
            } else if (atributo === 'anoObito') {
                nomeAtributo  = 'Ano Óbito:';
                valorAtributo = valor;
            } else if (atributo === 'nacionalidade') {
                nomeAtributo  = 'Nacionalidade:';
                    valorAtributo = valor;
            } else if (atributo === 'escolaridade') {
                nomeAtributo  = 'Escolaridade:';
                    valorAtributo = valor;
            } else if (atributo === 'naturalidade') {
                nomeAtributo  = 'Naturalidade:';
                    valorAtributo = valor;
            } else if (atributo === 'ufNaturalidade' || atributo === 'naturalidadeUF') {
                nomeAtributo  = 'UF Naturalidade:';
                valorAtributo = valor;
            } else if (atributo === 'dataNascimento') {
                nomeAtributo  = 'Data de Nascimento:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'dataAtualizacao') {
                nomeAtributo  = 'Data de Atualização:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'dataInformacao') {
                nomeAtributo  = 'Data da Informação:';
                valorAtributo = valor;
            } else if (atributo === 'sexo') {
                nomeAtributo  = 'Sexo:';
                valorAtributo = this.formataSexo(valor);
            } else if (atributo === 'cpf') {
                nomeAtributo  = 'CPF:';
                valorAtributo = this.formataDado(valor, '###.###.###-##');
            } else if (atributo === 'rg') {
                nomeAtributo  = 'RG:';
                valorAtributo = this.formataRGLince(valor);
                if (obj['orgEmissorRg'] && obj['ufOrgEmissorRG'] && isArray(obj['orgEmissorRg'])) {
                    valorAtributo = `${valor} ${this.achaDadoValido(obj['orgEmissorRg'], indexValor)}/${this.achaDadoValido(obj['ufOrgEmissorRG'], indexValor)}`;
                } else if (obj['orgEmissorRg'] && obj['ufOrgEmissorRG'] && !isArray(obj['orgEmissorRg'])) {
                    valorAtributo = `${valor} ${obj['orgEmissorRg']}/${obj['ufOrgEmissorRG']}`;
                } else {
                    valorAtributo = valor;
                }
            } else if (atributo === 'dataExpedicao') {
                nomeAtributo  = 'Data de Expedição RG:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'tituloEleitor') {
                nomeAtributo  = 'Título de Eleitor:';
                valorAtributo = valor;
            } else if (atributo === 'nomeMae') {
                nomeAtributo  = 'Nome da Mãe:';
                valorAtributo = valor;
            } else if (atributo === 'nomePai') {
                nomeAtributo  = 'Nome do Pai:';
                valorAtributo = valor;
            } else if (atributo === 'cnh') {
                nomeAtributo  = 'CNH:';
                if (obj['catAtual'] && isArray(obj['catAtual'])) {
                    valorAtributo = `${valor} - Categoria: ${this.achaDadoValido(obj['catAtual'], indexValor)}`;
                } else if (obj['catAtual'] && !isArray(obj['catAtual'])) {
                    valorAtributo = `${valor} - Categoria: ${obj['catAtual']}`;
                } else {
                    valorAtributo = valor;
                }
            } else if (atributo === 'renach') {
                nomeAtributo  = 'Renach:';
                valorAtributo = valor;
            } else if (atributo === 'dtPsicotecnico') {
                nomeAtributo  = 'Exame Psicotécnico:';
                if (obj['resPsicotecnico']  && isArray(obj['resPsicotecnico'])) {
                    valorAtributo = `${this.formataData(valor)} - ${this.achaDadoValido(obj['resPsicotecnico'], indexValor)}`;
                } else if (obj['resPsicotecnico']  && !isArray(obj['resPsicotecnico'])) {
                    valorAtributo = `${this.formataData(valor)} - ${obj['resPsicotecnico']}`;
                } else {
                    valorAtributo =  this.formataData(valor);
                }
            } else if (atributo === 'dtMedico') {
                nomeAtributo  = 'Exame Médico:';
                if (obj['resMedico']  && isArray(obj['resPsicotecnico'])) {
                    valorAtributo = `${this.formataData(valor)} - ${this.achaDadoValido(obj['resMedico'], indexValor)}`;
                } else if (obj['resMedico']  && !isArray(obj['resPsicotecnico'])) {
                    valorAtributo = `${this.formataData(valor)} - ${obj['resMedico']}`;
                } else {
                    valorAtributo =  this.formataData(valor);
                }
            } else if (atributo === 'estrangeiro') {
                nomeAtributo  = 'Estrangeiro:';
                valorAtributo = valor;
            } else if (atributo === 'nomePaisExterior') {
                nomeAtributo  = 'Nome País Exterior:';
                valorAtributo = valor;
            } else if (atributo === 'residenteExterior') {
                nomeAtributo  = 'Residente Exterior:';
                valorAtributo = valor;
            } else if (atributo === 'naturezaOcupacao') {
                nomeAtributo  = 'Natureza da Ocupação:';
                valorAtributo = valor;
            } else if (atributo === 'anoExercicioOcupacao') {
                nomeAtributo  = 'Ano da Ocupação:';
                valorAtributo = valor;
            } else if (atributo === 'tipoOcupacaoPrincipal') {
                nomeAtributo  = 'Tipo de Ocupação:';
                valorAtributo = valor;
            } else if (atributo === 'ocupacaoPrincipal') {
                nomeAtributo  = 'Ocupação Principal:';
                valorAtributo = valor;
            } else if (atributo === 'fonte') {
                nomeAtributo  = 'Fonte:';
                valorAtributo = valor;
            } else if (atributo === 'placa') {
                nomeAtributo  = 'Placa:';
                valorAtributo = valor;
            } else if (atributo === 'chassi') {
                nomeAtributo  = 'Chassi:';
                valorAtributo = valor;
            } else if (atributo === 'cor') {
                nomeAtributo  = 'Cor:';
                valorAtributo = valor;
            } else if (atributo === 'combustivel') {
                nomeAtributo  = 'Combustível:';
                valorAtributo = valor;
            } else if (atributo === 'tipoChassi') {
                nomeAtributo  = 'Tipo Chassi:';
                valorAtributo = valor;
            } else if (atributo === 'renavam') {
                nomeAtributo  = 'Renavam:';
                valorAtributo = valor;
            } else if (atributo === 'anoFab') {
                nomeAtributo  = 'Ano Fabricação:';
                valorAtributo = valor;
            } else if (atributo === 'anoMod') {
                nomeAtributo  = 'Ano Modificação:';
                valorAtributo = valor;
            } else if (atributo === 'tipo') {
                nomeAtributo  = 'Tipo:';
                valorAtributo = valor;
            } else if (atributo === 'marcaModelo') {
                nomeAtributo  = 'Marca/Modelo:';
                valorAtributo = valor;
            } else if (atributo === 'especie') {
                nomeAtributo  = 'Espécie:';
                valorAtributo = valor;
            } else if (atributo === 'procedencia') {
                nomeAtributo  = 'Procedência:';
                valorAtributo = valor;
            } else if (atributo === 'combustivel') {
                nomeAtributo  = 'Combustível:';
                valorAtributo = valor;
            } else if (atributo === 'situacao') {
                nomeAtributo  = 'Situação:';
                valorAtributo = valor;
            } else if (atributo === 'observacao') {
                nomeAtributo  = 'Observação:';
                valorAtributo = valor;
            } else if (atributo === 'dataInicioPosse') {
                nomeAtributo  = 'Data de Posse/Emplacamento:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'dataAtualizacao') {
                nomeAtributo  = 'Data de Atualização:';
                valorAtributo = valor;
            } else if (atributo === 'anoRegistro') {
                nomeAtributo  = 'Ano do Registro:';
                valorAtributo = valor;
            } else if (atributo.startsWith('restricao')) {
                nomeAtributo  = 'Restrição:';
                valorAtributo = valor;
            } else if (atributo === 'tipoPessoa') {
                nomeAtributo  = 'Tipo Proprietário:';
                valorAtributo = `Pessoa ${valor}`;
            } else if (atributo === 'dtCadastro') {
                nomeAtributo  = 'Data de Cadastro:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'cnpj') {
                nomeAtributo  = 'CNPJ:';
                valorAtributo = this.formataDado(valor, '##.###.###/####-##');
            } else if (atributo === 'razaoSocial') {
                nomeAtributo  = 'Razão Social:';
                valorAtributo = valor;
            } else if (atributo === 'nomeFantasia') {
                nomeAtributo  = 'Nome Fantasia:';
                valorAtributo = valor;
            } else if (atributo === 'percCapital' || atributo === 'socio_percCapital') {
                nomeAtributo  = 'Percentual Capital:';
                valorAtributo = valor + ' %';
            } else if (atributo === 'cpfResponsavel') {
                nomeAtributo  = 'CPF do Responsável:';
                valorAtributo = this.formataDado(valor, '###.###.###-##');
            } else if (atributo === 'nomeResponsavel') {
                nomeAtributo  = 'Nome do Responsável:';
                valorAtributo = valor;
            } else if (atributo === 'vulgo') {
                nomeAtributo  = 'Vulgo:';
                valorAtributo = valor;
            } else if (atributo === 'dataEntrada') {
                nomeAtributo  = 'Data de Entrada:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'status') {
                nomeAtributo  = 'Status:';
                valorAtributo = valor;
            } else if (atributo === 'cnc') {
                nomeAtributo  = 'CNC:';
                valorAtributo = this.formataDado(valor, '############-##');
            } else if (atributo === 'cadeia') {
                nomeAtributo = 'Unidade Prisional:';
                valorAtributo = valor;
            } else if (atributo === 'cadeiaUF') {
                nomeAtributo = 'UF Unidade Prisional:';
                valorAtributo = valor;
            } else if (atributo === 'cadeiaAmbito') {
                nomeAtributo = 'Âmbito Unidade Prisional:';
                valorAtributo = valor;
            } else if (atributo === 'tipoRecolhimento') {
                nomeAtributo = 'Recolhimento:';
                valorAtributo = valor;
            } else if (atributo === 'regimePrisional') {
                nomeAtributo = 'Regime:';
                valorAtributo = valor;
            } else if (atributo === 'regimePrisional') {
                nomeAtributo = 'Regime:';
                valorAtributo = valor;
            } else if (atributo === 'comparsas') {
                nomeAtributo = 'Comparsas:';
                valorAtributo = valor;
            } else if (atributo === 'principalAtividade') {
                nomeAtributo = 'Ativade Criminosa:';
                valorAtributo = valor;
            } else if (atributo === 'cabelo') {
                nomeAtributo = 'Cabelo:';
                valorAtributo = valor;
            } else if (atributo === 'olhos') {
                nomeAtributo = 'Olhos:';
                valorAtributo = valor;
            } else if (atributo === 'cutis') {
                nomeAtributo = 'Cutis:';
                valorAtributo = valor;
            } else if (atributo === 'faccao') {
                nomeAtributo = 'Facção:';
                valorAtributo = valor;
            } else if (atributo === 'barba') {
                nomeAtributo = 'Barba:';
                valorAtributo = valor;
            } else if (atributo === 'cicatriz') {
                nomeAtributo = 'Cicatriz:';
                valorAtributo = valor;
            } else if (atributo === 'tatuagem') {
                nomeAtributo = 'Tatuagem:';
                valorAtributo = valor;
            } else if (atributo === 'dataInicioAtividade') {
                nomeAtributo  = 'Data Início Atividade:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'matriz') {
                nomeAtributo  = 'Matriz:';
                valorAtributo = valor;
            } else if (atributo === 'naturezaJuridica') {
                nomeAtributo  = 'Natureza Jurídica:';
                valorAtributo = valor;
            } else if (atributo === 'porte') {
                nomeAtributo  = 'Porte:';
                valorAtributo = valor;
            } else if (atributo === 'dataSituacaoCadastral') {
                nomeAtributo  = 'Data Situação Cadastral:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'capitalSocial') {
                nomeAtributo  = 'Capital Social:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeFiscal') {
                nomeAtributo  = 'CNAE - Fiscal:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeSecundario') {
                nomeAtributo  = 'CNAE - Secundário:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeSecao') {
                nomeAtributo  = 'CNAE - Seção:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeDivisao') {
                nomeAtributo  = 'CNAE - Divisão:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeGrupo') {
                nomeAtributo  = 'CNAE - Grupo:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeClasse') {
                nomeAtributo  = 'CNAE - Classe:';
                valorAtributo = valor;
            } else if (atributo === 'cnaeSubClasse') {
                nomeAtributo  = 'CNAE - Sub Classe:';
                valorAtributo = valor;
            } else if (atributo === 'profissao') {
                nomeAtributo  = 'Profissão:';
                valorAtributo = valor;
            } else if (atributo === 'numeroMandado') {
                nomeAtributo  = 'Número de Mandado:';
                valorAtributo = valor;
            } else if (atributo === 'dataMandado') {
                nomeAtributo  = 'Data do Mandado:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'orgao') {
                nomeAtributo  = 'Órgão:';
                valorAtributo = valor;
            } else if (atributo === 'situacao') {
                nomeAtributo  = 'Situação:';
                valorAtributo = valor;
            } else if (atributo === 'uf') {
                nomeAtributo  = 'UF:';
                valorAtributo = valor;
            } else if (atributo === 'municipio') {
                nomeAtributo  = 'Município:';
                valorAtributo = valor;
            } else if (atributo === 'obito_nomeFantasia') {
                nomeAtributo  = 'Cartório - Nome:';
                valorAtributo = valor;
            } else if (atributo === 'obito_municipioServentia') {
                nomeAtributo  = 'Cartório - Município:';
                valorAtributo = valor;
            } else if (atributo === 'obito_ufServentia') {
                nomeAtributo  = 'Cartório - UF:';
                valorAtributo = valor;
            } else if (atributo === 'obito_cnpjServentia') {
                nomeAtributo  = 'Cartório - CNPJ:';
                valorAtributo = valor;
            } else if (atributo === 'obito_razaoSocial') {
                nomeAtributo  = 'Cartório - Razão Social:';
                valorAtributo = valor;
            } else if (atributo === 'obito_site') {
                nomeAtributo  = 'Cartório - Site:';
                valorAtributo = valor;
            } else if (atributo === 'obito_livro') {
                nomeAtributo  = 'Óbito - Livro:';
                valorAtributo = valor;
            } else if (atributo === 'obito_folha') {
                nomeAtributo  = 'Óbito - Folha:';
                valorAtributo = valor;
            } else if (atributo === 'obito_termo') {
                nomeAtributo  = 'Óbito - Termo:';
                valorAtributo = valor;
            } else if (atributo === 'obito_matricula') {
                nomeAtributo  = 'Óbito - Matricula:';
                valorAtributo = valor;
            } else if (atributo === 'obito_nomePai') {
                nomeAtributo  = 'Falecido - Pai:';
                valorAtributo = valor;
            } else if (atributo === 'obito_dataObito') {
                nomeAtributo  = 'Óbito - Data de Óbito:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'obito_nome') {
                nomeAtributo  = 'Falecido - Nome:';
                valorAtributo = valor;
            } else if (atributo === 'obito_nomeMae') {
                nomeAtributo  = 'Falecido - Nome da Mãe:';
                valorAtributo = valor;
            } else if (atributo === 'obito_dataNascimento') {
                nomeAtributo  = 'Falecido - Data de Nascimento:';
                valorAtributo = this.formataData(valor);
            } else if (atributo === 'obito_cpf') {
                nomeAtributo  = 'Falecido - CPF:';
                valorAtributo = this.formataDado(valor, '###.###.###-##');
            } else if (atributo === 'telefone') {
                nomeAtributo  = 'Telefone:';
                valorAtributo = valor;
            } else if (atributo === 'estadoCivil') {
                nomeAtributo  = 'Estado Civil:';
                valorAtributo = valor;
            } else if (atributo === 'obito_endereco') {
                nomeAtributo  = 'Cartorio - Endereço:';
                valorAtributo = valor;
            } else if (atributo === 'obito_bairro') {
                nomeAtributo  = 'Cartorio - Bairro:';
                valorAtributo = valor;
            } else if (atributo === 'obito_cep') {
                nomeAtributo  = 'Cartorio - CEP:';
                valorAtributo = valor;
            } else if (atributo === 'obito_distrito') {
                nomeAtributo  = 'Cartorio - Distrito:';
                valorAtributo = valor;
            } else if (atributo === 'obito_emailServentia') {
                nomeAtributo  = 'Cartorio - Email:';
                valorAtributo = valor;
            } else if (atributo === 'obito_numeroTelefonePrincipal') {
                nomeAtributo  = 'Cartorio - Telefone:';
                valorAtributo = valor;
            } else if (atributo === 'obito_naturalidade') {
                nomeAtributo  = 'Falecido - Naturalidade:';
                valorAtributo = valor;
            } else if (atributo === 'obito_ufNaturalidade') {
                nomeAtributo  = 'Falecido - Estado da Naturalidade:';
                valorAtributo = valor;
            } else if (atributo === 'alcunha') {
                nomeAtributo  = 'Alcunha:';
                valorAtributo = valor;
            } else if (atributo === 'nome') {
                nomeAtributo  = 'Nome:';
                valorAtributo = valor;
            } else if (atributo === 'corRaca') {
                nomeAtributo  = 'Raça:';
                valorAtributo = valor;
            } else if (atributo === 'flagGravidez') {
                nomeAtributo  = 'Gestante:';
                valorAtributo = valor;
            } else if (atributo === 'numeroPeca') {
                nomeAtributo  = 'Numero';
                valorAtributo = valor;
            } else if (atributo === 'mandado') {
                valorAtributo = valor;
            } else {
                console.log('Atributo desconhecido: ', atributo);
                return null;
            }

            if (indexValor === 0) {
                return [nomeAtributo, valorAtributo];
            } else {
                return ['', valorAtributo];
            }
        } else {
            return null;
        }
      }

      onKeyDate(event: any){
        if (event.code !== 'Backspace' && event.code !== 'Delete')
          if (event.target.value.length == 2 || event.target.value.length == 5)
            event.target.value = event.target.value + "/";
      }
}
