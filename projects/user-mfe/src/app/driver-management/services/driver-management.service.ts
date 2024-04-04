import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API } from '@app-core/constants/api.constants';
import { EVENT_TAG_KEYS, EVENTS_CONFIG } from '@app-core/constants/constants';
import { setParams } from '@app-core/models/core.model';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataService } from '@app-core/services/data/data.service';

@Injectable({
  providedIn: 'root',
})
export class DriverManagementService {
  public eventsConfig;

  public driverStats = new Subject();

  constructor(private http: HttpClient, private cacheService: HttpCacheService, private dataService: DataService) {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = { ...EVENTS_CONFIG, ...this.dataService.transformObject(combinedEventsList) };
    this.eventsConfig = modifiedEventsConfig;
  }

  private PlayingIncidentChange: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentPlayingIncidentIndex = 0;

  getData(): any {
    return this.currentPlayingIncidentIndex;
  }

  setData(index: any): void {
    this.currentPlayingIncidentIndex = index;
    this.PlayingIncidentChange.next(index);
  }

  getDataObservable(): Observable<any> {
    return this.PlayingIncidentChange.asObservable();
  }

  public driverSignup(body: any): Observable<any> {
    return this.http.post(API.PROVISION_DRIVER, body);
  }

  public getRegisteredDriverList(isRefresh?: boolean): Observable<any> {
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_REGISTERED_DRIVERS);
    }
    return this.http.get(API.GET_REGISTERED_DRIVERS);
  }

  public getDriverDetails(driverId, params) {
    const httpOptions = {
      params: setParams(params),
    };
    const url = API.GET_DRIVER_DETAILS(driverId);
    return this.http.get(url, httpOptions);
  }

  public enrollDriver(body: any): Observable<any> {
    return this.http.post(API.ENROLL_DRIVER, body, { observe: 'response' }).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_DRIVER_IMAGES);
      })
    );
  }

  public updateDriverDetails(body: any): Observable<any> {
    return this.http.patch(API.UPDATE_DRIVER_DETAILS, body);
  }

  public deletePersonDetails(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.delete(API.DELETE_PERSON_DETAILS, httpOptions);
  }

  public getDriverImages(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DRIVER_IMAGES, httpOptions);
  }

  public getBookmarkedEvents(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_VIOLATIONS, httpOptions).pipe(
      map((res: any) => {
        const { rows = [] } = res || {};
        return {
          ...res,
          rows: rows
            .filter((event: any) => {
              const { eventType } = event || {};
              return this.eventsConfig.hasOwnProperty(eventType);
            })
            .map((event: any) => {
              const { tags = [], eventVideoFile = '', eventType = '' } = event;
              const eventTypeLabel = this.eventsConfig[eventType].label || {};
              const mappedTags = tags.map((tag: any) => {
                return EVENT_TAG_KEYS[tag];
              });
              return {
                ...event,
                eventTypeLabel,
                eventTags: mappedTags,
                eventVideoFilename: eventVideoFile,
              };
            }),
        };
      })
    );
  }

  public getDriverExternalEvents(params: any, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_EXTERNAL_EVENTS);
    }
    return this.http.get(API.GET_EXTERNAL_EVENTS, httpOptions);
  }

  public resendDriverTempPassword(body: any): Observable<any> {
    return this.http.post(API.RESEND_DRIVER_TEMP_PASSWORD, body);
  }

  public deleteDriver(params: any, username: string): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.delete<any>(API.DELETE_USER(username), httpOptions);
  }

  public generateS3SignedUrls(body: any): Observable<any> {
    return this.http.post(API.GENERATE_S3_SIGNED_URLS, body);
  }

  public generateSampleUrls(): Observable<any> {
    return this.http.post(API.GENERATE_SAMPLE_URLS, null);
  }

  public uploadFileToS3(apiUrl: string, body: any): Observable<any> {
    return this.http.put(apiUrl, body);
  }

  public batchDriverAddition(uploadedFile: any): Observable<any> {
    const formData: any = new FormData();
    formData.append('drivers', uploadedFile, uploadedFile.name);
    return this.http.post(API.BATCH_DRIVER_ADDITION, formData, { observe: 'response' }).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.EXPORT_USERS);
        this.cacheService.burstCache$.next(API.GET_REGISTERED_DRIVERS);
      })
    );
  }

  public getSampleDriverCsv(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.SAMPLE_DRIVER_CSV_DOWNLOAD, {
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

  public updateDriverTags(body: any, driverId): Observable<any> {
    const url = API.UPDATE_DRIVER_TAGS(driverId);
    return this.patchData(url, body).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(url);
      })
    );
  }

  public updateEventTags(body: any, params: any, tripId: any, eventIndex: any): Observable<any> {
    const url = API.UPDATE_TAGS_FOR_EVENT(tripId, eventIndex);
    return this.patchData(url, body, params).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(url);
      })
    );
  }

  private patchData(url: string, body: any, params?: any) {
    const options = {
      params: this.setParams(params),
    };
    return this.http.patch(url, body, options);
  }

  /**
   * @description: Creating request object for GET requests
   * @param params
   */
  private setParams(params) {
    return new HttpParams({
      fromObject: params,
    });
  }

  public diffValue(currentValue, pastValue) {
    const noDataInBothPeriods = !(currentValue || pastValue);
    if (noDataInBothPeriods) {
      return 0;
    }
    if (pastValue > 0) {
      return ((currentValue - pastValue) / pastValue) * 100;
    }
    return 100;
  }

  public getCoachableIncidents(driverId, params) {
    const httpOptions = {
      params: setParams(params),
    };
    const url = API.GET_COACHABLE_INCIDENTS(driverId);
    return this.http.get(url, httpOptions);
  }

  public createCoachingSession(params: any, body: any): Observable<any> {
    const url = API.CREATE_COACHING_SESSION;
    return this.http.post(url, body, params).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.LIST_COACHING_SESSION);
        this.cacheService.burstCache$.next(API.COACHING_RECPMMENDATIONS);
      })
    );
  }

  public getDriverTags_v2(driverId: string): Observable<any> {
    const url = API.GET_DRIVER_DETAILS_V2(driverId);
    return this.http.get(url);
  }
}
