import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ApiResponse } from './../../typings/login.typing';
import { environment } from './../../../environments/environment';

import { AuthService } from './../../services/auth/auth.service';
import { UtilsService } from '../common/utils.service';

@Injectable()
export class RelacionamentosService {




  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private auth: AuthService
  ) {}

  /**
   *
   * @param lista
   */
  // getRelacionamentosLista(lista: Array<string>, tipobusca): Observable<ApiResponse> {
  getRelacionamentosLista(lista: Array<string>, tipobusca): Observable<ApiResponse> {
    const l = lista.join(',');

    const option = this.auth.criaCabecalhoSeguranca(null);
    return this.http.get<ApiResponse>(`${environment.API_URL}/relacionamentos/lista/${l}`, option);
  }

  /**
   *
   * @param lista
   */
  getRelacionamentosPessoa(cpf: string, tipobusca: string): Observable<ApiResponse> {

    const _cpf = this.utils.checaCPF(cpf);
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('cpf', _cpf);
    option.params = option.params.set('tipobusca', tipobusca);

    return this.http.get<ApiResponse>(`${environment.API_URL}/relacionamentos/pessoa`, option);
  }

  /**
   *
   * @param lista
   */
  getRelacionamentosTelefone(telefone: string, tipobusca: string): Observable<ApiResponse> {

    const _telefone = telefone.trim().replace(/[^0-9]/g,'');
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('telefone', _telefone);
    option.params = option.params.set('tipobusca', tipobusca);

    return this.http.get<ApiResponse>(`${environment.API_URL}/relacionamentos/telefone`, option);
  }

  /**
   *
   * @param lista
   */
  getRelacionamentosEndereco(logradouro: string, numero: string, municipio: string, tipobusca: string): Observable<ApiResponse> {

    const option = this.auth.criaCabecalhoSeguranca(null);
    const endereco = `${logradouro}|${numero}|${municipio}`;

    option.params = option.params.set('endereco', endereco);
    option.params = option.params.set('tipobusca', tipobusca);

    return this.http.get<ApiResponse>(`${environment.API_URL}/relacionamentos/endereco`, option);
  }

  /**
   *
   * @param lista
   */
  getRelacionamentosOrgaoPublico(cdugestora: string, anoinicial: string, anofinal: string, tipobusca: string): Observable<ApiResponse> {

    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('cdugestora', cdugestora);
    option.params = option.params.set('anoinicial', '2016');
    option.params = option.params.set('anofinal', '2017');

    return this.http.get<ApiResponse>(`${environment.API_URL}/relacionamentos/orgao`, option);
  }

  /**
   *
   * @param lista
   */
  getRelacionamentosEmpresa(cnpj: string, tipobusca: string): Observable<ApiResponse> {

    const _cnpj = this.utils.checaCNPJ(cnpj);
    const option = this.auth.criaCabecalhoSeguranca(null);

    option.params = option.params.set('cnpj', _cnpj);
    option.params = option.params.set('tipobusca', tipobusca);

    return this.http.get<ApiResponse>(`${environment.API_URL}/relacionamentos/empresa`, option);
  }

  /**
   * Define o label do node.
   * @param n Node
   */
  getNodeLabel(n) {
    
    if (n.entidade === 'pessoa') {
      const nomeFiltrado = this.utils.removeStopWords(n.nome);
      const nome = (nomeFiltrado.length > 1) ? `${nomeFiltrado[0]} ${nomeFiltrado[nomeFiltrado.length-1]}` : nomeFiltrado[0];
      const icon = '\uf007';
      

      return nome;
      // return  icon + '\n' + nome;
    } else if (n.entidade === 'empresa') {
      return this.utils.removeStopWords(n.razaoSocial).splice(0, 2).join(' ');
    } else if (n.entidade === 'telefone') {
      return n.telefone;
    } else if (n.entidade === 'endereco') {
      return n.logradouro + ', ' + n.numero;
    } else if (n.entidade === 'orgaopublico') {
      return n.uGestora;
    } else {
      return 'Entidade não mapeada';
    }
  }

  /**
   *
   * @param data
   */
  getTabelaHtmlPessoa(data) {
      return `
        <table>
            <tr>
                <td>CPF</td><td>${this.utils.formataDado(data.cpf, '###.###.###-##')}</td>
            </tr>
            <tr>
                <td>Nome</td><td>${data.nome}</td>
            </tr>
            <tr>
                <td>Sexo</td><td>${data.sexo}</td>
            </tr>
            <tr>
                <td>Data Nascimento</td><td>${this.utils.formataData(data.dataNascimento)}</td>
            </tr>
            <tr>
                <td>Mãe</td><td>${data.nomeMae}</td>
            </tr>
            <tr>
                <td>Pai</td><td>${data.nomePai}</td>
            </tr>
            <tr>
                <td>Município</td><td>${data.municipio}</td>
            </tr>
            <tr>
                <td>UF</td><td>${data.uf}</td>
            </tr>
        </table>
      `;
  }

  /**
   *
   * @param data
   */
  getTabelaHtmlEmpresa(data) {
      return `
        <table>
            <tr>
                <td>CNPJ</td><td>${this.utils.formataDado(data.cnpj, '##.###.###/####-##')}</td>
            </tr>
            <tr>
                <td>Razão Social</td><td>${data.razaoSocial}</td>
            </tr>
            <tr>
                <td>Nome Fantasia</td><td>${data.nomeFantasia}</td>
            </tr>
            <tr>
                <td>Data Início Atividade</td><td>${this.utils.formataData(data.dataInicioAtividade)}</td>
            </tr>
            <tr>
                <td>Município</td><td>${data.municipio}</td>
            </tr>
            <tr>
                <td>UF</td><td>${data.uf}</td>
            </tr>
        </table>
      `;
  }

  /**
   *
   * @param data
   */
  getTabelaHtmlEndereco(data) {
      return `
        <table>
            <tr>
                <td>Logradouro</td><td>${data.tipoLogradouro} ${data.logradouro}</td>
            </tr>
            <tr>
                <td>Número</td><td>${data.numero}</td>
            </tr>
            <tr>
                <td>Complemento</td><td>${data.complemento}</td>
            </tr>
            <tr>
                <td>Bairro</td><td>${data.bairro}</td>
            </tr>
            <tr>
                <td>CEP</td><td>${this.utils.formataDado(data.cep, '#####-###')}</td>
            </tr>
            <tr>
                <td>Município</td><td>${data.municipio}</td>
            </tr>
            <tr>
                <td>UF</td><td>${data.uf}</td>
            </tr>
        </table>
      `;
  }
  

  /**
   *
   * Referência: https://js.cytoscape.org/#layouts
   */
  getLayoutParam(layout: string = null) {
    // return {
    //     name: 'cola',
    //     nodeSpacing: 5,
    //     edgeLengthVal: 45,
    //     animate: true,
    //     randomize: false,
    //     maxSimulationTime: 3000
    // };

    if (layout === 'cola') {
      return {
        name: 'cola',
        // animate: true,
        refresh: 20,
        convergenceThreshold: 100,
        maxSimulationTime: 1000,
        nodeSpacing: 5,
        
      }
    } else if (layout === 'cose') {
      return {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    } else if (layout === 'random') {
      return {
        name: 'random'
      }
    } else if (layout === 'grid') {
      return {
        name: 'grid'
      }
    } else if (layout === 'circle') {
      return {
        name: 'circle'
      }
    } else if (layout === 'concentric') {
      return {
        name: 'concentric'
      }
    } else if (layout === 'breadthfirst') {
      return {
        name: 'breadthfirst',
        // directed: true,
        padding: 10
      }
    } else {
      return {
          name: 'cola',
          //animate: true,
          convergenceThreshold: 100,
          maxSimulationTime: 1000
      };
    }
  }

  /**
   *
   */
  getStyleCytoscape() {
    return [
      {
        'selector': 'core',
        'style': {
            'selection-box-color': '#AAD8FF',
            'selection-box-border-color': '#8BB0D0',
            'selection-box-opacity': '0.5',
           // 'selection-box-label'
        }
      },
      {
        'selector': 'node',
        'style': {
          'z-index': '10',
          'background-opacity': 0,
          'border-opacity': 0
        }
      },
      // {
      //   'selector': 'node[?pageRank]',
      //   'style': {
      //       'width': 'mapData(pageRank, 0, 0.3, 50, 100)',
      //       'height': 'mapData(pageRank, 0, 0.3, 50, 100)',
      //   }
      // },
      {
        'selector': 'node[?alvo]',
        'style': {
            'opacity': '1'
        }
      },
      {
        'selector': 'node:selected',
        'style': {
          'border-width': '6px',
          'border-color': '#AAD8FF',
          'border-opacity': '0.5',
          'background-color': '#77828C',
          'text-outline-color': '#77828C',

        }
      },
      {
        'selector': 'edge',
        'style': {
            'curve-style': 'haystack',
            'width': 1,
            
        }
      },
      {
        'selector': 'edge[?mostra]',
        'style': {
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'control-point-step-size': 40,
          'edge-distances': 'node-position',
          'label': 'data(relacao)',
          'font-size': '8px',
          'opacity': '1',
          'text-wrap': 'anywhere',
          'text-valignBox': 'center',
          'text-halignBox': 'center',
          'padding': '25px',
          'text-transform': 'none',
          'text-overflow-wrap': 'anywhere',
          'text-justification': 'center',
        }
      },
      {
        'selector': '.hide',
        'style': {
          'display': 'none',
        }
      },
    ];
  }

  montaHtmlNode(data, icon="question") {
    const hide = (data.hide) ? 'cy-hide': '';
    const alvo_estilo = (data.alvo) ? 'cy-node-icon-alvo': '';
    const pesquisado_estilo = (data.pesquisado) ? 'cy-node-icon-pesquisado': '';
    const cor_estilo = (data.colorido) ? `cy-node-icon-${icon}`: '';

    return `
    <div class="cy-node ${hide}">
      <p class="cy-node-icon ${alvo_estilo} ${cor_estilo} ${pesquisado_estilo}"><i class="fa fa-${icon}"></i></p>
      <p class="cy-node-label">${data.label}</p>
    </div>`;
  }

  getHtmlStyle() {
    return [
      {
        query: 'node[entidade="pessoa"]',
        tpl: (data) => this.montaHtmlNode(data, 'user')
      },
      {
        query: 'node[entidade="empresa"]',
        tpl: (data) => this.montaHtmlNode(data, 'building')
      },
      {
        query: 'node[entidade="telefone"]',
        tpl: (data) => this.montaHtmlNode(data, 'phone')
      },
      {
        query: 'node[entidade="orgaopublico"]',
        tpl: (data) => this.montaHtmlNode(data, 'university')
      },
      {
        query: 'node[entidade="endereco"]',
        tpl: (data) => this.montaHtmlNode(data, 'road')
      },
    ];
  }

}
