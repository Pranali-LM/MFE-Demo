import { Injectable } from '@angular/core';
import { AVAILABLE_DUTY_TYPES } from '@app-asset-config/common/asset-configuration.constants';
import { environment } from '@env/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { AccessService } from '../access/access.service';
import { CommonHttpService } from '../common-http/common-http.service';
import { DataService } from '../data/data.service';
import { AssetTags, DeviceState, DeviceStateInput } from '@app-live-view/models/live-view.model';
import { DEVICE_GPS_UPDATE_TIMER_MIN, TRIP_STATUS_UPDATE_TIMER_MIN } from '@app-live-view/constants/live-view.constants';
import { TaggingService } from '@app-asset-config/services/tagging.service';

export interface AuthOptions {
  deviceId: string;
  partition: number;
}

@Injectable({
  providedIn: 'root',
})
export class LiveTelematicsService {
  private defaultSocketConnectionOptions: Partial<ManagerOptions & SocketOptions> = {
    path: '/ws',
    extraHeaders: {},
    autoConnect: false,
    withCredentials: true,
    query: {},
  };

  private _zoomedOutViewSocket: Socket;
  private _deviceLevelViewSocket: Socket;
  private currentFleet: string;
  private liveTelematicsEnabled$: Observable<boolean>;
  private allAssetEntityTags$: Observable<AssetTags[]>;

  constructor(
    private accessService: AccessService,
    private commonHttpService: CommonHttpService,
    private dataService: DataService,
    private taggingService: TaggingService
  ) {
    this.dataService._currentFleet.subscribe((value: string) => {
      if (value) {
        this.currentFleet = value;
        this.liveTelematicsEnabled$ = null;
        this.allAssetEntityTags$ = null;
        this.disconnectSocketConnections();
        this.initializeSocketConnections();
      }
    });
  }

  private disconnectSocketConnections() {
    if (this._zoomedOutViewSocket && this._zoomedOutViewSocket.connected) {
      this._zoomedOutViewSocket.disconnect();
    }
    if (this._deviceLevelViewSocket && this._deviceLevelViewSocket.connected) {
      this._deviceLevelViewSocket.disconnect();
    }
  }

  private initializeSocketConnections() {
    const token = this.accessService.getLoginInfo().token;
    this.defaultSocketConnectionOptions.extraHeaders = {
      'x-access-token': token,
    };
    this.defaultSocketConnectionOptions.query = {
      fleetId: this.currentFleet,
    };
    this._zoomedOutViewSocket = io(environment.intermediate_server_url + '/v2/zoomed-out-view', {
      ...this.defaultSocketConnectionOptions,
    });
    this._deviceLevelViewSocket = io(environment.intermediate_server_url + '/device-level-view', {
      ...this.defaultSocketConnectionOptions,
    });
  }

  public get zoomedOutViewSocket(): Socket {
    return this._zoomedOutViewSocket;
  }

  public get deviceLevelViewSocket(): Socket {
    return this._deviceLevelViewSocket;
  }

  public liveTelematicsEnabled(): Observable<boolean> {
    if (this.liveTelematicsEnabled$) {
      return this.liveTelematicsEnabled$;
    } else {
      this.liveTelematicsEnabled$ = this.commonHttpService.getFleetSdkConfigurations().pipe(
        map((res) => {
          const liveTelematicsEnabledStatus = AVAILABLE_DUTY_TYPES.map(({ key: dutyType }) => {
            return !!(res[dutyType] || {}).enableLiveTelematics;
          });
          return liveTelematicsEnabledStatus.some((e) => !!e);
        }),
        catchError(() => {
          return of(false);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      return this.liveTelematicsEnabled$;
    }
  }

  public getLiveDeviceState({ statusUpdateTimestampUTC, lastPingTimestampUTC, ongoing = false }: DeviceStateInput): DeviceState {
    if (!ongoing) {
      return DeviceState.Inactive;
    }

    if (lastPingTimestampUTC) {
      const minGpsUpdateUTC = new Date(Date.now() - DEVICE_GPS_UPDATE_TIMER_MIN * 60 * 1000).toISOString();
      const lastGpsReceivedOlder = new Date(lastPingTimestampUTC).getTime() < new Date(minGpsUpdateUTC).getTime();
      if (lastGpsReceivedOlder) {
        return DeviceState.Amber;
      }
      return DeviceState.Active;
    }

    if (statusUpdateTimestampUTC) {
      const minTripStatusUpdateUTC = new Date(Date.now() - TRIP_STATUS_UPDATE_TIMER_MIN * 60 * 1000).toISOString();
      const tripStatusUpdatedOlder = new Date(statusUpdateTimestampUTC).getTime() < new Date(minTripStatusUpdateUTC).getTime();
      if (tripStatusUpdatedOlder) {
        return DeviceState.Amber;
      }
      return DeviceState.Active;
    }
    return DeviceState.Amber;
  }

  public allAssetEntityTags(): Observable<AssetTags[]> {
    if (this.allAssetEntityTags$) {
      return this.allAssetEntityTags$;
    } else {
      const params = {
        limit: 500,
        offset: 0,
        'entityNames[]': 'asset',
      };
      this.allAssetEntityTags$ = this.taggingService.getAttributes(params).pipe(
        map((res) => {
          return (res.data || []).reduce((acc, attr) => {
            const { attributeId, attributeName, tags } = attr;
            return [...acc, ...(tags || []).map((t) => ({ ...t, attributeId, attributeName }))];
          }, []);
        }),
        catchError(() => {
          return of([]);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      return this.allAssetEntityTags$;
    }
  }
}
