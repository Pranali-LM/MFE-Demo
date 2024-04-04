import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Injectable, Injector, OnDestroy } from '@angular/core';
import { ASSET_MAP_MARKER_OPTIONS } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { MapService } from '@app-core/services/map/map.service';
import { Feature, Point } from 'geojson';
import { Popup } from 'leaflet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LiveAssetMarkerPopupComponent } from '@app-live-view/components/live-asset-marker-popup/live-asset-marker-popup.component';
import { DeviceState, LiveDevice } from '@app-live-view/models/live-view.model';

interface MapIcons {
  liveAssetIcon: L.Icon;
  offlineAssetIcon: L.Icon;
  amberAssetIcon: L.Icon;
}

export interface LiveDevicesFeatures {
  [assetId: string]: Feature<Point, LiveDevice>;
}

@Injectable()
export class LiveViewMapService implements OnDestroy {
  private popupFactory: ComponentFactory<LiveAssetMarkerPopupComponent>;
  public mapIcons: MapIcons;
  private currentTimeZone: string;
  private currentDateFormat: string;
  private popupComponentRefs: Map<string, ComponentRef<LiveAssetMarkerPopupComponent>> = new Map();

  private ngUnsubscribe = new Subject<void>();
  private refreshMarkersPopup = new Subject<void>();
  public refreshMarkersPopup$ = this.refreshMarkersPopup.asObservable();

  constructor(
    private resolver: ComponentFactoryResolver,
    private mapService: MapService,
    private injector: Injector,
    private dataService: DataService
  ) {
    this.subscribeForTimezoneChange();
    this.subscribeForDateFormatChange();
    this.subscribeForLanguageChange();
    this.mapIcons = {
      liveAssetIcon: this.mapService.getIcon({
        iconUrl: 'assets/common/live-asset.svg',
        ...ASSET_MAP_MARKER_OPTIONS,
      }),
      offlineAssetIcon: this.mapService.getIcon({
        iconUrl: 'assets/common/inactive-asset.svg',
        ...ASSET_MAP_MARKER_OPTIONS,
      }),
      amberAssetIcon: this.mapService.getIcon({
        iconUrl: 'assets/common/amber-asset.svg',
        ...ASSET_MAP_MARKER_OPTIONS,
      }),
    };
    this.popupFactory = this.resolver.resolveComponentFactory(LiveAssetMarkerPopupComponent);
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.popupComponentRefs.forEach((ref) => ref.destroy());
  }

  public deviceHasValidLatLng(device: LiveDevice): boolean {
    const {
      gpsData: { latitude = 0, longitude = 0 },
    } = device;
    return !!(latitude || longitude);
  }

  private subscribeForTimezoneChange() {
    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      if (value) {
        this.currentTimeZone = value;
        this.refreshMarkersPopup.next();
      }
    });
  }

  private subscribeForDateFormatChange() {
    this.dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      if (value) {
        this.currentDateFormat = value;
        this.refreshMarkersPopup.next();
      }
    });
  }

  private subscribeForLanguageChange() {
    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      if (value) {
        setTimeout(() => {
          this.refreshMarkersPopup.next();
        }, 100);
      }
    });
  }

  private createPopup(device: LiveDevice): Popup {
    const template = this.createPopupTemplate(device);
    const popup = this.mapService.getPopup(template, {
      minWidth: 240,
      className: 'asset-popup',
    });
    return popup;
  }

  public createPopupTemplate(device: LiveDevice) {
    let component: ComponentRef<LiveAssetMarkerPopupComponent>;
    if (this.popupComponentRefs.has(device.assetId)) {
      component = this.popupComponentRefs.get(device.assetId);
    } else {
      component = this.popupFactory.create(this.injector);
    }
    component.instance.device = device;
    component.instance.timezone = this.currentTimeZone;
    component.instance.dateFormat = this.currentDateFormat;
    component.changeDetectorRef.detectChanges();
    this.popupComponentRefs.set(device.assetId, component);
    const template = component.location.nativeElement;
    return template;
  }

  public getMarkerIcon(device: LiveDevice): L.Icon {
    if (device.state.getValue() === DeviceState.Active) {
      return this.mapIcons.liveAssetIcon;
    }
    if (device.state.getValue() === DeviceState.Amber) {
      return this.mapIcons.amberAssetIcon;
    }
    return this.mapIcons.offlineAssetIcon;
  }

  public createMarker(device: LiveDevice): L.Marker {
    const {
      gpsData: { latitude, longitude },
    } = device;
    const popup = this.createPopup(device);
    const icon = this.getMarkerIcon(device);
    const marker = this.mapService.getMarker(+latitude, +longitude, icon);
    marker.bindPopup(popup).openPopup();
    return marker;
  }

  public createLiveDevicePointFeature(device: LiveDevice): Feature<Point, LiveDevice> {
    const {
      gpsData: { latitude, longitude },
    } = device;
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      properties: { ...device },
    };
  }
}
