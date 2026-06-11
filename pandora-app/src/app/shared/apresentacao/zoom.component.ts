import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { UtilsService } from "src/app/services/common/utils.service";

import * as cytoscape from 'cytoscape';
import nodeHtmlLabel from 'cytoscape-node-html-label';

if (typeof cytoscape('core', 'nodeHtmlLabel') !== 'function') {
  cytoscape.use(nodeHtmlLabel);
}

interface Grafo {
  nodes: any[],
  edges: any[]
}

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.css']
})
export class ZoomComponent implements OnInit, OnDestroy {
  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  @Input() data;

  // Ponteiro para o objeto Cytoscape
  cy;

  // Grafo
  grafo: Grafo;

  // Comprimento das arestas do grafo
  comprimentoArestas: number;

  // Espaçamento dos nós do grafo
  espacamentoNos: number;

  //
  nodesSalvos: any[];
  edgesSalvos: any[];

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.inicializaCytoscape();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  inicializaCytoscape() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: this.getCytoscapeLayout(),
      style: this.getStyleCytoscape(),
      elements: this.getGrafo()
    });

    this.inicializaLabel();
  }

  getCytoscapeLayout() {
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
      gravity: 100,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
      centerGraph: true
    }
  }

  inicializaLabel() {
    this.cy.nodeHtmlLabel(this.getHtmlStyle());
  }

  getGrafo(): Grafo {
    this.nodesSalvos = this.data.filter(n => n.group === 'nodes').map(n => {
      const node: any = {};

      node.data  = n.data;
      node.group = 'nodes';
      node.data.entidade = n.data.label;
      node.data.label = this.getNodeLabel(node.data);

      return node;
    });

    this.edgesSalvos = this.data.filter(e => e.group === 'edges');

    return {
      nodes: this.nodesSalvos,
      edges: this.edgesSalvos
    }
  }

  /**
   * Define o label do node.
   * @param n Node
   */
   getNodeLabel(n) {

    if (n.entidade === 'PessoaFisica') {
      if (n.propriedades.Nome) {
        const nomeFiltrado = this.utils.removeStopWords(n.propriedades['Nome']);
        const nome = (nomeFiltrado.length > 1) ? `${nomeFiltrado[0]} ${nomeFiltrado[nomeFiltrado.length-1]}` : nomeFiltrado[0];

        return nome;
      } else {
        return n.propriedades['CPF'];
      }
    } else if (n.entidade === 'PessoaJuridica') {
      return this.utils.removeStopWords(n.propriedades['Razão Social']).splice(0, 2).join(' ');
    } else if (n.entidade === 'EMail') {
      return n.propriedades['Endereço'];
    } else if (n.entidade === 'OrganizacaoCriminosa') {
      return n.propriedades['Nome'];
    } else {
      return 'Entidade não mapeada';
    }
  }

  montaHtmlNode(data, icon="question") {
    const hide = (data.hide) ? 'cy-hide': '';
    const alvo_estilo = (data.target) ? 'cy-node-icon-alvo': '';
    const pesquisado_estilo = (data.checked !== "N") ? 'cy-node-icon-pesquisado': '';
    const cor_estilo = (data.highlight) ? `cy-node-icon-${icon}`: '';

    return `
    <div class="cy-node ${hide}">
      <p class="cy-node-icon ${alvo_estilo} ${cor_estilo} ${pesquisado_estilo}"><i class="fa fa-${icon}"></i></p>
      <p class="cy-node-label">${data.name}</p>
    </div>`;
  }

  getHtmlStyle() {
    return [
      {
        query: 'node[entidade="EMail"]',
        tpl: (data) => this.montaHtmlNode(data, 'at')
      },
      {
        query: 'node[entidade="OrganizacaoCriminosa"]',
        tpl: (data) => this.montaHtmlNode(data, 'group')
      },
      {
        query: 'node[entidade="PessoaFisica"]',
        tpl: (data) => this.montaHtmlNode(data, 'user')
      },
      {
        query: 'node[entidade="PessoaJuridica"]',
        tpl: (data) => this.montaHtmlNode(data, 'building')
      },
      {
        query: 'node[entidade="endereco"]',
        tpl: (data) => this.montaHtmlNode(data, 'road')
      },
      {
        query: 'node[entidade="telefone"]',
        tpl: (data) => this.montaHtmlNode(data, 'phone')
      }
    ];
  }

  getStyleCytoscape() {
    return [
      {
        'selector': 'core',
        'style': {
            'selection-box-color': '#AAD8FF',
            'selection-box-border-color': '#8BB0D0',
            'selection-box-opacity': '0.5'
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
      {
        'selector': 'node[?target]',
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
            'curve-style': 'straight',
            'width': 1,
        }
      },
      {
        'selector': 'edge[?highlight]',
        'style': {
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'control-point-step-size': 40,
          'edge-distances': 'node-position',
          'label': 'data(label)',
          'font-size': '8px',
          'opacity': '1',
          'text-valign': 'center',
          'text-halign': 'center',
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

  atualizaElementosGrafo() {
    const grafo = this.getGrafo();
    const cytoGraph = this.toCytoscape(grafo);
    const elementos = cytoGraph.nodes.concat(cytoGraph.edges);

    // Adiciona elementos ao grafo
    this.cy.add(elementos);
  }

  toCytoscape(grafo: Grafo) {

    // Gera os nodes no formato do Cytoscape
    const nodes = grafo.nodes.map(n => {
      const node: any = {};

      node.data  = n;
      node.group = 'nodes';
      node.data.label = this.getNodeLabel(n);

      return node;
    });

    // Gera os edges no formato do Cytoscape
    const edges = grafo.edges.map(e => {
        const edge: any = {data: {}};

        const {id, origem, destino, relacao, ...resto} = e;

        edge.group        = 'edges';
        edge.data.source  = e.origem;
        edge.data.target  = e.destino;
        edge.data.relacao = e.relacao;
        edge.data.id      = (e.id) ? e.id : e.origem + '-' + e.destino;

        // Preenche o edge com os dados restantes
        Object.keys(resto).forEach(v => {
          edge.data[v] = resto[v];
        });

        return edge;
    });

    return {nodes, edges}
  }
}
