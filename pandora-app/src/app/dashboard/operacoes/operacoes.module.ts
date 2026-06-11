import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadastroEnderecoComponent } from './cadastroendereco/cadastro.endereco.component';
import { CadastroTelefoneComponent } from './cadastrotelefone/cadastro.telefone.component';

import { OperacoesRoutesModule } from './operacoes.routes';
import { AppSharedModule } from '../../shared/shared.module';

import { CadastroService } from '../../services/cadastro/cadastro.service';

@NgModule({
    declarations: [
        CadastroEnderecoComponent,
        CadastroTelefoneComponent,
    ],
    imports: [
        AppSharedModule,
        OperacoesRoutesModule,
    ],
    providers: [
        CadastroService,
    ]
})
export class OperacoesModule {}
