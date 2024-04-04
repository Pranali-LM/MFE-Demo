// Core modules
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// External modules
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { StoreModule } from '@ngrx/store';


import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// App modules
// import { HomeModule } from '@app-home/home.module';
import { HomeModule } from '@app-home/home.module';
import { CoreModule } from '@app-core/core.module';
import { SharedModule } from '@app-shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

// components
import { AppComponent } from './app.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServiceWorkerModule } from '@angular/service-worker';

import { authModules } from '@config/modules';
import { environment } from '@env/environment';
import { metaReducers } from './reducers';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LeafletModule.forRoot(),
    StoreModule.forRoot({}, { metaReducers }),
    MatProgressSpinnerModule,
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    CoreModule,
    SharedModule,
    ...authModules,
    HomeModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
