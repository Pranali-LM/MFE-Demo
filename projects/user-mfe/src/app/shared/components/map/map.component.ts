import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { US_CENTER_LAT_LNG } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { MapService } from '@app-core/services/map/map.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { getSideNavigationConfigState } from '@app-shared/reducers';
import { State } from '@app-shared/reducers/sidenavigation-config.reducer';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Coordinates {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input()
  public markerList: any[] = [];
  @Input()
  public latlonList: any[] = [];
  @Input()
  private mapInitialCoordinates: Coordinates = {} as Coordinates;
  @Input()
  public mapId = '';
  @Input()
  public view;
  @Input()
  public customMapOptions: any = {};
  @Input()
  public bearing: number;
  @Input()
  public speed: number;
  @Input()
  public highlightedPathList: any[] = [];

  public map: L.Map;
  private markeGroup: any;
  private path: any;
  private highlightedPath: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public bearingSuffix: string;
  public isFullscreen = false;

  constructor(
    private mapService: MapService,
    private store: Store<State>,
    private snackbarService: SnackBarService,
    public dataService: DataService,
    public translate: TranslateService
  ) {}

  public ngOnInit() {
    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sideNavigationConfigState) => {
        if (this.map && sideNavigationConfigState) {
          this.setLeafletMapInvalidateSize();
        }
      });

    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
    });
    document.addEventListener('mozfullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
    });
    document.addEventListener('webkitfullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
    });
    document.addEventListener('msfullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this.map) {
      setTimeout(() => {
        this.ngOnChanges(changes);
      }, 100);
      return;
    }
    if (changes.view && changes.view.currentValue) {
      this.setLeafletMapInvalidateSize();
    }
    const list = changes.markerList && changes.markerList.currentValue;
    if (list) {
      this.addMarker(list);
    }
    const latlonList = changes.latlonList && changes.latlonList.currentValue;
    if (latlonList && latlonList.length) {
      this.addPath(latlonList);
    }
    const highlightedLatLonList = changes.highlightedPathList && changes.highlightedPathList.currentValue;
    if (highlightedLatLonList && highlightedLatLonList.length) {
      this.addHighLightedPath(highlightedLatLonList);
    }
    if (changes.bearing && this.bearing) {
      this.bearingSuffix =
        this.bearing === 0 ? this.translate.instant('mapComponentdegree') : this.translate.instant('mapComponentdegrees');
      if (this.bearing) {
        this.bearing = Number(this.bearing.toFixed(2));
      }
    }
  }

  public ngAfterViewInit() {
    this.loadMap();
  }

  private loadMap() {
    const { latitude = US_CENTER_LAT_LNG.latitude, longitude = US_CENTER_LAT_LNG.longitude } = this.mapInitialCoordinates || {};
    this.map = this.mapService.getMapInstance(this.mapId, {
      zoomControl: true,
      scrollWheelZoom: true,
      zoom: 8,
      coordinates: { lat: latitude, lng: longitude },
    });
    this.mapService.setMapGeoJsonFeature(this.map);
    this.mapService.addOpenstreetTile(this.map);
  }

  private addMarker(markerList: any[]) {
    // Remove a marker layer if already present
    if (this.markeGroup) {
      this.markeGroup.remove(this.map);
    }

    // Add marker to map if any exist
    if (markerList.length) {
      this.markeGroup = this.mapService.getFeatureGroup(markerList);
      this.markeGroup.addTo(this.map);
      const { fitBoundsOnMarkerChange = true } = this.customMapOptions;
      if (fitBoundsOnMarkerChange) {
        this.map.fitBounds(this.markeGroup.getBounds());
      }
    }
  }

  private addPath(latlongList: any[]) {
    if (this.path) {
      this.path.remove(this.map);
    }
    this.path = this.mapService.getPolyline(latlongList);
    this.path.addTo(this.map);
    const { fitBoundsOnPathChange = true } = this.customMapOptions;
    if (fitBoundsOnPathChange) {
      this.map.fitBounds(this.path.getBounds());
    }
  }

  private addHighLightedPath(latlongList: any[]) {
    if (this.highlightedPath) {
      this.highlightedPath.remove(this.map);
    }
    this.highlightedPath = this.mapService.getHighlightedPolyline(latlongList);
    this.highlightedPath.addTo(this.map);
    const { fitBoundsOnPathChange = true } = this.customMapOptions;
    if (fitBoundsOnPathChange) {
      this.map.fitBounds(this.highlightedPath.getBounds(), {
        padding: [20, 20],
      });
    }
  }

  /**
   * @description: function used to invalidate the size of map before it is showed in the dom
   * @param:
   */
  public setLeafletMapInvalidateSize() {
    this.map.invalidateSize(true);
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  public recenterMarkers() {
    if (this.markerList.length) {
      this.markeGroup = this.mapService.getFeatureGroup(this.markerList);
      this.markeGroup.addTo(this.map);
      this.map.fitBounds(this.markeGroup.getBounds());
    }
  }

  public centerMarker(lat: number, lng: number, zoom?: number) {
    const latLng = this.mapService.getLatLong(lat, lng);
    this.map.setView(latLng, zoom);
  }

  public toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    const mapElement = document.getElementById(this.mapId);
    if (this.isFullscreen) {
      this.enterFullscreen(mapElement);
    } else {
      this.exitFullscreen();
    }
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document['webkitExitFullscreen']) {
      document['webkitExitFullscreen']();
    } else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    } else if (document['msExitFullscreen']) {
      document['msExitFullscreen']();
    } else {
      this.snackbarService.failure(this.translate.instant('mapComponentFullScreenNotSupported'));
    }
  }

  private enterFullscreen(ele) {
    if (ele.requestFullscreen) {
      ele.requestFullscreen();
    } else if (ele.webkitRequestFullscreen) {
      ele.webkitRequestFullscreen();
    } else if (ele.mozRequestFullScreen) {
      ele.mozRequestFullScreen();
    } else if (ele.msRequestFullscreen) {
      ele.msRequestFullscreen();
    } else {
      this.snackbarService.failure(this.translate.instant('mapComponentFullScreenNotSupported'));
    }
  }
}
