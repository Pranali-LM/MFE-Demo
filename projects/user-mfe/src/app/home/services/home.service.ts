import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  DriverEventTrendParams,
  DriverStatsParams,
  FleetEventTrendParams,
  FleetStatsParams,
  SevereViolationsData,
  SevereViolationsParams,
  SevereViolationsResponse,
  TripListParams,
} from '@app-home/models/home.model';
import { API } from '@app-core/constants/api.constants';
import { EVENT_TAG_KEYS, EVENTS_CONFIG } from '@app-core/constants/constants';
import { setParams } from '@app-core/models/core.model';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { CLIENT_CONFIG } from '@config/config';
import { DataService } from '@app-core/services/data/data.service';
import { StorageService } from '@app-core/services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  public currentMetricUnit = null;
  private clientConfig = CLIENT_CONFIG;
  // private eventsConfig = EVENTS_CONFIG;
  private eventsConfig;
  public tagIds = [];
  constructor(
    private http: HttpClient,
    private commonHttpService: CommonHttpService,
    private cacheService: HttpCacheService,
    private dataService: DataService,
    private storageService: StorageService
  ) {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
  }

  // Getter and setter for fleet events trend
  private fleetEventsTrend: any;

  public get fleetEventsTrendData(): any {
    return this.fleetEventsTrend;
  }

  public set fleetEventsTrendData(v: any) {
    this.fleetEventsTrend = v;
  }

  public getDriverStats(params: DriverStatsParams) {
    return this.commonHttpService.getDriverStats(params);
  }

  public getFleetStats(params: FleetStatsParams) {
    return this.commonHttpService.getFleetStats(params);
  }

  public getTopDriversList(params: any): any {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DRIVER_LIST_V2, httpOptions).pipe(
      map((res: any) => {
        const topDriverList = res.data.drivers || [];
        return {
          topDrivers: topDriverList,
          skip: res?.skip,
          limit: res?.limit,
          totalCount: res?.totalCount,
        };
      })
    );
  }

  public getFleetEventTrend(params: FleetEventTrendParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_FLEET_EVENT_TREND, httpOptions);
  }

  public getDriverEventTrend(params: DriverEventTrendParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DRIVER_EVENT_TREND, httpOptions);
  }

  public getDriverTripList(params: TripListParams): Observable<any> {
    return this.commonHttpService.getDriverTripList(params);
  }

  public getSevereViolations(params: SevereViolationsParams, isRefresh?: Boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    const coachingConfig = this.storageService.getStorageValue('coachingConfig') || {};
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_SEVERE_VIOLATIONS);
    }
    return this.http.get(API.GET_SEVERE_VIOLATIONS, httpOptions).pipe(
      map((resp: SevereViolationsResponse) => {
        const eventTypes = Object.keys(resp.eventsByType);
        const updatedResp = {};
        eventTypes.forEach((eventType) => {
          const events = resp.eventsByType[eventType];
          let enableSelectForCoaching;
          if (Object.keys(coachingConfig).length === 0) {
            enableSelectForCoaching = true;
          } else {
            enableSelectForCoaching = (coachingConfig?.eventTypes || []).includes(eventType);
          }
          updatedResp[eventType] = events.map((e) => ({ ...e, enableSelectForCoaching }));
        });
        return updatedResp;
      })
    );
  }

  public getFleetDvrRequests(params: any, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_DVR_REQUESTS);
    }
    return this.http.get(API.GET_DVR_REQUESTS, httpOptions).pipe(
      map((res: any) => {
        const { uploadRequests = [] } = res.data || {};
        return {
          ...res,
          data: {
            ...res.data,
            uploadRequests: uploadRequests.map((dvr, index) => {
              const { startTime = '', startTimeUTC = '', createdAt = '', isViewed = false, response = {} } = dvr;
              if (startTime && startTimeUTC && createdAt) {
                const timeDiff = new Date(startTime).getTime() - new Date(startTimeUTC).getTime();
                const createdAtLocal = new Date(new Date(createdAt).getTime() + timeDiff);
                return {
                  ...dvr,
                  createdAtLocal,
                  positionIndex: index,
                  isViewed,
                  mediaFiles: response.mediaFiles,
                };
              }
              return {
                ...dvr,
                positionIndex: index,
                mediaFiles: response.mediaFiles,
              };
            }),
          },
        };
      })
    );
  }

  public getFleetExternalEvents(params: any, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_EXTERNAL_EVENTS);
    }
    return this.http.get(API.GET_EXTERNAL_EVENTS, httpOptions);
  }

  public getFleetEdvrRequests(params: any, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_EDVR_REQUESTS);
    }
    return this.http.get(API.GET_EDVR_REQUESTS, httpOptions).pipe(
      map((res: any) => {
        const { edvrRequests = [] } = res.data || {};
        return {
          ...res,
          data: {
            ...res.data,
            edvrRequests: edvrRequests
              .filter((event: any) => {
                const { eventType } = event || {};
                return this.eventsConfig.hasOwnProperty(eventType);
              })
              .map((edvr, index) => {
                const { label = '' } = this.eventsConfig[edvr.eventType] || {};
                const { eventTimestampUTC = '', eventTimestamp = '', createdAt = '' } = edvr;
                if (eventTimestamp && eventTimestampUTC && createdAt) {
                  const timeDiff = new Date(eventTimestamp).getTime() - new Date(eventTimestampUTC).getTime();
                  const createdAtLocal = new Date(new Date(createdAt).getTime() + timeDiff);
                  return {
                    ...edvr,
                    createdAtLocal,
                    eventTypeLabel: label,
                    positionIndex: index,
                  };
                }
                return {
                  ...edvr,
                  eventTypeLabel: label,
                  positionIndex: index,
                };
              }),
          },
        };
      })
    );
  }

  public getBookmarkedEvents(params: any, requestType?: string, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    let api = requestType === 'DVR' ? API.GET_DVR_REQUESTS : API.GET_COACHING_INCIDENTS;

    if (requestType === 'DVR') {
      api = API.GET_DVR_REQUESTS;
    } else if (requestType === 'INCIDENT') {
      api = API.GET_COACHING_INCIDENTS;
    } else {
      api = API.GET_EXTERNAL_EVENTS;
    }
    if (isRefresh) {
      this.cacheService.burstCache$.next(api);
    }
    return this.http.get(api, httpOptions).pipe(
      map((res: any) => {
        if (requestType === 'DVR') {
          const { data = {} } = res;
          const { uploadRequests = [] } = data;
          return {
            ...res,
            rows: uploadRequests.map((dvr, index) => {
              const { startTime = '', startTimeUTC = '', createdAt = '', coachingCompletedTimestamp = '', response = {} } = dvr;
              if (startTime && startTimeUTC && createdAt) {
                const timeDiff = new Date(startTime).getTime() - new Date(startTimeUTC).getTime();
                const createdAtLocal = new Date(new Date(createdAt).getTime() + timeDiff);
                const coachingCompletedTimestampLocal = new Date(new Date(coachingCompletedTimestamp).getTime() + timeDiff);
                return {
                  ...dvr,
                  createdAtLocal,
                  positionIndex: index,
                  coachingCompletedTimestampLocal,
                  mediaFiles: response.mediaFiles,
                };
              }
              return {
                ...dvr,
                positionIndex: index,
                mediaFiles: response.mediaFiles,
              };
            }),
          };
        } else if (requestType === 'INCIDENT') {
          const { rows = [] } = res || {};
          return {
            ...res,
            rows: rows
              .filter((event: any) => {
                const { eventType } = event || {};
                return this.eventsConfig.hasOwnProperty(eventType);
              })
              .map((event: any, index: any) => {
                const {
                  tags = [],
                  eventVideoFile = '',
                  eventType = '',
                  coachingCompletedTimestamp = '',
                  timestamp = '',
                  timestampUTC = '',
                } = event;
                const eventTypeLabel = this.eventsConfig[eventType].label || {};
                const mappedTags = tags.map((tag: any) => {
                  return EVENT_TAG_KEYS[tag];
                });
                const timeDiff = new Date(timestamp).getTime() - new Date(timestampUTC).getTime();
                const coachingCompletedTimestampLocal = new Date(new Date(coachingCompletedTimestamp).getTime() + timeDiff);
                return {
                  ...event,
                  eventTypeLabel,
                  eventTags: mappedTags,
                  eventVideoFilename: eventVideoFile,
                  positionIndex: index,
                  coachingCompletedTimestampLocal,
                };
              }),
          };
        } else {
          const { rows = [] } = res || {};
          return {
            ...res,
            rows: rows.map((event, index) => {
              const { tags = [], eventVideoFile = '', timestampUTC = '', timestamp = '', coachingCompletedTimestamp = '' } = event;
              const mappedTags = tags.map((tag: any) => {
                return EVENT_TAG_KEYS[tag];
              });
              const timeDiff = new Date(timestamp).getTime() - new Date(timestampUTC).getTime();
              const coachingCompletedTimestampLocal = new Date(new Date(coachingCompletedTimestamp).getTime() + timeDiff);
              return {
                ...event,
                isExternalEvent: true,
                eventTypeLabel: this.clientConfig.externalEventsLabel,
                eventTags: mappedTags,
                eventVideoFilename: eventVideoFile,
                positionIndex: index,
                coachingCompletedTimestampLocal,
              };
            }),
          };
        }
      })
    );
  }

  public createGenericDvr(params: any): Observable<any> {
    return this.http.post(API.CREATE_DVR_REQUEST, params);
  }

  public fillModifiedDataToTarget(
    modifiedData: SevereViolationsData,
    modifiedResp: SevereViolationsData,
    targetObjects: number
  ): SevereViolationsData {
    const combinedValues: any = Object.values(modifiedData).reduce(
      (result: Array<Object>, array: Array<Object>) => result.concat(array),
      [] as Array<Object>
    );
    if (combinedValues.length >= targetObjects) {
      // No need to process if targetObjects are already met
      return modifiedData;
    }
    let remainingObjects = targetObjects - combinedValues?.length;
    let conditionsSatisfied = true;

    // Check if both modifiedData and modifiedResp are empty
    if (Object.keys(modifiedData).length === 0 || Object.keys(modifiedResp).length === 0) {
      return modifiedData;
    }

    const keysUsed = [];
    while (remainingObjects > 0 && conditionsSatisfied) {
      Object.keys(modifiedData)
        .sort()
        .forEach((key: string) => {
          const array: any[] = modifiedResp[key];
          const objectsToAdd = Math.min(remainingObjects, array.length);
          if (objectsToAdd > 0 && !keysUsed.includes(key)) {
            const objectsToConcat = array.slice(1, objectsToAdd + 1);
            modifiedData[key] = (modifiedData[key] || []).concat(objectsToConcat);
            remainingObjects -= objectsToConcat.length;
            keysUsed.push(key);
          } else {
            conditionsSatisfied = false;
          }
        });
    }
    return modifiedData;
  }
}
