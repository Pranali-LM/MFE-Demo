import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app-shared/shared.module';
import { LiveViewRoutingModule } from './live-view-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { LiveViewMapComponent } from './components/live-view-map/live-view-map.component';
import { LiveAssetMarkerPopupComponent } from './components/live-asset-marker-popup/live-asset-marker-popup.component';
import { DistancePipe } from '@app-shared/pipes/distance/distance.pipe';
import { LivestreamService } from '@app-core/services/livestream/livestream.service';
import { LiveViewComponent } from './pages/live-view/live-view.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from '@app-shared/reducers';
import { MapboxLiveviewComponent } from './components/mapbox-liveview/mapbox-liveview.component';
import { MapTooltipComponent } from './components/map-tooltip/map-tooltip.component';
import { AssetDetailsModalComponent } from './components/asset-details-modal/asset-details-modal.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    LiveViewComponent,
    LiveViewMapComponent,
    LiveAssetMarkerPopupComponent,
    MapboxLiveviewComponent,
    MapTooltipComponent,
    AssetDetailsModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    LiveViewRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    StoreModule.forFeature('LiveView', reducers),
  ],
  providers: [DistancePipe, LivestreamService],
  entryComponents: [LiveAssetMarkerPopupComponent],
})
export class LiveViewModule {}
