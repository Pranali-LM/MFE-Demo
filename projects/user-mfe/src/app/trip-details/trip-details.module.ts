import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@app-shared/shared.module';

import { TripDetailsComponent } from './pages/trip-details/trip-details.component';
import { TripDetailsRoutingModule } from './trip-details-routing.module';

import { EventsTableComponent } from './components/events-table/events-table.component';
import { MapTooltipComponent } from './components/map-tooltip/map-tooltip.component';
import { TripSettingsComponent } from './components/trip-settings/trip-settings.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TripDetailsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [TripDetailsComponent, MapTooltipComponent, EventsTableComponent, TripSettingsComponent],
  entryComponents: [MapTooltipComponent],
})
export class TripDetailsModule {}
