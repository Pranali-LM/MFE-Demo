import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LIVESTREAM_MODAL_CONFIG } from '@app-core/constants/constants';
import { LatestTripByAssetIdParams, TripDetailsPageQueryParams } from '@app-core/models/core.model';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { DEVICE_GPS_UPDATE_TIMER_MIN, MIN_LATEST_TRIPS_DAYS } from '@app-live-view/constants/live-view.constants';
import {
  AssetTagsResp,
  DeviceState,
  GpsData,
  IntitialActiveDevice,
  LiveDevice,
  LiveTelematicsMessage,
} from '@app-live-view/models/live-view.model';
import { LivestreamModalComponent } from '@app-shared/components/livestream-modal/livestream-modal.component';
import { GetTripDetailsParams } from '@app-trip-details/common/trip-details.model';
import { BehaviorSubject, forkJoin, Observable, of, timer } from 'rxjs';
import { catchError, map, share, tap } from 'rxjs/operators';

@Injectable()
export class LiveViewService {
  private allDevices: Map<string, LiveDevice> = new Map();
  private tripDetailsObservables: Map<string, Observable<LiveDevice>> = new Map();
  private assetTagsObservables: Map<string, Observable<LiveDevice>> = new Map();
  private assetTagsCacheStore: Map<string, AssetTagsResp> = new Map();
  public tagIds = [];

  constructor(
    private dialog: MatDialog,
    private commonHttpService: CommonHttpService,
    private router: Router,
    private dateService: DateService,
    private liveTelamaticsService: LiveTelematicsService,
    private gtmService: GoogleTagManagerService
  ) {}

  private formatLatestTrips(trips = []): LiveDevice[] {
    const devices = trips
      .filter((trip) => {
        const { asset: { assetId = '' } = {} } = trip || {};
        const validTrip = !!assetId;
        return !!validTrip;
      })
      .map((trip) => {
        const initialActiveDevice = new IntitialActiveDevice(trip, this.dateService, this.liveTelamaticsService);
        this.allDevices.set(trip.asset.assetId, initialActiveDevice);
        return initialActiveDevice;
      });
    return devices;
  }

  public getLatestTripsByAssets(): Observable<LiveDevice[]> {
    const now = new Date();
    const last30Days = this.dateService.addOrSubtractDays(now, MIN_LATEST_TRIPS_DAYS, 'sub');
    const minStartDate = this.dateService.toDaysStartISO(new Date(last30Days));
    const params = new LatestTripByAssetIdParams({
      limit: 500,
      offset: 0,
      sort: 'asc',
      minStartDate,
      includeInsignificantTrips: true,
    });
    params['tagIds[]'] = this.tagIds;
    return this.commonHttpService.getLatestTripsByAssetId(params).pipe(
      map((res: any) => {
        const { trips = [] } = res.data;
        return this.formatLatestTrips(trips);
      })
    );
  }

  private getAssetTags(assetId: string): Observable<AssetTagsResp> {
    if (this.assetTagsCacheStore.has(assetId)) {
      return of(this.assetTagsCacheStore.get(assetId));
    }
    return this.commonHttpService.getAssetTags(assetId).pipe(
      catchError(() => {
        const tagsResp = {
          assetId,
          assetTags: [],
        };
        return of(tagsResp);
      }),
      tap((resp: AssetTagsResp) => {
        this.assetTagsCacheStore.set(assetId, resp);
      })
    );
  }

