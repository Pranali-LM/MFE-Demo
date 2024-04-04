import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageGuard } from '@app-core/guards/landing-page/landing-page.guard';

import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { FleetManagerLoginComponent } from './pages/fleet-manager-login/fleet-manager-login.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { MasterLoginComponent } from './pages/master-login/master-login.component';

// TODO: change this to hyphen seperated names
// callback => fleet-manager-login
// tsplogin => master-login
// Need to update cognito allowed callback URLs
const routes: Routes = [
  {
    path: 'login',
    canActivate: [LandingPageGuard],
    component: LandingPageComponent,
  },
  {
    path: 'callback',
    component: FleetManagerLoginComponent,
  },
  {
    path: 'tsplogin',
    component: MasterLoginComponent,
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
