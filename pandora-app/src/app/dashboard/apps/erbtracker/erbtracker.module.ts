import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {ERBTrackerComponent} from './erbtracker.component';
import {AppSharedModule} from '../../../shared/shared.module';
import { UtilsService } from '../../../services/common/utils.service';

const routes: Routes = [
    { path: '', component: ERBTrackerComponent}
];


@NgModule({
    declarations: [
        ERBTrackerComponent,
    ],
    imports: [
        AppSharedModule,
        RouterModule.forChild(routes)
    ],
    providers: [
      UtilsService
    ]
})
export class ERBTrackerModule {}
