import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { EVENTS_CONFIG, EVENT_TAG_KEYS } from '@app-core/constants/constants';
import { setParams } from '@app-core/models/core.model';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { DataService } from '@app-core/services/data/data.service';
import { CLIENT_CONFIG } from '@config/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CoachingService {
  // private eventsConfig = EVENTS_CONFIG;
  public eventsConfig;

  constructor(private http: HttpClient, private cacheService: HttpCacheService, private dataService: DataService) {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
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
            rows: uploadRequests.map((dvr: any, index: number) => {
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
                mediaFiles: response.mediaFiles,
                positionIndex: index,
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
              .map((event: any, index: number) => {
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
            rows: rows.map((event: any, index: number) => {
              const { tags = [], eventVideoFile = '', timestampUTC = '', timestamp = '', coachingCompletedTimestamp = '' } = event;
              const mappedTags = tags.map((tag: any) => {
                return EVENT_TAG_KEYS[tag];
              });
              const timeDiff = new Date(timestamp).getTime() - new Date(timestampUTC).getTime();
              const coachingCompletedTimestampLocal = new Date(new Date(coachingCompletedTimestamp).getTime() + timeDiff);
              return {
                ...event,
                isExternalEvent: true,
                eventTypeLabel: CLIENT_CONFIG.externalEventsLabel,
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

  public getSessionList(params: any, isRefresh?: boolean): Observable<any> {
    const api = API.LIST_COACHING_SESSION;
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(api);
    }
    return this.http.get(api, httpOptions);
  }

  public getCoachReccomendList(params: any): Observable<any> {
    const api = API.COACHING_RECPMMENDATIONS;
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(api, httpOptions);
  }
}
