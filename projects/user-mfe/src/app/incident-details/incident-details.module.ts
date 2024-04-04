import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncidentDetailsRoutingModule } from './incident-details-routing.module';
import { IncidentDetailsComponent } from './pages/incident-details/incident-details.component';
import { SharedModule } from '@app-shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IncidentStatsComponent } from './components/incident-stats/incident-stats.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [IncidentDetailsComponent, IncidentStatsComponent],
  imports: [
    CommonModule,
    SharedModule,
    IncidentDetailsRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class IncidentDetailsModule {}
