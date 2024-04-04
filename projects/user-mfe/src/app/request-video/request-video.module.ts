import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestVideoRoutingModule } from './request-video-routing.module';
import { RequestVideoComponent } from './pages/request-video/request-video.component';
import { SharedModule } from '@app-shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RequestConfirmationComponent } from './components/request-confirmation/request-confirmation.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [RequestVideoComponent, RequestConfirmationComponent],
  imports: [
    CommonModule,
    SharedModule,
    RequestVideoRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class RequestVideoModule {}
