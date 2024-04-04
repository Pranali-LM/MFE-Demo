import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@app-shared/shared.module';

import { DriverManagementRoutingModule } from './driver-management-routing.module';
import { DriverManagementComponent } from './pages/driver-management/driver-management.component';

import { DriverHighlightsComponent } from '@app-driver-management/components/driver-highlights/driver-highlights.component';
import { DriverQueryResultComponent } from '@app-driver-management/components/driver-query-result/driver-query-result.component';
import { DriverQueryComponent } from '@app-driver-management/components/driver-query/driver-query.component';
import { StoreModule } from '@ngrx/store';
import { DriverEnrollmentComponent } from './components/driver-enrollment/driver-enrollment.component';
import { DriverImagesComponent } from './components/driver-images/driver-images.component';
import { DriverStatsComponent } from './components/driver-stats/driver-stats.component';
import { EnrollmentFaqComponent } from './components/enrollment-faq/enrollment-faq.component';
import { reducers } from './reducers';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DriverIncidentTrendComponent } from './components/driver-incident-trend/driver-incident-trend.component';
import { AddDriverComponent } from './components/add-driver/add-driver.component';
import { BatchDriverAdditionComponent } from './components/batch-driver-addition/batch-driver-addition.component';
import { CoachingSessionComponent } from './components/coaching-session/coaching-session.component';
import { EndSessionConfirmationComponent } from './components/end-session-confirmation/end-session-confirmation.component';
import { CoachingSummaryComponent } from './components/coaching-summary/coaching-summary.component';
import { CoachableIncidentsComponent } from './components/coachable-incidents/coachable-incidents.component';
import { DriverOverviewComponent } from './components/driver-overview/driver-overview.component';
import { IncidentHightlightsComponent } from './components/incident-hightlights/incident-hightlights.component';
import { CoachingCompleteModalComponent } from './components/coaching-complete-modal/coaching-complete-modal.component';
import { CompletedSessionListComponent } from './components/completed-session-list/completed-session-list.component';
import { CoachingPanelComponent } from './components/coaching-panel/coaching-panel.component';
import { PanicButtonComponent } from './components/panic-button/panic-button.component';
import { LegacyDriverStatsComponent } from './components/legacy-driver-stats/legacy-driver-stats.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DriverManagementRoutingModule,
    StoreModule.forFeature('driver-management', reducers),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [
    DriverManagementComponent,
    DriverQueryComponent,
    DriverQueryResultComponent,
    DriverHighlightsComponent,
    DriverIncidentTrendComponent,
    DriverStatsComponent,
    DriverEnrollmentComponent,
    EnrollmentFaqComponent,
    DriverImagesComponent,
    AddDriverComponent,
    BatchDriverAdditionComponent,
    CoachingSessionComponent,
    EndSessionConfirmationComponent,
    CoachingSummaryComponent,
    CoachableIncidentsComponent,
    DriverOverviewComponent,
    IncidentHightlightsComponent,
    CoachingCompleteModalComponent,
    CompletedSessionListComponent,
    CoachingPanelComponent,
    PanicButtonComponent,
    LegacyDriverStatsComponent,
  ],
  entryComponents: [EnrollmentFaqComponent, DriverImagesComponent],
})
export class DriverManagementModule {}
