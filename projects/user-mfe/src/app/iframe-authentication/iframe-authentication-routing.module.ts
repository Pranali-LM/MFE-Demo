import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeotabLoginComponent } from './pages/geotab-login/geotab-login.component';
import { IframeLoginComponent } from './pages/iframe-login/iframe-login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { UnauthorizedErrorPageComponent } from './pages/unauthorized-error-page/unauthorized-error-page.component';
import { IframeImplicitLoginComponent } from './pages/iframe-implicit-login/iframe-implicit-login.component';
import { RsaSsoLoginComponent } from './pages/rsa-sso-login/rsa-sso-login.component';

const routes: Routes = [
  {
    path: 'iframe-login',
    component: IframeLoginComponent,
  },
  {
    path: 'geotab-login',
    component: GeotabLoginComponent,
  },
  {
    path: 'page-not-found',
    component: PageNotFoundComponent,
  },
  {
    path: 'iframe-implicit-login',
    component: IframeImplicitLoginComponent,
  },
  {
    path: 'rsa-sso-login',
    component: RsaSsoLoginComponent,
  },
  {
    path: 'unauthorized-error',
    component: UnauthorizedErrorPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IframeAuthenticationRoutingModule {}
