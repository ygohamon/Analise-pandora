import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExternoAltoRiscoComponent } from './altorisco/altorisco.component';
import { ExternoFolhaPagamentoComponent } from './folhapagamento/folhapagamento.component';
import { ExternoPadroesContratacaoComponent } from './padroescontratacao/padroescontratacao.component';

import { ExternoRoutesModule } from './externo.routes';
import { AppSharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ExternoPadroesContratacaoComponent,
    ExternoFolhaPagamentoComponent,
    ExternoAltoRiscoComponent
  ],
  imports: [
    AppSharedModule,
    ExternoRoutesModule,
  ],
  providers: [
  ]
})
export class ExternoModule {}
