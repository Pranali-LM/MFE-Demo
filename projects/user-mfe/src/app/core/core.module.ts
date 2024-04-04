import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CacheInterceptorService } from './interceptors/cacheInterceptor.service';
import { HttpInterceptorService } from './interceptors/httpInterceptor.service';
import { AnnouncementService } from './services/announcement/announcement.service';
import { HttpCacheService } from './services/cache/cache.service';
import { DataService } from './services/data/data.service';
import { DateService } from './services/date/date.service';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts/keyboard-shortcuts.service';
import { MapService } from './services/map/map.service';
import { SnackBarService } from './services/snackbar/snack-bar.service';
import { StorageService } from './services/storage/storage.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  imports: [
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptorService,
      multi: true,
    },
    StorageService,
    DateService,
    MapService,
    HttpCacheService,
    DataService,
    SnackBarService,
    AnnouncementService,
    KeyboardShortcutsService,
  ],
})
export class CoreModule {}
