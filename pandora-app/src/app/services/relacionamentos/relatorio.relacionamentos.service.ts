import { Injectable } from '@angular/core';

import { logo_mp, RelatorioUtilsService } from '../relatorio/relatorio.utils';
import { UtilsService } from '../common/utils.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RelatorioRelacionamentosService {

  valorProtocolo;

  constructor(
    private utils: UtilsService,
    private rutils: RelatorioUtilsService,
    private auth: AuthService
  ) {}

  private criaCabecalho(protocolo, grupo = undefined) {

    return [
      { image: logo_mp, alignment: 'center', width: 100 },
      { text: 'MINISTÉRIO PÚBLICO DA PARAÍBA', style: 'header' },
      { text: 'PROCURADORIA-GERAL DE JUSTIÇA', style: 'header' },
      { text: 'NÚCLEO DE GESTÃO DO CONHECIMENTO E SEGURANÇA INSTITUCIONAL', style: 'subheader' },

      { text: '\n\nRelatório de Relacionamentos\n', style: 'secao' },
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

  private linhaTabelaAgrupado(dados, atributo) {
    if (atributo === 'linha_vazia') { return [['   ', '   ']]; }

    return [this.utils.formataLinha(atributo, dados[atributo], dados, 0)];
  }

  private criaTabelaPessoaAgrupado(dados) {
    const ordemAtributos = [
      'nome', 'cpf', 'sexo', 'dataNascimento',
      'nomeMae', 'nomePai', 'municipio', 'uf'
    ];

    return ordemAtributos.reduce((acc, atributo) => {
      // Só faz o dado se ele existir em dados
      if (acc && (dados[atributo] || atributo === 'linha_vazia')) {
        return acc.concat(this.linhaTabelaAgrupado(dados, atributo));
      } else {
        return acc;
      }
    }, []);
  }

  private criaTabelaAgrupadoEmpresa(dados) {
    const ordemAtributos = [
      'razaoSocial', 'cnpj', 'nomeFantasia',
      'dataInicioAtividade', 'municipio', 'uf'
    ];

    return ordemAtributos.reduce((acc, atributo) => {
      // Só faz o dado se ele existir em dados
      if (acc && (dados[atributo] || atributo === 'linha_vazia')) {
        return acc.concat(this.linhaTabelaAgrupado(dados, atributo));
      } else {
        return acc;
      }
    }, []);
  }

  private criaTabelaAgrupadoTelefone(dados) {
    const ordemAtributos = [
      'telefone'
    ];

    return ordemAtributos.reduce((acc, atributo) => {
      // Só faz o dado se ele existir em dados
      if (acc && (dados[atributo] || atributo === 'linha_vazia')) {
        return acc.concat(this.linhaTabelaAgrupado(dados, atributo));
      } else {
        return acc;
      }
    }, []);
  }

  getTabelaNodePessoa(node) {
    return [
      { text: `${node.nome} - ${this.utils.formataDado(node.cpf, '###.###.###-##')}`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: [130, '*'],
          body: this.criaTabelaPessoaAgrupado(node)
        },
        layout: this.rutils.layout
      }
    ];
  }

  getTabelaNodeEmpresa(node) {
    return [
      { text: `${node.razaoSocial} - ${this.utils.formataDado(node.cnpj, '##.###.###/####-##')}`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: [130, '*'],
          body: this.criaTabelaAgrupadoEmpresa(node)
        },
        layout: this.rutils.layout
      }
    ];
  }

  getTabelaNodeTelefone(node) {
    return [
      { text: `Telefone ${node.telefone}`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: [130, '*'],
          body: this.criaTabelaAgrupadoEmpresa(node)
        },
        layout: this.rutils.layout
      }
    ];
  }

  criaTabelaNode(node) {
    if (node.entidade === 'pessoa') {
      return this.getTabelaNodePessoa(node);
    } else if (node.entidade === 'empresa') {
      return this.getTabelaNodeEmpresa(node);
    } else if (node.entidade === 'telefone') {
      return this.getTabelaNodeTelefone(node);
    } else {
      return 'Entidade inválida';
    }
  }

  private criaTabelaVinculosPessoa(vinculos) {
    const headerTabela = [['Nome', 'CPF', 'Data Nascimento', 'Relacionamento']];
    const corpoTabela = vinculos.map(vinculo => {
      return [
        (vinculo.nome)            ? vinculo.nome : '',
        (vinculo.cpf)             ? this.utils.formataDado(vinculo.cpf, '###.###.###-##') : '',
        (vinculo.dataNascimento)  ? this.utils.formataData(vinculo.dataNascimento) : '',
        (vinculo.relacao)         ? vinculo.relacao : '',
      ];
    });

    return this.rutils.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoVinculosPessoa(vinculos) {
    if (!vinculos || vinculos.length === 0) { return null; }

    return [
      { text: `Possíveis vínculos encontrados com Pessoas Físicas`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          body: this.criaTabelaVinculosPessoa(vinculos)
        },
        layout: this.rutils.layout
      }
    ];
  }

  private criaTabelaVinculosEmpresa(vinculos) {
    const headerTabela = [['Razão Social', 'CNPJ', 'Nome Fantasia', 'Relacionamento']];
    const corpoTabela = vinculos.map(vinculo => {
      return [
        (vinculo.razaoSocial)   ? vinculo.razaoSocial : '',
        (vinculo.cnpj)          ? this.utils.formataDado(vinculo.cnpj, '##.###.###/####-##') : '',
        (vinculo.nomeFantasia)  ? vinculo.nomeFantasia : '',
        (vinculo.relacao)       ? vinculo.relacao : '',
      ];
    });

    return this.rutils.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  private criaTabelaVinculosTelefone(vinculos) {
    const headerTabela = [['Telefone', 'Relacionamento']];
    const corpoTabela = vinculos.map(vinculo => {
      return [
        (vinculo.telefone)  ? vinculo.telefone : '',
        (vinculo.relacao)   ? vinculo.relacao : '',
      ];
    });

    return this.rutils.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  private criaTabelaVinculosOrgaoPublico(vinculos) {
    const headerTabela = [['Órgão Público', 'Relacionamento', 'De', 'A']];
    const corpoTabela = vinculos.map(vinculo => {
      return [
        (vinculo.uGestora)    ? vinculo.uGestora : '',
        (vinculo.relacao)     ? vinculo.relacao : '',
        (vinculo.pOcorrencia) ? vinculo.pOcorrencia : '',
        (vinculo.uOcorrencia) ? vinculo.uOcorrencia : '',
      ];
    });

    return this.rutils.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  private criaTabelaVinculosEndereco(vinculos) {
    const headerTabela = [['Logradouro', 'Numero', 'CEP', 'Municipio', 'UF', 'Relacionamento']];
    const corpoTabela = vinculos.map(vinculo => {
      return [
        (vinculo.logradouro)  ? vinculo.logradouro  : '',
        (vinculo.numero)      ? vinculo.numero      : '',
        (vinculo.cep)         ? vinculo.cep         : '',
        (vinculo.municipio)   ? vinculo.municipio   : '',
        (vinculo.uf)          ? vinculo.uf          : '',
        (vinculo.relacao)     ? vinculo.relacao          : '',
      ];
    });

    return this.rutils.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
  }

  criaSecaoVinculosEmpresa(vinculos) {
    if (!vinculos || vinculos.length === 0) { return null; }

    return [
      { text: `Possíveis vínculos encontrados com Pessoas Jurídicas`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          body: this.criaTabelaVinculosEmpresa(vinculos)
        },
        layout: this.rutils.layout
      }
    ];
  }

  criaSecaoVinculosTelefone(vinculos) {
    if (!vinculos || vinculos.length === 0) { return null; }

    return [
      { text: `Possíveis vínculos encontrados com Telefones`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: ['*', 'auto'],
          body: this.criaTabelaVinculosTelefone(vinculos)
        },
        layout: this.rutils.layout
      }
    ];
  }

  criaSecaoVinculosOrgaoPublico(vinculos) {
    if (!vinculos || vinculos.length === 0) { return null; }

    return [
      { text: `Possíveis vínculos encontrados com Órgão Públicos`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          body: this.criaTabelaVinculosOrgaoPublico(vinculos)
        },
        layout: this.rutils.layout
      }
    ];
  }

  criaSecaoVinculosEndereco(vinculos) {
    if (!vinculos || vinculos.length === 0) { return null; }

    return [
      { text: `Possíveis vínculos encontrados com Endereços`, style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: this.criaTabelaVinculosEndereco(vinculos)
        },
        layout: this.rutils.layout
      }
    ];
  }

  criaTabelaVinculos(nodes) {
    const pessoa   = nodes.filter(v => v.entidade === 'pessoa');
    const empresa  = nodes.filter(v => v.entidade === 'empresa');
    const telefone = nodes.filter(v => v.entidade === 'telefone');
    const orgao    = nodes.filter(v => v.entidade === 'orgaopublico');
    const endereco = nodes.filter(v => v.entidade === 'endereco');

    return [
      this.criaSecaoVinculosPessoa(pessoa),
      this.criaSecaoVinculosEmpresa(empresa),
      this.criaSecaoVinculosTelefone(telefone),
      this.criaSecaoVinculosOrgaoPublico(orgao),
      this.criaSecaoVinculosEndereco(endereco),
    ];
  }

  criaCorpo(dados) {
    if (!dados || dados.length === 0) { return null; }

    return dados.map((n: any) => {
      const node     = n.alvo;
      const vinculos = n.vinculos;

      const tabelaNode     = this.criaTabelaNode(node);
      const tabelaVinculos = this.criaTabelaVinculos(vinculos);

      return [
        tabelaNode,
        tabelaVinculos
      ];
    });
  }

  relatorioRelacionamento(dados, grupo = undefined, filename, url) {
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
