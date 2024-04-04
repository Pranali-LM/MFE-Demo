import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { canActivateGuards } from '../app-routing.module';
import { LiveTelematicsResolverService } from '../resolvers/live-telematics-resolver/live-telematics-resolver.service';
import { HomeComponent } from './pages/home/home.component';
import { AllEventsResolver } from '../resolvers/all-events/all-events.resolver';
import { CoachingConfigResolver } from '../resolvers/coaching-config/coaching-config.resolver';

const routes: Routes = [
  {
    path: 'home',
    resolve: {
      liveTelematicsEnabled: LiveTelematicsResolverService,
      allEvents: AllEventsResolver,
      coachingConfig: CoachingConfigResolver,
    },
    canActivate: canActivateGuards,
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
