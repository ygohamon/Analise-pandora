import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-rif',
    template: `
    <div class="ui-g ui-fluid">

        <div class="ui-g-12" style="text-align:center; font-size: 18px; font-weight: 600; padding-top: 25px;">
            Existe Relatório(s) de Inteligência Financeira acerca da pessoa em questão.
        </div>

        <div class="ui-g-12" *ngFor="let dado of data" style="padding-top: 40px; font-size: 14px; font-weight: 600; padding-bottom: 20px;">
            Número de RIFs existentes: <span style="font-size: 20px;">{{dado.qtd}}</span>
        </div>

        <div class="ui-g-12">
            <p-panel header="Aviso">
                <ul>
                    <li style="padding-top:15px; text-align: justify;">
                        <span>Para ter acesso aos conteúdos do RIF, solicite-os através do <span style="font-weight: 600;">Integra</span>.</span>
                    </li>
                    <li style="padding-top:10px; text-align: justify;">
                        O Integra é uma ferramenta utilizada para requisição de informações junto ao <span>Núcleo de
                        Gestão do Conhecimento e Segurança Institucional</span> do <span>Ministério Público da Paraíba</span>.
                    </li>
                </ul>
                <br>
            </p-panel>
        </div>
    </div>
    `
})
export class RIFComponent {

    @Input() tipo;
    @Input() data;

    constructor() {}
}
