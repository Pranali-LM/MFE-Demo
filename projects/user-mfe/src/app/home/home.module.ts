import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@app-shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';

import { DriverListComponent } from '@app-home/components/driver-list/driver-list.component';
import { FleetStatsComponent } from '@app-home/components/fleet-stats/fleet-stats.component';
import { IncidentTrendComponent } from './components/incident-trend/incident-trend.component';

import { DistancePipe } from '@app-shared/pipes/distance/distance.pipe';
import { StoreModule } from '@ngrx/store';
import { FleetHighlightsComponent } from './components/fleet-highlights/fleet-highlights.component';

import { reducers } from './reducers';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HomeComponent } from './pages/home/home.component';
import { PageFilterComponent } from './components/page-filter/page-filter.component';
import { AnnouncementBannerComponent } from './components/announcement-banner/announcement-banner.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    StoreModule.forFeature('home', reducers),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [
    HomeComponent,
    FleetStatsComponent,
    DriverListComponent,
    IncidentTrendComponent,
    PageFilterComponent,
    FleetHighlightsComponent,
    AnnouncementBannerComponent,
  ],
  providers: [DistancePipe],
})
export class HomeModule {}
