import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { MAP_CIRCLE_ICON_OPTIONS, MAP_MARKER_ICON_OPTIONS, MAP_OPTIONS } from '@app-core/constants/constants';
import { DeviceState } from '@app-core/models/core.model';
import * as L from 'leaflet';
import 'leaflet-realtime';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private http: HttpClient) {}

  /**
   * @description Returns a leaflet map instance for mapId
   * @param mapId Id of the DIV where the map renders
   * @param mapOption optional map options to be passed
   */
  public getMapInstance(mapId: string, mapOption: any = MAP_OPTIONS) {
    // Add missing options from the default options
    mapOption = { ...MAP_OPTIONS, ...mapOption };

    const { coordinates, ...options } = mapOption;
    return L.map(mapId, {
      center: [coordinates.lat, coordinates.lng],
      ...options,
    });
  }

  public setMapGeoJsonFeature(map: any) {
    const mapGeoJsonStyle = {
      fillColor: '#BFA9BA',
      color: '#BFA9BA',
      weight: 2,
      opacity: 1,
      fillOpacity: 0,
    };
    const GEOJSON_URL = API.GEO_JSON;
    this.http.get(GEOJSON_URL).subscribe((json: any) => {
      const geojsonFeature = json;
      L.geoJSON(geojsonFeature, {
        style: mapGeoJsonStyle,
      }).addTo(map);
    });
  }

  /**
   * @description adds an openstreet map tile on a leaflet map
   */
  public addOpenstreetTile(map: any) {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetlaunch</a> contributors',
      className: 'map-tiles',
    }).addTo(map);
  }

  public getIcon(iconOption: any = MAP_MARKER_ICON_OPTIONS) {
    iconOption = { ...MAP_MARKER_ICON_OPTIONS, ...iconOption };
    return L.icon(iconOption);
  }

  public getOngoingIcon(state: DeviceState.Active | DeviceState.Amber) {
    const stateClass = `${state.toLowerCase()}-state`;
    return L.divIcon({
      className: 'css-icon',
      html: `<div class="gps-point ${stateClass}"></div><div class="gps-circle ${stateClass}"></div>`,
    });
  }

  /**
   * @description returns a latlng object
   * @param lat
   * @param lng
   */
  public getLatLong(lat, lng) {
    return L.latLng(lat, lng);
  }

  public getPolyline(path: any[]) {
    return L.polyline(path);
  }

  public getHighlightedPolyline(path: any[]) {
    return L.polyline(path, {
      color: '#008A00',
      weight: 8,
    });
  }

  public getCircleIcon(lat: number, lng: number, options: any = MAP_CIRCLE_ICON_OPTIONS) {
    const coords = L.latLng(lat, lng);
    options = { ...MAP_CIRCLE_ICON_OPTIONS, ...options };
    return L.circleMarker(coords, options);
  }

  public getMarker(lat: number, lng: number, icon?: any) {
    return L.marker([lat, lng], {
      icon,
    });
  }

  public getLayerGroup(list: any[]) {
    return L.layerGroup(list);
  }

  public getFeatureGroup(list: any[]) {
    return L.featureGroup(list);
  }

  public getBounds(list: any[]) {
    return L.latLngBounds(list);
  }

  public getPopup(template, options?: L.PopupOptions) {
    const pop = L.popup({
      autoPanPadding: L.point(24, 24),
      closeOnEscapeKey: false,
      ...options,
    });
    pop.setContent(template);
    return pop;
  }

  public getTooltip(template) {
    const toolTip = L.tooltip({
      direction: 'auto',
      interactive: true,
      // offset: L.point(-10, -100),
      className: 'custom-leaflet-tooltip',
    });
    toolTip.setContent(template);
    return toolTip;
  }

  public addRealtimeLayer(source, options, map: L.Map) {
    return L.realtime(source, options).addTo(map);
  }
}