  public formatLiveTelematicsMessage(message: LiveTelematicsMessage): Observable<LiveDevice> {
    const { assetId, timestampUTC, tripId, driverId, eventType } = message.value;
    const ongoing = eventType !== 'Vehicle-Ignition-Off';
    if (!assetId) {
      return;
    }
    const previousDeviceState = this.allDevices.get(assetId);
    if (previousDeviceState) {
      const state = this.liveTelamaticsService.getLiveDeviceState({
        lastPingTimestampUTC: message.value.timestampUTC,
        ongoing,
      });
      const device = {
        ...previousDeviceState,
        ...message,
        ...message.value,
        timestamp: this.dateService.getLocalTimestamp(previousDeviceState.timezoneOffset, timestampUTC),
        ongoing,
        receivedLiveTelematicsUpdate: true,
        state: new BehaviorSubject(state),
      } as LiveDevice;
      if (device.stateTimerSubscription) {
        device.stateTimerSubscription.unsubscribe();
      }
      if (state === DeviceState.Active) {
        device.stateTimerSubscription = timer(DEVICE_GPS_UPDATE_TIMER_MIN * 60 * 1000).subscribe(() => {
          device.state.next(DeviceState.Amber);
        });
      }

      const existingAssetTagsObs = this.assetTagsObservables.get(assetId);
      if (existingAssetTagsObs) {
        return existingAssetTagsObs;
      }

      const assetTagsObs = this.getAssetTags(assetId).pipe(
        map((assetTagsResp: AssetTagsResp) => {
          device.assetTags = assetTagsResp.assetTags || [];
          return device;
        }),
        catchError(() => {
          return of({
            ...device,
            assetTags: [],
          });
        }),
        tap((device) => {
          this.allDevices.set(assetId, device);
          this.assetTagsObservables.delete(assetId);
        }),
        share()
      );
      this.assetTagsObservables.set(assetId, assetTagsObs);
      return assetTagsObs;
    }

    const existingTripDetailsObservable = this.tripDetailsObservables.get(assetId);
    if (existingTripDetailsObservable) {
      return existingTripDetailsObservable;
    }

    if (!(tripId && driverId)) {
      const state = this.liveTelamaticsService.getLiveDeviceState({
        lastPingTimestampUTC: message.value.timestampUTC,
        ongoing,
      });
      const device = {
        ...message,
        ...message.value,
        timezoneOffset: 0,
        timestamp: '',
        ongoing,
        statusUpdateTimestampUTC: '',
        receivedLiveTelematicsUpdate: true,
        state: new BehaviorSubject(state),
        currentLocationGeocodeData: new BehaviorSubject({}),
        firstLocationGeocodeData: new BehaviorSubject({}),
        assetTags: [],
      } as LiveDevice;
      if (state === DeviceState.Active) {
        device.stateTimerSubscription = timer(DEVICE_GPS_UPDATE_TIMER_MIN * 60 * 1000).subscribe(() => {
          device.state.next(DeviceState.Amber);
        });
      }
      this.allDevices.set(assetId, device);
      return of(device);
    }

    const tripDetailsParams = new GetTripDetailsParams({
      tripId,
      driverId,
    });
    const tripDetailsObervable = forkJoin([
      this.commonHttpService.getTripDetails(tripDetailsParams),
      this.commonHttpService.getAssetTags(assetId),
    ]).pipe(
      map(([tripDetails, assetTagsResp]: [any, AssetTagsResp]) => {
        const state = this.liveTelamaticsService.getLiveDeviceState({
          lastPingTimestampUTC: message.value.timestampUTC,
          ongoing,
        });
        const { firstLocation = {}, eventCount: { total: totalEventCount = 0 } = {} } = tripDetails;
        const activeDevice = {
          ...message,
          ...message.value,
          timezoneOffset: tripDetails.timezoneOffset,
          timestamp: this.dateService.getLocalTimestamp(tripDetails.timezoneOffset, timestampUTC),
          ongoing,
          statusUpdateTimestampUTC: tripDetails.statusUpdateTimestampUTC,
          receivedLiveTelematicsUpdate: true,
          state: new BehaviorSubject(state),
          currentLocationGeocodeData: new BehaviorSubject({}),
          firstLocationGeocodeData: new BehaviorSubject({}),
          firstLocation: firstLocation,
          totalEventCount: totalEventCount,
          driverName: tripDetails?.driverName,
          recordedInfo: tripDetails?.recordedInfo,
          assetTags: assetTagsResp.assetTags || [],
        } as LiveDevice;
        if (state === DeviceState.Active) {
          activeDevice.stateTimerSubscription = timer(DEVICE_GPS_UPDATE_TIMER_MIN * 60 * 1000).subscribe(() => {
            activeDevice.state.next(DeviceState.Amber);
            activeDevice.stateTimerSubscription.unsubscribe();
          });
        }
        return activeDevice;
      }),
      catchError(() => {
        const state = this.liveTelamaticsService.getLiveDeviceState({
          lastPingTimestampUTC: message.value.timestampUTC,
          ongoing,
        });
        return of({
          ...message,
          ...message.value,
          timezoneOffset: 0,
          timestamp: '',
          ongoing,
          receivedLiveTelematicsUpdate: true,
          statusUpdateTimestampUTC: '',
          state: new BehaviorSubject(state),
          currentLocationGeocodeData: new BehaviorSubject({}),
          firstLocationGeocodeData: new BehaviorSubject({}),
          assetTags: [],
        });
      }),
      tap((activeDevice) => {
        this.allDevices.set(assetId, activeDevice);
        this.tripDetailsObservables.delete(assetId);
      }),
      share()
    );
    this.tripDetailsObservables.set(assetId, tripDetailsObervable);
    return tripDetailsObervable;
  }

  public navigateToTripDetailsPage(device: LiveDevice, source: string) {
    const { tripId, deviceId, driverId, gpsData = {} as GpsData } = device;
    switch (device.state.getValue()) {
      case 'AMBER':
        source === 'table'
          ? this.gtmService.gotoTripDetailsFromLiveViewTable('AMBER', device?.assetId)
          : this.gtmService.gotoTripDetailsFromLiveViewMarker('AMBER', device?.assetId);
        break;
      case 'ACTIVE':
        source === 'table'
          ? this.gtmService.gotoTripDetailsFromLiveViewTable('ACTIVE', device?.assetId)
          : this.gtmService.gotoTripDetailsFromLiveViewMarker('ACTIVE', device?.assetId);
        break;

      default:
        source === 'table'
          ? this.gtmService.gotoTripDetailsFromLiveViewTable('INACTIVE', device?.assetId)
          : this.gtmService.gotoTripDetailsFromLiveViewMarker('INACTIVE', device?.assetId);
        break;
    }
    const queryParams = new TripDetailsPageQueryParams({
      tripId,
      deviceId,
      driverId,
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
    });
    this.router.navigate(['/trip-details'], { queryParams });
  }

  public openLivestreamModal(device: LiveDevice) {
    const { deviceId, assetId, tripId, asset, recordedInfo } = device;
    const { assetName } = device.asset;
    this.dialog.open(LivestreamModalComponent, {
      ...LIVESTREAM_MODAL_CONFIG,
      data: {
        deviceId,
        assetId,
        assetName,
        tripId,
        asset,
        recordedInfo,
      },
    });
  }
}
