import { Location } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { API } from '@app-core/constants/api.constants';
import { EVENT_SEVERITY_TYPE_LIST, LIVESTREAM_MODAL_CONFIG } from '@app-core/constants/constants';
import { LiveDevice, setParams } from '@app-core/models/core.model';
import { LivestreamModalComponent } from '@app-shared/components/livestream-modal/livestream-modal.component';
import {
  CreateEdvrRequestBody,
  GetDvrDetailsParams,
  GetEventDetailsParams,
  GetEventListParams,
  GetTripDetailsParams,
} from '@app-trip-details/common/trip-details.model';
import { CLIENT_CONFIG } from '@config/config';

@Injectable({
  providedIn: 'root',
})
export class TripDetailsService {
  private clientConfig = CLIENT_CONFIG;

  constructor(private location: Location, private http: HttpClient, private dialog: MatDialog) {}

  public getLocalTimestamp(timezoneOffsetInMins = 0, timestampUTC: string): string {
    if (timestampUTC) {
      const timezoneOffsetInMilliSec = timezoneOffsetInMins * 60 * 1000;
      const localTime = new Date(timestampUTC).getTime() - timezoneOffsetInMilliSec;
      return new Date(localTime).toISOString();
    }
    return '';
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

  private getData(url: string, params: any = {}) {
    const options = {
      params: this.setParams(params || {}),
    };
    return this.http.get(url, options);
  }

  private assignSeverityType(value, lowValue, highValue) {
    if (lowValue > highValue) {
      if (value >= highValue && value <= lowValue) {
        return 'medium';
      }
      if (value < highValue) {
        return 'high';
      }
      return 'low';
    }
    if (value >= lowValue && value <= highValue) {
      return 'medium';
    } else if (value > highValue) {
      return 'high';
    } else {
      return 'low';
    }
  }

  public getTripDetails(queryParams: GetTripDetailsParams) {
    return this.getData(API.TRIP_DETAILS, queryParams).pipe(
      map((res: any) => {
        const { timezoneOffset = 0, uploadRequests = [], violations = [] } = res || {};
        const finishedDvrEventList = uploadRequests.map((event) => {
          const { latitude = 0, longitude = 0 } = event.firstLocation || {};
          return {
            ...event,
            isDvrEvent: true,
            latitude,
            longitude,
            timestamp: event.startTime || this.getLocalTimestamp(timezoneOffset, event.startTimeUTC),
            timestampUTC: event.startTimeUTC,
            eventVideoFilename: event.response && event.response.link,
            mediaFiles: event.response && event.response.mediaFiles,
            eventTypeLabel: event.timelapseEnabled ? 'Time-lapse Video Request' : 'Video Request',
          };
        });
        const violationsWithSeverity = violations.map((event) => {
          if (!EVENT_SEVERITY_TYPE_LIST[event.eventType]) {
            return event;
          }
          let low, high, severity;
          if (event.originalEventType === 'MaxSpeedExceeded') {
            ({ low, high, severity } = EVENT_SEVERITY_TYPE_LIST[event.originalEventType]);
          } else {
            ({ low, high, severity } = EVENT_SEVERITY_TYPE_LIST[event.eventType]);
          }
          const severityValue = severity(event);
          return {
            ...event,
            severityValue,
            severityCategory: this.assignSeverityType(severityValue, low, high),
          };
        });
        return {
          ...res,
          finishedDvrEventList,
          violations: violationsWithSeverity,
        };
      })
    );
  }

  public getEventList(queryParams: GetEventListParams, otherParams) {
    return this.getData(API.TRIP_DETAILS, queryParams).pipe(
      map((res: any) => {
        const { violations = [] } = res || {};
        const { startTimeUTC, endTimeUTC } = otherParams;
        const filteredViolations = violations.filter((event) => event.timestampUTC > startTimeUTC && event.timestampUTC < endTimeUTC);

        return {
          ...res,
          filteredViolations,
        };
      })
    );
  }

  public getEventDetails(queryParams: GetEventDetailsParams) {
    return this.getData(API.EVENT_DETAILS, queryParams);
  }

  public getDvrDetails(queryParams: GetDvrDetailsParams) {
    return this.getData(API.DVR_DETAILS, queryParams);
  }

  public createEdvrRequest(body: CreateEdvrRequestBody): Observable<any> {
    return this.http.post(API.CREATE_EDVR_REQUEST, body);
  }

  public getCustomEventLabel(event = {} as any, customerName = ''): string {
    const defaultEventTypeLabelSuffix = 'Ext.';
    switch (customerName) {
      case 'calamp':
        return `${event.eventType} (${event.customName || defaultEventTypeLabelSuffix})`;

      case 'orbcomm':
      case 'orbcomm_dev':
      case 'orbcomm_exp':
      case 'inthinc':
      case 'dtna':
        return `${event.customName || '-'}`;

      default:
        return this.clientConfig.externalEventsLabel;
    }
  }

  public back(): void {
    this.location.back();
  }

  public openLivestreamModal(trip: any) {
    const { device: { deviceId = '' } = {}, asset: { assetId = '' } = {}, tripId } = trip;
    this.dialog.open(LivestreamModalComponent, {
      ...LIVESTREAM_MODAL_CONFIG,
      data: {
        tripId,
        deviceId,
        assetId,
        asset: trip.asset,
        recordedInfo: trip.recordedInfo,
      },
    });
  }

  public getLocationData(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.REVERSE_GEOCODE, httpOptions);
  }

  public deviceHasValidLatLng(device: LiveDevice): boolean {
    const {
      gpsData: { latitude = 0, longitude = 0 },
    } = device;
    return !!(latitude || longitude);
  }

  public checkDvrAvailibility(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.CHECK_DVR_AVAIBILITY, httpOptions);
  }

  public updateTrip(params: any, body: any) {
    const api = API.UPDATE_TRIP;
    return this.http.patch(api, body, params);
  }

  public updateTagsToTrips(tripId, body: any) {
    const api = API.UPDATE_TAGS_TO_TRIP(tripId);
    return this.http.patch(api, body);
  }

  public getTripsTags(tripId: string): Observable<any> {
    const api = API.UPDATE_TAGS_TO_TRIP(tripId);
    return this.http.get(api);
  }
}
