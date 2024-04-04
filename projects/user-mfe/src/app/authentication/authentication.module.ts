import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedModule } from '@app-shared/shared.module';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { FleetManagerLoginComponent } from './pages/fleet-manager-login/fleet-manager-login.component';
import { MasterLoginComponent } from './pages/master-login/master-login.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { EulaComponent } from './pages/eula/eula.component';
import { EulaDocumentComponent } from './pages/eula-document/eula-document.component';

@NgModule({
  imports: [CommonModule, AuthenticationRoutingModule, SharedModule],
  declarations: [
    MasterLoginComponent,
    FleetManagerLoginComponent,
    AdminLoginComponent,
    LandingPageComponent,
    EulaComponent,
    EulaDocumentComponent,
  ],
  entryComponents: [EulaComponent],
})
export class AuthenticationModule {}
