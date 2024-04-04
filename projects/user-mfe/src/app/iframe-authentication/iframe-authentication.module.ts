import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IframeAuthenticationRoutingModule } from './iframe-authentication-routing.module';
import { GeotabLoginComponent } from './pages/geotab-login/geotab-login.component';
import { IframeLoginComponent } from './pages/iframe-login/iframe-login.component';
import { IframeImplicitLoginComponent } from './pages/iframe-implicit-login/iframe-implicit-login.component';
import { UnauthorizedErrorPageComponent } from './pages/unauthorized-error-page/unauthorized-error-page.component';
import { RsaSsoLoginComponent } from './pages/rsa-sso-login/rsa-sso-login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

@NgModule({
  imports: [CommonModule, IframeAuthenticationRoutingModule, MatProgressSpinnerModule],
  declarations: [
    IframeLoginComponent,
    IframeImplicitLoginComponent,
    UnauthorizedErrorPageComponent,
    RsaSsoLoginComponent,
    GeotabLoginComponent,
    PageNotFoundComponent,
  ],
})
export class IframeAuthenticationModule {}
