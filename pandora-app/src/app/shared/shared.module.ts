import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';

import {InputTextModule} from 'primeng/inputtext';
import {MultiSelectModule} from 'primeng/multiselect';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {DataViewModule} from 'primeng/dataview';
import {InputMaskModule} from 'primeng/inputmask';
import {TooltipModule} from 'primeng/tooltip';
import {CaptchaModule} from 'primeng/captcha';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {MessagesModule} from 'primeng/messages';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {CarouselModule} from 'primeng/carousel';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {GMapModule} from 'primeng/gmap';
import {SliderModule} from 'primeng/slider';
import {TabViewModule} from 'primeng/tabview';
import {ProgressBarModule} from 'primeng/progressbar';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ChartModule} from 'primeng/chart';
import {SplitButtonModule} from 'primeng/splitbutton';
import {CalendarModule} from 'primeng/calendar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FieldsetModule } from 'primeng/fieldset';
import {AccordionModule} from 'primeng/accordion';
import {MenuModule} from 'primeng/menu';
import {MenubarModule} from 'primeng/menubar';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import {SpinnerModule} from 'primeng/spinner';

import {TipologiaDatalistComponent} from './../shared/apresentacao/tipologia.datalist.component';
import { MensagemErroComponent } from './../shared/mensagemerro.component';
import { PandoraDataviewComponent } from './apresentacao/base/pandora.dataview.component';
import { CamposBuscaComponent } from './camposbusca.component';

import { JwtHttpInterceptor } from '../services/auth/http.interceptor';
import { PandoraTableModule } from './apresentacao/base/pandora.table.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [
    MensagemErroComponent,
    PandoraDataviewComponent,
    TipologiaDatalistComponent,
    CamposBuscaComponent,
  ],
  imports: [
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
    CommonModule,

    InputTextModule,
    SpinnerModule,
    ButtonModule,
    PanelModule,
    TableModule,
    PandoraTableModule,
    // SharedModule,
    InputMaskModule,
    TooltipModule,
    CaptchaModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    AccordionModule,
    MessagesModule,
    OverlayPanelModule,
    CarouselModule,
    InputTextareaModule,
    GMapModule,
    SliderModule,
    MultiSelectModule,
    TabViewModule,
    DataViewModule,
    // FileUploadModule,
    ProgressBarModule,
    AutoCompleteModule,
    ChartModule,
    SplitButtonModule,
    CalendarModule,
    SelectButtonModule,
    CheckboxModule,
    StepsModule,
    RadioButtonModule,
    FieldsetModule,
    MenuModule,
    MenubarModule,
    DynamicDialogModule,
    PaginatorModule,

    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
  ],
  exports: [
    CommonModule,
    FormsModule,

    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    InputTextModule,
    SpinnerModule,
    ButtonModule,
    PanelModule,
    TableModule,
    PandoraTableModule,
    // SharedModule,
    InputMaskModule,
    TooltipModule,
    CaptchaModule,
    ToastModule,
    AccordionModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    MessagesModule,
    OverlayPanelModule,
    CarouselModule,
    InputTextareaModule,
    GMapModule,
    SliderModule,
    MultiSelectModule,
    TabViewModule,
    ProgressBarModule,
    AutoCompleteModule,
    NgxEchartsModule,
    ChartModule,
    SplitButtonModule,
    CalendarModule,
    ScrollPanelModule,
    SelectButtonModule,
    CheckboxModule,
    StepsModule,
    RadioButtonModule,
    DataViewModule,
    FieldsetModule,
    MenuModule,
    MenubarModule,
    DynamicDialogModule,
    PaginatorModule,

    CamposBuscaComponent,
    MensagemErroComponent,
    TipologiaDatalistComponent,
    PandoraDataviewComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtHttpInterceptor, multi: true },
  ]
})
export class AppSharedModule {}
