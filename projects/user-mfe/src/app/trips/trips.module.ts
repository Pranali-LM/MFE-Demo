import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@app-shared/shared.module';
import { DurationComponent } from './components/duration/duration.component';
import { TripListComponent } from './components/trip-list/trip-list.component';
import { TripsComponent } from './pages/trips/trips.component';
import { TripsRoutingModule } from './trips-routing.module';

import { DistancePipe } from '@app-shared/pipes/distance/distance.pipe';
import { Duration2Pipe } from '@app-shared/pipes/durationV2/duration2.pipe';
import { ActiveDriversComponent } from './components/active-drivers/active-drivers.component';
import { reducers } from './reducers';

import { NgxMatDateAdap } from '@app-core/services/custom-date-adapters/date-adapter';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EditTripComponent } from './components/edit-trip/edit-trip.component';
import { ActiveDriverDurationComponent } from './components/active-driver-duration/active-driver-duration.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('trips', reducers),
    StoreModule.forFeature('activeDrivers', reducers),
    SharedModule,
    TripsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [
    TripsComponent,
    TripListComponent,
    DurationComponent,
    ActiveDriversComponent,
    EditTripComponent,
    ActiveDriverDurationComponent,
  ],
  providers: [DistancePipe, Duration2Pipe, { provide: NgxMatDateAdapter, useClass: NgxMatDateAdap }],
})
export class TripsModule {}
