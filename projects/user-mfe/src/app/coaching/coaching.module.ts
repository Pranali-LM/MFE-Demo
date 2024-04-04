import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoachingRoutingModule } from './coaching-routing.module';
import { CoachingComponent } from './pages/coaching/coaching.component';
import { HttpLoaderFactory, SharedModule } from '@app-shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { PageFilterComponent } from './components/page-filter/page-filter.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers';
import { CoachableDriversComponent } from './components/coachable-drivers/coachable-drivers.component';
import { SessionsListsComponent } from './components/sessions-lists/sessions-lists.component';
import { SessionDetailsModalComponent } from './components/session-details-modal/session-details-modal.component';

@NgModule({
  declarations: [CoachingComponent, PageFilterComponent, CoachableDriversComponent, SessionsListsComponent, SessionDetailsModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    CoachingRoutingModule,
    StoreModule.forFeature('coaching', reducers),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class CoachingModule {}
