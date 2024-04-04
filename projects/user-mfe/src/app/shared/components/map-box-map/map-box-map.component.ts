import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { State } from '@app-shared/reducers/sidenavigation-config.reducer';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { getSideNavigationConfigState } from '@app-shared/reducers';

import { MAPBOX_ACCESS_TOKEN } from '@app-request-video/constants/request-video.constants';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_DEFAULT_LAYER, US_CENTER_LAT_LNG } from '@app-core/constants/constants';
import * as turf from '@turf/turf';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface Coordinates {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-map-box-map',
  templateUrl: './map-box-map.component.html',
  styleUrls: ['./map-box-map.component.scss'],
})
export class MapBoxMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() markerClick = new EventEmitter<any>();
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

  public isFullscreen = false;
  public currentLayer = MAPBOX_DEFAULT_LAYER;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public map: mapboxgl.Map;
  public polylineGeoJson: any;
  private path: any; //from map.ts

  constructor(public translate: TranslateService, private store: Store<State>) {}

  public ngOnInit(): void {
    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sideNavigationConfigState) => {
        if (this.map && sideNavigationConfigState) {
          setTimeout(() => {
            this.map.resize();
          }, 200);
        }
      });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this.map) {
      setTimeout(() => {
        this.ngOnChanges(changes);
      }, 100);
      return;
    }
    if (changes.view && changes.view.currentValue) {
      this.map.resize();
    }
    this.markerList = changes.markerList && changes.markerList.currentValue;
    if (this.markerList) {
      this.addMarker(this.markerList);
    }
    this.latlonList = changes.latlonList && changes.latlonList.currentValue;
    if (this.latlonList && this.latlonList.length) {
      this.addPath(this.latlonList);
    }
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.loadMap();
    }, 50);
  }

  private loadMap() {
    const { latitude = US_CENTER_LAT_LNG.latitude, longitude = US_CENTER_LAT_LNG.longitude } = this.mapInitialCoordinates || {};
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: 8,
    });
    // Add the navigation control to the map
    const nav = new mapboxgl.NavigationControl();
    this.map.addControl(nav, 'top-left');
    this.map.addControl(new mapboxgl.FullscreenControl(), 'top-left');
  }

  public removeAllMarkers() {
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach((marker) => {
      marker.remove();
    });
  }

  private addMarker(markerList: any[]) {
    this.removeAllMarkers();
    markerList.forEach((item, index) => {
      const marker = new mapboxgl.Marker({ color: item._color || '#005dbb' });
      // Assuming each item has a "_lngLat" property with lng and lat
      marker.setLngLat(item._lngLat);
      // Assiging the popup content to marker
      marker._popup = markerList[index]._popup;
      if (marker._color === '#3FB1CE') {
        marker._element = markerList[index]._element;
      }
      marker.getElement().addEventListener('mouseenter', () => {
        marker.togglePopup();
      });
      // Hide the popup when no longer hovering over the marker
      marker.getElement().addEventListener('mouseleave', () => {
        marker.togglePopup();
      });
      marker.getElement().addEventListener('click', () => {
        if (markerList[index]) {
          this.markerClick.emit(markerList[index]);
        }
      });
      // Add marker to the map
      marker.addTo(this.map);
    });
  }

  private addPath(latlongList: any[]) {
    if (this.path) {
      this.path.remove(this.map);
    }
    this.polylineGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: latlongList,
          },
        },
      ],
    };
    this.map.setStyle('mapbox://styles/mapbox/' + this.currentLayer);
    this.map.on('styledata', () => {
      if (!this.map.getSource('route')) {
        this.map.addSource('route', {
          type: 'geojson',
          data: this.polylineGeoJson,
        });
      }
      if (!this.map.getLayer('line-background')) {
        // add a line layer without line-dasharray defined to fill the gaps in the dashed line
        this.map.addLayer({
          type: 'line',
          source: 'route',
          id: 'line-background',
          paint: {
            'line-color': 'green',
            'line-width': 8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });
        const { fitBoundsOnPathChange = true } = this.customMapOptions;
        if (fitBoundsOnPathChange) {
          this.recenterMarkers();
        }
      }

      this.recenterMarkers();
    });
  }

  public recenterMarkers() {
    if (this.polylineGeoJson) {
      const bounds = turf.bbox(this.polylineGeoJson);
      const [minLng, minLat, maxLng, maxLat] = bounds;
      this.map.jumpTo({
        center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
        zoom: this.map.getZoom(),
      });
      this.map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 450 },
      });
    } else {
      const coordinates = this.markerList.map((marker) => [marker._lngLat.lng, marker._lngLat.lat]);
      const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      this.map.jumpTo({
        center: bounds.getCenter(),
        zoom: this.map.getZoom(),
      });
    }
  }

  public centerMarker(lat?: number, lng?: number, zoom?: number) {
    if (this.map) {
      const newCenter = [lng, lat];
      const newZoom = zoom || 8;

      this.map.flyTo({
        center: newCenter,
        zoom: newZoom,
        animate: false,
      });
    }
  }

  public switchLayer(layerId: string) {
    this.currentLayer = layerId;
    this.map.setStyle('mapbox://styles/mapbox/' + this.currentLayer);
    this.map.on('styledata', () => {
      if (!this.map.getSource('route')) {
        this.map.addSource('route', {
          type: 'geojson',
          data: this.polylineGeoJson,
        });
      }

      if (!this.map.getLayer('line-background')) {
        // add a line layer without line-dasharray defined to fill the gaps in the dashed line
        this.map.addLayer({
          type: 'line',
          source: 'route',
          id: 'line-background',
          paint: {
            'line-color': 'green',
            'line-width': 8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
