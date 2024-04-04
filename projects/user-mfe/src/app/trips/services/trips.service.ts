import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '@app-core/constants/api.constants';
import { AssetStatsParams, setParams } from '@app-core/models/core.model';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { GoogleTagManagerService, RequestedVideoType } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import {
  CreateDvrRequestBody,
  DriverStatsParams,
  FleetDriverListParams,
  FleetStatsParams,
  TripListParams,
} from '@app-trips/common/trips.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TripsService {
  public tripDetails: any;

  constructor(
    private http: HttpClient,
    private commonHttpService: CommonHttpService,
    private cacheService: HttpCacheService,
    private gtmService: GoogleTagManagerService
  ) {}

  public pushViewDvrVideoGtmEvent(event: any) {
    if (!event) {
      return;
    }
    if (event.timelapseEnabled) {
      return this.gtmService.viewRequestedVideoFromRequestDvrSection(RequestedVideoType.timelapseDvr);
    }
    return this.gtmService.viewRequestedVideoFromRequestDvrSection(RequestedVideoType.dvr);
  }

  public pushDvrCreateGtmEvent({
    trip = {} as any,
    startTimeUTC,
    endTimeUTC,
    enabledTimelapse = false,
  }: {
    startTimeUTC: string;
    endTimeUTC: string;
    trip: any;
    enabledTimelapse: boolean;
  }) {
    const { asset: { assetId = '' } = {} } = trip;
    const endTimeSinceEpoch = new Date(endTimeUTC).getTime();
    const startTimeSinceEpoch = new Date(startTimeUTC).getTime();
    const dvrDurationInSec = Math.abs(startTimeSinceEpoch - endTimeSinceEpoch) / 1000;
    if (enabledTimelapse) {
      this.gtmService.createTimelapseDvrRequest({
        assetId,
        dvrDurationInSec,
      });
    } else {
      this.gtmService.createDvrRequest({
        assetId,
        dvrDurationInSec,
      });
    }
  }

  public getFleetStats(params: FleetStatsParams): Observable<any> {
    return this.commonHttpService.getFleetStats(params);
  }

  public getDriverStats(params: DriverStatsParams): Observable<any> {
    return this.commonHttpService.getDriverStats(params);
  }

  public getAssetStats(params: AssetStatsParams): Observable<any> {
    return this.commonHttpService.getAssetStats(params);
  }

  public getDriverTripList(params: TripListParams, isRefresh?: boolean): Observable<any> {
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_DRIVER_TRIPS_V2);
    }
    return this.commonHttpService.getDriverTripList(params);
  }

  public getAssetTripList(params: TripListParams, isRefresh?: boolean): Observable<any> {
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_ASSET_TRIPS_V2);
    }
    return this.commonHttpService.getAssetTripList(params);
  }

  public getFleetDriverList(params: FleetDriverListParams): Observable<any> {
    return this.commonHttpService.getFleetDriverList(params);
  }

  public getFleetTripList(params: TripListParams, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_TRIP_LIST_V2);
    }
    return this.http.get(API.GET_TRIP_LIST_V2, httpOptions);
  }

  public createDvrRequest(body: CreateDvrRequestBody): Observable<any> {
    return this.http.post(API.CREATE_DVR_REQUEST, body).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(`${API.TRIP_DETAILS}?tripId=${body.tripId}`);
      })
    );
  }

  public checkDvrAvailibility(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.CHECK_DVR_AVAIBILITY, httpOptions);
  }

  public getLocationData(params: any): Observable<any> {
    return this.commonHttpService.getLocationData(params);
  }

  public exportTrips(params: any): Observable<any | HttpResponse<Blob>> {
    const httpOptions = {
      params: setParams(params),
    };
    this.cacheService.burstCache$.next(API.EXPORT_TRIPS);
    return this.http.get(API.EXPORT_TRIPS, {
      ...httpOptions,
      observe: 'response',
      responseType: 'blob',
    });
  }

  public extractFilename(contentDispositionHeader: string): string {
    return contentDispositionHeader.split(';')[1].trim().split('=')[1].replace(/"/g, '');
  }

  public downloadFile(data: any, filename = 'data', type: string) {
    const blob = new Blob([data], { type });
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {
      // if Safari open in new window to save file with random filename.
      downloadLink.setAttribute('target', '_blank');
    }
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', filename);
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
