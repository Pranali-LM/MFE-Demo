import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { MapService } from '@app-core/services/map/map.service';
import { LiveDevice } from '@app-live-view/models/live-view.model';
import { LiveDevicesFeatures, LiveViewMapService } from '@app-live-view/services/live-view-map/live-view-map.service';
import { CLIENT_CONFIG } from '@config/config';
import { Feature, Point } from 'geojson';
import { LatLngBounds, LatLngExpression, Layer, Marker, ZoomPanOptions } from 'leaflet';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-live-view-map',
  templateUrl: './live-view-map.component.html',
  styleUrls: ['./live-view-map.component.scss'],
})
export class LiveViewMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public selectedDevice: LiveDevice;
  @Input()
  private pageSize = 0;
  @Input()
  set deviceList(devices: LiveDevice[]) {
    this._devices = devices.map((device) => {
      if (!this.liveViewMapService.deviceHasValidLatLng(device)) {
        const oldDeviceValue = this.features[device.assetId];
        if (oldDeviceValue && this.liveViewMapService.deviceHasValidLatLng(oldDeviceValue.properties)) {
          return {
            ...device,
            gpsData: oldDeviceValue.properties.gpsData,
          };
        }
      }
      return device;
    });

    const featuresToBeRemoved = Object.entries(this.features)
      .filter(([fId]) => this.currentPageDevices.findIndex((d) => d.assetId === fId) === -1)
      .map(([, feature]) => feature);
    const featuresToBeUpdated = this.currentPageDevices.map((device) => this.liveViewMapService.createLiveDevicePointFeature(device));
    if (featuresToBeUpdated.length) {
      this.realtimeUpdate(featuresToBeUpdated);
    }
    if (featuresToBeRemoved.length) {
      this.realtimeRemove(featuresToBeRemoved);
    }
    if (this.selectedDevice) {
      this.focusDevice(this.selectedDevice);
    } else {
      this.recenterMarkers();
    }
  }
  @Input()
  set pageIndex(pageIndex: number) {
    this._pageIndex = pageIndex;
    const featuresToBeRemoved = Object.values(this.features);
    const featuresToBeUpdated = this.currentPageDevices.map((device) => this.liveViewMapService.createLiveDevicePointFeature(device));
    if (featuresToBeUpdated.length) {
      this.realtimeUpdate(featuresToBeUpdated);
    }
    if (featuresToBeRemoved.length) {
      this.realtimeRemove(featuresToBeRemoved);
    }
    this.recenterMarkers();
  }

  @Output()
  private markerClick = new EventEmitter<LiveDevice>();
  @Output()
  private recenterBtnClick = new EventEmitter<void>();

  private _devices: LiveDevice[] = [];
  private _pageIndex = 0;
  private ngUnsubscribe = new Subject<void>();
  private map: L.Map;
  private realtime;
  private realtimeOptions = {
    start: false,
    getFeatureId(feature: Feature<Point, LiveDevice>) {
      return feature.properties.assetId;
    },
    pointToLayer: (geoJsonPoint: Feature<Point, LiveDevice>) => {
      const marker = this.liveViewMapService.createMarker(geoJsonPoint.properties);
      marker.on('click', () => {
        this.markerClick.emit(geoJsonPoint.properties);
      });
      return marker;
    },
  };
  private features: LiveDevicesFeatures = {};
  private unsubscribeStateChange = new Subject();

  public mapId = 'liveAssetMap';
  public isFullscreen = false;

  constructor(private mapService: MapService, public dataService: DataService, private liveViewMapService: LiveViewMapService) {}

  public ngOnInit() {
    this.liveViewMapService.refreshMarkersPopup$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.refreshMarkers(true, false));
  }

  public ngAfterViewInit() {
    this.map = this.mapService.getMapInstance(this.mapId, {
      zoomControl: true,
      scrollWheelZoom: true,
      zoom: 8,
      coordinates: CLIENT_CONFIG.defaultMapCoordinates,
      tap: false,
    });
    this.map.attributionControl.setPrefix('Leaflet');
    this.realtime = this.mapService.addRealtimeLayer(undefined, this.realtimeOptions, this.map);
    this.realtime.on('update', (data) => {
      this.features = data.features;
      this.refreshMarkers(true, true);
      this.unsubscribeStateChange.next();
      this.listenForDeviceStateChange();
    });
    this.mapService.setMapGeoJsonFeature(this.map);
    this.mapService.addOpenstreetTile(this.map);
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeStateChange.next();
    this.unsubscribeStateChange.complete();
  }

  private get currentPageDevices() {
    const pageStart = this._pageIndex * this.pageSize;
    const pageEnd = this._pageIndex * this.pageSize + this.pageSize;
    const currentPageDevices = this._devices.slice(pageStart, pageEnd).filter(this.liveViewMapService.deviceHasValidLatLng);
    return currentPageDevices;
  }

  private listenForDeviceStateChange() {
    Object.entries(this.features).forEach(([fId, feature]) => {
      const device = feature.properties;
      // Skipping the first value since state is a behaviour subject and emits current value to new subscribers
      // We are only interested in change of state when timer triggers
      device.state.pipe(takeUntil(this.unsubscribeStateChange), skip(1)).subscribe(() => {
        const layer = this.getRealtimeLayer(fId);
        if (layer instanceof Marker) {
          const icon = this.liveViewMapService.getMarkerIcon(feature.properties);
          layer.setIcon(icon);
        }
        const updatedPopupContent = this.liveViewMapService.createPopupTemplate(feature.properties);
        layer.setPopupContent(updatedPopupContent);
      });
    });
  }

  private refreshMarkers(updatePopup: boolean, updateIcon: boolean) {
    Object.entries(this.features).forEach(([fId, feature]) => {
      const layer = this.getRealtimeLayer(fId);
      if (updateIcon && layer instanceof Marker) {
        const icon = this.liveViewMapService.getMarkerIcon(feature.properties);
        layer.setIcon(icon);
      }
      if (updatePopup) {
        const updatedPopupContent = this.liveViewMapService.createPopupTemplate(feature.properties);
        layer.setPopupContent(updatedPopupContent);
      }
    });
  }

  private realtimeUpdate(features: Array<Feature<Point, LiveDevice>>) {
    if (!this.realtime) {
      return;
    }
    this.realtime.update({
      type: 'FeatureCollection',
      features,
    });
  }

  private realtimeRemove(features: Array<Feature<Point, LiveDevice>>) {
    if (!this.realtime) {
      return;
    }
    this.realtime.remove(features);
  }

  public getRealtimeLayer(assetId: string): Layer {
    if (this.realtime) {
      return this.realtime.getLayer(assetId);
    }
  }

  public invalidateMapSize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize(true);
      }, 100);
    }
  }

  public recenterMarkers() {
    if (this.map && this.realtime) {
      const bounds: LatLngBounds = this.realtime.getBounds();
      if (bounds.isValid()) {
        this.map.flyToBounds(this.realtime.getBounds(), { padding: [50, 50], duration: 0.5 });
      }
    }
  }

  public focusDevice(device: LiveDevice) {
    if (this.map && this.realtime) {
      const layer = this.getRealtimeLayer(device.assetId);
      if (layer) {
        const fg = this.mapService.getFeatureGroup([layer]);
        this.map.flyToBounds(fg.getBounds());
      }
    }
  }

  public setMapView(latLng: LatLngExpression, zoom?: number, options?: ZoomPanOptions) {
    if (this.map) {
      this.map.setView(latLng, zoom, options);
    }
  }

  public onRecenterBtnClick() {
    this.recenterBtnClick.emit();
  }
}
