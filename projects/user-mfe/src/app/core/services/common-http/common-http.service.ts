import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '@app-core/constants/api.constants';
import {
  AssetStatsParams,
  DriverStatsParams,
  FleetDriverListParams,
  FleetStatsParams,
  LatestTripByAssetIdParams,
  setParams,
  TripListParams,
} from '@app-core/models/core.model';
import { GetTripDetailsParams } from '@app-trip-details/common/trip-details.model';

@Injectable({
  providedIn: 'root',
})
export class CommonHttpService {
  constructor(private http: HttpClient) {}

  public getFleetStats(params: FleetStatsParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_FLEET_STATS, httpOptions);
  }

  public getDriverStats(params: DriverStatsParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DRIVER_STATS_V2, httpOptions);
  }

  public getAssetStats(params: AssetStatsParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_ASSET_STATS, httpOptions);
  }

  public getDriverTripList(params: TripListParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DRIVER_TRIPS_V2, httpOptions);
  }

  public getAssetTripList(params: TripListParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_ASSET_TRIPS_V2, httpOptions);
  }

  public getFleetDriverList(param: FleetDriverListParams): Observable<any> {
    const httpOptions = {
      params: setParams(param),
    };
    return this.http.get(API.GET_DRIVER_LIST_V2, httpOptions);
  }

  public getLatestTripsByAssetId(params: LatestTripByAssetIdParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_LATEST_TRIPS_BY_ASSET_ID, httpOptions);
  }

  public getFleetSdkConfigurations(): Observable<any> {
    return this.http.get(API.GET_FLEET_CONFIGURATION);
  }

  public getTripDetails(params: GetTripDetailsParams) {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.TRIP_DETAILS, httpOptions);
  }

  public getLocationData(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.REVERSE_GEOCODE, httpOptions);
  }

  public getCustomEvents(): Observable<any> {
    return this.http.get(API.GET_FLEET_CUSTOM_EVENT_CONFIGURATION);
  }

  public getFleetEvents(): Observable<any> {
    return this.http.get(API.GET_FLEET_EVENTS_CUSTOM_EVENTS);
  }

  public getFleetCoachingConfig(params?: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_COACHING_CONFIG, httpOptions);
  }

  public getAssetTags(assetId: string) {
    const url = API.GET_ASSET_TAGS(assetId);
    return this.http.get(url);
  }
}
