import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { logo_mp } from './../relatorio.utils';

@Injectable()
export class RelatorioSecaoCadastroService {

    constructor(private utils: UtilsService) { }

    criaCabecalhoCadastro() {
      return [{ image: logo_mp, alignment: 'center', width: 100 },
      { text: 'MINISTÉRIO PÚBLICO DA PARAÍBA', fontSize: 15, alignment: 'center' },
      { text: 'PROCURADORIA-GERAL DE JUSTIÇA', fontSize: 15, alignment: 'center' },
      { text: 'NÚCLEO DE GESTÃO DO CONHECIMENTO E SEGURANÇA INSTITUCIONAL', fontSize: 12, alignment: 'center' }];
    }

    criaSecaoRelatorioCadastro (r) {
        return {
            text: [
                `\n\n`,
                `Qualificação: `, { text: `${r.nome}`, bold: true }, `, `,
                // `Nacionalidade: `, { text: `${r.nacionalidade}`, bold: true }, `, `,
                `CPF: `, { text: `${this.utils.formataDado(r.cpf, '###.###.###-##')}`, bold: true }, `, `,
                `Identidade: `, { text: `${r.identidade} ${r.orgEmissor}/${r.ufOrgEmissor}`, bold: true }, `, `,
                `Matrícula: `, { text: `${r.matricula}`, bold: true }, `, `,
                `Titularidade: `, { text: `${r.titularidade}`, bold: true }, `, `,
                `Órgão/Promotoria: `, { text: `${r.lotacao}`, bold: true }, `, `,
                `Telefone: `,
                { text: `${(r.telefone.length === 10) ?
                  this.utils.formataDado(r.telefone, '(##) ####-####') :
                  this.utils.formataDado(r.telefone, '(##) # ####-####')}`, bold: true },
                ` e E-mail: `, { text: `${r.email} `, bold: true },
                `perante o Núcleo de Gestão do Conhecimento e Segurança Institucional, `,
                `declaro ter ciência inequívoca da legislação sobre o tratamento de informação `,
                `classificada cuja divulgação possa causar risco ou dano à segurança da `,
                `sociedade ou do Estado, assim como a privacidade dos cidadãos, e me `,
                `comprometo a guardar o sigilo necessário, nos termos da Lei nº 12.527, `,
                `de 18 de Novembro de 2011, e a:`,
                `\n\n`,
                `a) tratar as informações classificadas em qualquer grau de sigilo ou os `,
                `materiais de acesso restrito que me forem fornecidos pelo NÚCLEO DE GESTÃO `,
                `DO CONHECIMENTO E SEGURANÇA INSTITUCIONAL e preservar o seu sigilo, `,
                `de acordo com a legislação vigente;`,
                `\n\n`,
                `b) preservar o conteúdo das informações classificadas cm qualquer grau de `,
                `sigilo ou dos materiais de acesso restrito, sem divulgá-lo a terceiros;`,
                `\n\n`,
                `c) não praticar quaisquer atos que possam afetar o sigilo ou a integridade das `,
                `informações classificadas em qualquer grau de sigilo ou dos materiais de acesso restrito;`,
                `\n\n`,
                `d) não copiar ou reproduzir, por qualquer meio ou modo: (I) informações `,
                `classificadas em qualquer grau de sigilo; (II) informações relativas aos `,
                `materiais de acesso restrito, salvo autorização da autoridade competente;`,
                `\n\n`,
                `e) acessar o conteúdo das informações não classificadas como sigilosas, `,
                `podendo utilizá-las, copiá-las ou reproduzi-las por qualquer meio ou modo, `,
                `exclusivamente no exercício das atividades funcionais que me compete exercer `,
                `ou para instrução de processo judicial e administrativo que estejam sob `,
                `a responsabilidade de órgão do Ministério Público;`,
                `\n\n`,
                `f) não fornecer ou emprestar a senha ou qualquer outra forma, a pessoas `,
                `não autorizadas aos sistemas do núcleo de gestão do conhecimento, assim `,
                `como utilizar indevidamente do acesso restrito, tendo ciência que a aludida `,
                `conduta configura o crime de violação do sigilo funcional (art.325, § 1o, `,
                `I e II do Código Penal).`,
                `\n\n`,
                `Por estar de acordo com o presente Termo, o assino:`,
                `\n\n`,
                { text: `João Pessoa - PB, ${this.utils.formataData(new Date(), 'DD [de] MMMM [de] YYYY')}`, alignment: 'right' },
                `\n\n\n`,
                `______________________________________________________`,
                `\n`,
                { text: `${r.nome}`, bold: true },
                `\n`,
                { text: `${r.titularidade}`, bold: true },
            ],
            alignment: 'justify'
        };
    }
}
