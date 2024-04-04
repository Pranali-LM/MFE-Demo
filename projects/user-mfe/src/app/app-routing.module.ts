import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@app-core/guards/auth/auth.guard';
import { EulaConsentGuard } from '@app-core/guards/eula-consent/eula-consent.guard';
// import { CLIENT_CONFIG } from '@config/config';
import { LiveTelematicsResolverService } from './resolvers/live-telematics-resolver/live-telematics-resolver.service';
import { AllEventsResolver } from './resolvers/all-events/all-events.resolver';
// import { CustomEventsResolver } from './resolvers/custom-events/custom-events.resolver';
// import { CoachingConfigResolver } from './resolvers/coaching-config/coaching-config.resolver';
// import { GetAssetEntityTagsResolver } from './resolvers/get-asset-entity-tags/get-asset-entity-tags.resolver';

export const canActivateGuards = [AuthGuard, EulaConsentGuard];

export const routes: Routes = [
  // {
  //   path: 'trips',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //   },
  //   loadChildren: () => import('@app-trips/trips.module').then((m) => m.TripsModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'safety-events',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-incidents/incidents.module').then((m) => m.IncidentsModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'configurations',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     customEvents: CustomEventsResolver,
  //     allEvents: AllEventsResolver,
  //   },
  //   loadChildren: () => import('@app-asset-config/asset-configuration.module').then((m) => m.AssetConfigurationModule),
  //   canActivate: canActivateGuards,
  // },
  // {

  //   path: 'drivers',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-driver-management/driver-management.module').then((m) => m.DriverManagementModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'live-view',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     allAssetEntityTags: GetAssetEntityTagsResolver,
  //   },
  //   loadChildren: () => import('@app-live-view/live-view.module').then((m) => m.LiveViewModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'coaching',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-coaching/coaching.module').then((m) => m.CoachingModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'challenges',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-challenged/challenged.module').then((m) => m.ChallengedModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'video-requests',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-dvr/dvr.module').then((m) => m.DvrModule),
  //   canActivate: canActivateGuards,
  // },
  {
    path: 'user-management',
    resolve: {
      liveTelematicsEnabled: LiveTelematicsResolverService,
      allEvents: AllEventsResolver,
    },
    loadChildren: () => import('@app-user-management/user-management.module').then((m) => m.UserManagementModule),
    // canActivate: canActivateGuards,
  },
  // {
  //   path: 'reports',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //   },
  //   loadChildren: () => import('@app-reports/reports.module').then((m) => m.ReportsModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'assets',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //   },
  //   loadChildren: () => import('@app-assets/assets.module').then((m) => m.AssetsModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'diagnostics',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //   },
  //   loadChildren: () => import('@app-diagnostics/diagnostics.module').then((m) => m.DiagnosticsModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'trip-details',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-trip-details/trip-details.module').then((m) => m.TripDetailsModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: 'request-video',
  //   resolve: {
  //     liveTelematicsEnabled: LiveTelematicsResolverService,
  //     allEvents: AllEventsResolver,
  //     coachingConfig: CoachingConfigResolver,
  //   },
  //   loadChildren: () => import('@app-request-video/request-video.module').then((m) => m.RequestVideoModule),
  //   canActivate: canActivateGuards,
  // },
  // {
  //   path: '',
  //   redirectTo: CLIENT_CONFIG.wildcardRoute,
  //   pathMatch: 'full',
  // },
  {
    path: '**',
    redirectTo: 'user-management',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
