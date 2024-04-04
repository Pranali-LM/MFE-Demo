import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TripDetailsComponent } from '@app-trip-details/pages/trip-details/trip-details.component';
import { LiveTelematicsResolverService } from '../resolvers/live-telematics-resolver/live-telematics-resolver.service';

const routes: Routes = [
  {
    path: '',
    resolve: {
      liveTelematicsEnabled: LiveTelematicsResolverService,
    },
    component: TripDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripDetailsRoutingModule {}
