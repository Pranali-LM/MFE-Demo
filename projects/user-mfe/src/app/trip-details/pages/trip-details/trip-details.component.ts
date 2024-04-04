import {
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { finalize, skip, takeUntil } from 'rxjs/operators';

import { DEVICE_GPS_UPDATE_TIMER_MIN, EVENTS_CONFIG, SHOW_EXTERNAL_EVENTS, US_CENTER_LAT_LNG } from '@app-core/constants/constants';
import { DeviceState, LiveDevice, LiveTelematicsMessage, TripDetailsPageQueryParams } from '@app-core/models/core.model';

import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { MapService } from '@app-core/services/map/map.service';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { LiveTelematicsService } from '@app-core/services/live-telematics/live-telematics.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { DriverImageComponent } from '@app-shared/components/driver-image/driver-image.component';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
// import { MapComponent } from '@app-shared/components/map/map.component';
import { DEFAULT_EDVR_RESOLUTION, DEFAULT_VIDEO_QUALITY } from '@app-trip-details/common/trip-details.constants';
import { CreateEdvrRequestBody, GetTripDetailsParams } from '@app-trip-details/common/trip-details.model';
import { Socket } from 'socket.io-client';
import { MapTooltipComponent } from '../../components/map-tooltip/map-tooltip.component';
import { TranslateService } from '@ngx-translate/core';
import { DateService } from '@app-core/services/date/date.service';
import { LatLng } from 'leaflet';

import { OrientationBlockerComponent } from '@app-shared/components/orientation-blocker/orientation-blocker.component';
import { BREAKPOINTS_PORTRAIT } from '@app-core/constants/constants';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MapBoxMapComponent } from '@app-shared/components/map-box-map/map-box-map.component';

import { MAPBOX_ACCESS_TOKEN } from '@app-request-video/constants/request-video.constants';
import mapboxgl from 'mapbox-gl';
import * as polyline from '@mapbox/polyline'; // Import the polyline library
import { CLIENT_CONFIG } from '@config/config';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss'],
})
export class TripDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true })
  private mapComponent: MapBoxMapComponent;

  public eventsList: any[] = [];
  public markerList: any[] = [];
  public currentTimeZone: string;
  public show = 'spinner';
  public tripDetails;
  public pathList: any[] = [];
  public polylinePathInfoList: string = '';
  public mapInitialCoordinates = {};

  private showExternalEvents = SHOW_EXTERNAL_EVENTS;
  public clientConfig = CLIENT_CONFIG;
  private showDvrEvents = true;
  private showPossibleCollisionEvents = true;
  private toolTipFactory: ComponentFactory<MapTooltipComponent>;
  private data: TripDetailsPageQueryParams;
  private actualEventsList = [];
  private externalEventsList = [];
  private dvrEventList = [];
  private possibleCollisionEventList = [];
  private customerName = '';
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private filterEvents: Subject<void> = new Subject<void>();
  private mapIcons: any = {};
  private selectedSeverity = 'all';
  private eventsToBeShown = [];
  private eventsConfig = EVENTS_CONFIG;
  public loader = true;
  public eventConfig = null;
  public driverThumbnail: string;
  public currentDateFormat: string;
  public customMapOptions = {
    fullscreenButton: {
      top: '84px',
      left: '10px',
    },
    recenterButton: {
      top: '124px',
      left: '10px',
      color: '#000000',
    },
    speedText: {
      top: '170px',
      left: '10px',
    },
    fitBoundsOnMarkerChange: false,
    fitBoundsOnPathChange: false,
  };
  private deviceLevelViewSocket: Socket;
  public ongoingTripMarker: L.Marker;
  public liveTelematicsEnabled = false;
  public liveTelematicsMessage$ = new Subject<LiveDevice>();
  public startLocation = {
    startLocationCity: '',
    startLocationFullAddress: '',
  };
  public endLocation = {
    endLocationCity: '',
    endLocationFullAddress: '',
  };
  public deviceState = DeviceState;
  private deviceStateTimerSubscription: Subscription;
  public isDvrAvailable = false;
  private isTripOngoing: boolean;

  constructor(
    private accessService: AccessService,
    private tripDetailsService: TripDetailsService,
    private mapService: MapService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private route: ActivatedRoute,
    public dataService: DataService,
    private gtmService: GoogleTagManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private snackBarService: SnackBarService,
    private liveTelematicsService: LiveTelematicsService,
    public translate: TranslateService,
    private dateService: DateService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.toolTipFactory = this.resolver.resolveComponentFactory(MapTooltipComponent);
  }

  public ngOnInit() {
    this.breakpointObserver.observe(BREAKPOINTS_PORTRAIT).subscribe((state: BreakpointState) => {
      if (state.matches && this.router.url.includes('/trip-details?tripId=')) {
        this.dialog.closeAll();
        this.dialog.open(OrientationBlockerComponent, {
          panelClass: ['orientation-modal'],
          data: {
            title: this.translate.instant('appRotateYourDevice'),
            description: this.translate.instant('appRotateYourDeviceToPortraitDescription'),
            imageUrl: 'assets/common/mobile-rotation-icon.svg',
          },
        });
      }
    });
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = { ...EVENTS_CONFIG, ...this.dataService.transformObject(combinedEventsList) };
    this.eventsConfig = modifiedEventsConfig;
    this.eventsToBeShown = Object.keys({
      ...this.eventsConfig,
    });

    this.deviceLevelViewSocket = this.liveTelematicsService.deviceLevelViewSocket;
    this.liveTelematicsEnabled = this.route.snapshot.data['liveTelematicsEnabled'];
    ({ customerName: this.customerName = '' } = this.accessService.getLoginInfo() || {});
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: TripDetailsPageQueryParams) => {
      this.data = params;
      this.getTripDetails();
    });

    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
        const allEventList = [
          ...this.actualEventsList,
          ...(this.showDvrEvents ? this.dvrEventList : []),
          ...(this.showExternalEvents ? this.externalEventsList : []),
          ...(this.showPossibleCollisionEvents ? this.possibleCollisionEventList : []),
        ];
        if (this.tripDetails) {
          this.markerList = this.createMarkerListMapBox(allEventList);
        }
      }
    });

    this.dataService._currentLanguage.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value && this.tripDetails) {
        this.translate.use(value);
        setTimeout(() => {
          this.translate
            .get(['tripDetailsTripStart', 'tripDetailsOngoinTrip', 'tripDetailsTripEnd', 'eventsTableClickVideoOrImage'])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.cdRef.detectChanges();
              this.updateEventListAndMarkers();
            });
        }, 100);
      }
    });

    this.dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });

    this.filterEvents.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.updateEventListAndMarkers();
    });
  }

  public ngOnDestroy() {
    if (this.deviceLevelViewSocket.connected) {
      this.deviceLevelViewSocket.disconnect();
    }
    if (this.deviceStateTimerSubscription) {
      this.deviceStateTimerSubscription.unsubscribe();
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private listenToLiveTelematicsMessages() {
    const { deviceId: tripDetailsFromQuery } = this.data;
    const { device: { deviceId = tripDetailsFromQuery } = {} } = this.tripDetails;
    if (!deviceId) {
      return;
    }
    this.deviceLevelViewSocket.auth = {
      deviceId,
      tripId: this.tripDetails.tripId,
    };
    this.deviceLevelViewSocket.on('connect', () => {
      this.snackBarService.success(this.translate.instant('tripDetailsConnected'));
    });
    this.deviceLevelViewSocket.on('disconnect', () => {
      this.snackBarService.failure(this.translate.instant('tripDetailsDisConnected'));
    });
    this.deviceLevelViewSocket.on('device-update', (message: LiveTelematicsMessage) => {
      const {
        pathInfo = [],
        violations = [],
        timezoneOffset = 0,
        statusUpdateTimestamp: statusUpdateTimestampUTC,
        customEvents = [],
      } = this.tripDetails;
      const ongoing = message.value.eventType !== 'Vehicle-Ignition-Off';
      const state = this.liveTelematicsService.getLiveDeviceState({
        lastPingTimestampUTC: message.value.timestampUTC,
        ongoing,
      });
      const liveDevice: LiveDevice = {
        ...message,
        ...message.value,
        timezoneOffset,
        timestamp: this.tripDetailsService.getLocalTimestamp(timezoneOffset, message.value.timestampUTC),
        ongoing,
        statusUpdateTimestampUTC,
        receivedLiveTelematicsUpdate: true,
        state: new BehaviorSubject(state),
      };
      const currentMessageTime = new Date(liveDevice.timestampUTC).getTime();
      const hasValidLatLng = this.tripDetailsService.deviceHasValidLatLng(liveDevice);

      const { timestampUTC: lastKnownLocationTime = 0 } = pathInfo[pathInfo.length - 1] || {};
      const isNextLocationPoint = !lastKnownLocationTime || currentMessageTime > lastKnownLocationTime;
      if (isNextLocationPoint) {
        this.tripDetails.deviceState.next(state);
        this.startDeviceStateTimer(state);
        const timeElapsed = (new Date(liveDevice.timestampUTC).getTime() - new Date(this.tripDetails.endTimeUTC).getTime()) / 1000;
        this.tripDetails.endTime = liveDevice.timestamp;
        this.tripDetails.endTimeUTC = liveDevice.timestampUTC;
        this.tripDetails.duration = this.tripDetails.duration + (timeElapsed || 0);
        this.tripDetails.tripDistance = this.tripDetails.tripDistance + (liveDevice.distance || 0);
        this.liveTelematicsMessage$.next(liveDevice);
        let latlng: LatLng;
        if (hasValidLatLng) {
          latlng = this.mapService.getLatLong(liveDevice.gpsData.latitude, liveDevice.gpsData.longitude);
          this.pathList = this.pathList.concat([latlng]);
          this.mapComponent.centerMarker(liveDevice.gpsData.latitude, liveDevice.gpsData.longitude);
        }
        if (this.ongoingTripMarker) {
          const tooltipTemplate = this.getToolTipTemplate({
            eventTypeLabel: this.translate.instant('tripDetailsOngoinTrip'),
            timestampUTC: liveDevice.timestampUTC,
            timestamp: liveDevice.timestamp,
          });
          this.ongoingTripMarker.setTooltipContent(tooltipTemplate);
          if (hasValidLatLng) {
            this.ongoingTripMarker.setLatLng(latlng);
          }
        }
      }

      if (liveDevice.messageType === 'event' && this.eventsToBeShown.includes(liveDevice.eventType)) {
        const { timestampUTC: lastViolationTimestampUTC = '' } = violations[violations.length - 1] || {};
        const lastViolationTime = lastViolationTimestampUTC && new Date(lastViolationTimestampUTC).getTime();
        const isNextViolation = !lastViolationTime || currentMessageTime > lastViolationTime;
        if (isNextViolation) {
          this.tripDetails.violations.push({
            ...liveDevice,
            ...liveDevice.gpsData,
            eventVideoFilename: 'assets/common/media-upload-pending.png',
          });
          this.tripDetails.eventCount.total = this.tripDetails.eventCount.total + 1;
          this.tripDetails.eventCount[liveDevice.eventType] = this.tripDetails.eventCount[liveDevice.eventType] + 1;
          this.updateEventListAndMarkers();
        }
      }

      if (liveDevice.messageType === 'event' && liveDevice.eventType === 'Custom-Triggered') {
        const { timestampUTC: lastCustomEventTimestampUTC = '' } = customEvents[customEvents.length - 1] || {};
        const lastCustomEventTime = lastCustomEventTimestampUTC && new Date(lastCustomEventTimestampUTC).getTime();
        const isNextCustomEvent = !lastCustomEventTime || currentMessageTime > lastCustomEventTime;
        if (isNextCustomEvent) {
          this.tripDetails.customEvents.push({
            ...liveDevice,
            ...liveDevice.gpsData,
            eventVideoFilename: 'assets/common/media-upload-pending.png',
          });
          this.externalEventsList.push({
            ...liveDevice,
            ...liveDevice.gpsData,
            isExternalEvent: true,
            eventMediaType: 'image',
            eventVideoFilename: 'assets/common/media-upload-pending.png',
            eventTypeLabel: this.tripDetailsService.getCustomEventLabel(liveDevice, this.customerName),
            showLoader: false,
          });
          this.updateEventListAndMarkers();
        }
      }

      if (liveDevice.eventType === 'Vehicle-Ignition-Off') {
        this.deviceLevelViewSocket.disconnect();
        this.tripDetails.ongoing = false;
        this.tripDetails.deviceState.next(DeviceState.Inactive);
        this.updateEventListAndMarkers();
        setTimeout(() => {
          this.mapComponent.recenterMarkers();
        }, 200);
      }
    });
    this.deviceLevelViewSocket.connect();
  }

  private listenForDeviceStateChange() {
    this.tripDetails.deviceState.pipe(takeUntil(this.ngUnsubscribe), skip(1)).subscribe(() => {
      if (this.ongoingTripMarker) {
        const icon = this.getEndMarkerIcon();
        this.ongoingTripMarker.setIcon(icon);
      }
    });
  }

  private startDeviceStateTimer(state: DeviceState) {
    if (this.deviceStateTimerSubscription) {
      this.deviceStateTimerSubscription.unsubscribe();
    }
    if (state === DeviceState.Active) {
      this.deviceStateTimerSubscription = timer(DEVICE_GPS_UPDATE_TIMER_MIN * 60 * 1000).subscribe(() => {
        this.tripDetails.deviceState.next(DeviceState.Amber);
      });
    }
  }

  private updateEventListAndMarkers() {
    const { violations = [] } = this.tripDetails || {};
    this.actualEventsList = this.getEventsList(violations, this.eventsToBeShown, this.eventConfig).filter((event: any) => !event.reportBug);
    const allEventList = [
      ...this.actualEventsList,
      ...(this.showDvrEvents ? this.dvrEventList : []),
      ...(this.showExternalEvents ? this.externalEventsList : []),
      ...(this.showPossibleCollisionEvents ? this.possibleCollisionEventList : []),
    ];
    this.eventsList =
      this.selectedSeverity !== 'all' ? allEventList.filter((e) => e.severityCategory === this.selectedSeverity) : allEventList;
    this.markerList = this.createMarkerListMapBox(this.eventsList);
  }

  public getTripDetails() {
    this.loader = true;
    const { tripId, driverId, latitude, longitude } = this.data;
    this.mapInitialCoordinates = { latitude, longitude };
    const params = new GetTripDetailsParams({
      tripId,
      driverId,
      includeViolations: true,
      includePathInfo: true,
      includeCustomEvents: true,
      includeUploadRequests: true,
      includeTripConfig: true,
      includeFRResults: true,
      includeDebugEvents: true,
      excludeChallengeAcceptedViolations: true,
      includePolylinePathInfo: false,
    });
    this.show = 'spinner';
    this.tripDetailsService
      .getTripDetails(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.tripDetails = res;
          this.checkDvrAvailiability();
          const {
            ongoing = false,
            frResults = [],
            sampleDriverImage,
            firstLocation = {},
            lastLocation = {},
            statusUpdateTimestamp,
            debug = [],
            pathInfo = [],
            polylinePath = '',
          } = this.tripDetails;
          this.isTripOngoing = ongoing;
          const deviceState = this.liveTelematicsService.getLiveDeviceState({
            statusUpdateTimestampUTC: statusUpdateTimestamp,
            ongoing,
          });
          this.tripDetails.deviceState = new BehaviorSubject(deviceState);
          this.startDeviceStateTimer(deviceState);
          this.getStartLocation(firstLocation);
          this.getEndLocation(lastLocation);

          if (sampleDriverImage) {
            this.driverThumbnail = 'assets/common/no-avatar.svg';
          }
          if (frResults && frResults.length && frResults[0].thumbnailSmall) {
            this.driverThumbnail = frResults[0].thumbnailSmall || 'assets/common/no-avatar.svg';
          } else {
            this.driverThumbnail = 'assets/common/no-avatar.svg';
          }

          this.eventConfig = res.config;
          this.actualEventsList = this.getEventsList(res.violations, this.eventsToBeShown, this.eventConfig);
          this.externalEventsList = (res.customEvents || []).map((event) => {
            const { eventVideoFile = '' } = event;
            const eventMediaType = eventVideoFile.indexOf('.mp4') > -1 ? 'video' : 'image';
            return {
              ...event,
              isExternalEvent: true,
              eventMediaType,
              eventTypeLabel: this.tripDetailsService.getCustomEventLabel(event, this.customerName),
              showLoader: false,
            };
          });
          this.dvrEventList = res.finishedDvrEventList || [];
          this.possibleCollisionEventList =
            debug
              .filter((x: any) => x.eventType === 'PotentialCrash')
              .map((y) => {
                return {
                  ...y,
                  eventTypeLabel: 'Possible Collision',
                };
              }) || [];

          const allEventList = [
            ...this.actualEventsList,
            ...this.dvrEventList,
            ...this.possibleCollisionEventList,
            ...(this.showExternalEvents ? this.externalEventsList : []),
          ];
          this.eventsList = allEventList.filter((event: any) => !event.reportBug);

          allEventList.sort((a, b) => {
            const var1 = new Date(a.timestampUTC);
            const var2 = new Date(b.timestampUTC);
            if (var1 < var2) {
              return -1;
            }
            if (var1 > var2) {
              return 1;
            }
            return 0;
          });
          if (ongoing) {
            this.pathList = pathInfo
              .map((x: any) => [x.longitude, x.latitude, x.bearing, x.speed])
              .filter((y: any) => y[0] !== 0 && y[1] !== 0);
          } else {
            this.polylinePathInfoList = polylinePath;
            // Decode the polyline
            const decodedCoordinates: Array<any> = polyline.decode(this.polylinePathInfoList).map((point) => {
              return [point[1], point[0]]; // Swap longitude and latitude
            });

            if (decodedCoordinates?.length) {
              this.pathList = decodedCoordinates;
            } else {
              this.pathList = pathInfo
                .map((x: any) => [x.longitude, x.latitude, x.bearing, x.speed])
                .filter((y: any) => y[0] !== 0 && y[1] !== 0);
            }
          }
          this.markerList = this.createMarkerListMapBox(this.eventsList);
          this.show = 'content';
          setTimeout(() => {
            this.mapComponent.recenterMarkers();
          }, 500);
          if (ongoing && this.liveTelematicsEnabled) {
            this.listenToLiveTelematicsMessages();
            this.listenForDeviceStateChange();
          }
        },
        () => {
          this.show = 'noContent';
          this.loader = false;
        }
      );
  }

  private getStartLocation(startlocation: any) {
    const { latitude = 0, longitude = 0 } = startlocation || {};
    const params = {
      location: `${longitude},${latitude}`,
    };
    this.tripDetailsService
      .getLocationData(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        (res) => {
          const { address = {} } = res || {};
          const { City = '', LongLabel = '' } = address || {};

          if (City !== '' && LongLabel !== '') {
            this.startLocation = {
              startLocationCity: City,
              startLocationFullAddress: LongLabel,
            };
          } else {
            this.startLocation = {
              startLocationCity: 'Unknown',
              startLocationFullAddress: null,
            };
          }
        },
        () => {
          this.startLocation = undefined;
        }
      );
  }

  private getEndLocation(endLocation: any) {
    const { latitude = 0, longitude = 0 } = endLocation || {};
    const params = {
      location: `${longitude},${latitude}`,
    };
    this.tripDetailsService
      .getLocationData(params)
      .pipe(
        finalize(() => {
          // this.markerList = this.createMarkerList(this.eventsList);
          this.markerList = this.createMarkerListMapBox(this.eventsList);
          this.loader = false;
        })
      )
      .subscribe(
        (res) => {
          const { address = {} } = res || {};
          const { City = '', LongLabel = '' } = address || {};

          if (City !== '' && LongLabel !== '') {
            this.endLocation = {
              endLocationCity: City,
              endLocationFullAddress: LongLabel,
            };
          } else {
            this.endLocation = {
              endLocationCity: 'Unknown',
              endLocationFullAddress: null,
            };
          }
        },
        () => {
          this.endLocation = undefined;
        }
      );
  }

  private getEventsList(violations = [], eventsToBeShown = [], eventConfig = {}): any[] {
    const eventsList = (violations || [])
      .filter((event) => eventsToBeShown.includes(event.eventType))
      .map((event) => {
        const eventTypeLabel = this.eventsConfig[event.eventType].label || event.eventType;
        const isEventSpecificEdvrEnabled = !!(eventConfig[event.eventType] || {}).edvrEnabled;
        return { ...event, eventTypeLabel, isEventSpecificEdvrEnabled };
      });

    return eventsList;
  }

  public checkDvrAvailiability() {
    this.isDvrAvailable = true;
    const { device = {}, startTimeUTC = '' } = this.tripDetails || {};
    const dateRange = this.dateService.getDateRangeInISO(30);
    const { from, to } = dateRange;
    const params = {
      startDate: from,
      endDate: to,
      deviceId: device.deviceId,
      limit: 3,
      eventTypes: ['Device-Storage', 'TripStarted', 'TripEnded'],
    };
    this.tripDetailsService
      .checkDvrAvailibility(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          const { events = [] } = res || {};
          const { oldestDvrTimestamp = null } = events
            .filter((x: any) => x !== null && x.hasOwnProperty('oldestDvrTimestamp'))
            .reduce((a: any, b: any) => (a.timestampUTC > b.timestampUTC ? a : b), {});
          if (oldestDvrTimestamp) {
            if (new Date(oldestDvrTimestamp).getTime() < new Date(startTimeUTC).getTime()) {
              this.isDvrAvailable = true;
            } else {
              this.isDvrAvailable = false;
            }
          } else {
            this.isDvrAvailable = true;
          }
        },
        () => {
          this.isDvrAvailable = false;
        }
      );
  }

  /**
   * Crate a marker list
   */
  public createMarkerList(events = []): any[] {
    const startStopMarkers = [...this.getStartAndEndTripMarkers()];
    const eventMarkers = events
      .filter(({ latitude, longitude }) => +latitude || +longitude)
      .map((event, index) => {
        const { latitude, longitude } = event;
        const template = this.getToolTipTemplate(event);

        const tooltip = this.mapService.getTooltip(template);
        const marker = this.mapService.getMarker(+latitude, +longitude, this.mapIcons.eventIcon);
        marker.bindTooltip(tooltip);
        marker.on('click', () => {
          this.showMedia({
            allEvents: [events[index]],
            currentIndex: 0,
            isTripDetails: true,
          });
          this.pushMarkerClickGaEvent(event);
        });
        return marker;
      });
    return [...eventMarkers, ...startStopMarkers];
  }

  public createMarkerListMapBox(events = []): any[] {
    const startStopMarkers = [...this.getStartAndEndTripMarkersMapBox()];
    const eventMarkers = events
      .filter((event) => {
        const { latitude, longitude } = this.isTripOngoing ? event : event.nearestCoordinates ? event?.nearestCoordinates : event;
        return +latitude || +longitude;
      })
      .map((event) => {
        const { latitude, longitude } = this.isTripOngoing ? event : event.nearestCoordinates ? event?.nearestCoordinates : event;
        const template = this.getToolTipTemplate(event);
        const popupContent = template.innerHTML;
        const popup = this.createCustomPopup(popupContent);
        const marker = new mapboxgl.Marker({ color: '#005dbb' }).setLngLat([longitude, latitude]);
        marker.setPopup(popup);
        return marker;
      });
    return [...eventMarkers, ...startStopMarkers];
  }

  private getStartAndEndTripMarkersMapBox() {
    const { ongoing = false } = this.tripDetails || {};
    const fallbackStartLocation = this.pathList[0] || {};
    const fallbackEndLocation = this.pathList[this.pathList.length - 1] || {};
    const startTripMarker = this.getStartTripMarkersMapBox(fallbackStartLocation.lat, fallbackStartLocation.lng);
    const endTripMarker = this.getEndTripMarkersMapBox(fallbackEndLocation.lat, fallbackEndLocation.lng, ongoing);
    this.ongoingTripMarker = endTripMarker[0];
    return [...startTripMarker, ...endTripMarker];
  }

  private getToolTipTemplate(data) {
    this.toolTipFactory = this.resolver.resolveComponentFactory(MapTooltipComponent);
    const component = this.toolTipFactory.create(this.injector);
    component.instance.data = data;
    component.changeDetectorRef.detectChanges();
    const element = component.location.nativeElement;
    return element;
  }

  private getStartAndEndTripMarkers() {
    const { ongoing = false } = this.tripDetails || {};
    const fallbackStartLocation = this.pathList[0] || {};
    const fallbackEndLocation = this.pathList[this.pathList.length - 1] || {};
    const startTripMarker = this.getStartTripMarkers(fallbackStartLocation.lat, fallbackStartLocation.lng);
    const endTripMarker = this.getEndTripMarkers(fallbackEndLocation.lat, fallbackEndLocation.lng, ongoing);
    this.ongoingTripMarker = endTripMarker[0];
    return [...startTripMarker, ...endTripMarker];
  }

  private getEndMarkerIcon(): L.Icon {
    if (!this.tripDetails.ongoing) {
      return this.mapIcons.endIcon;
    }
    if (this.tripDetails.deviceState.getValue() === DeviceState.Active) {
      return this.mapIcons.activeOngoingIcon;
    }
    return this.mapIcons.amberOngoingIcon;
  }

  private getStartTripMarkers(fallBackLatitude = 0, fallbackLongitude = 0) {
    const { firstLocation = {} } = this.tripDetails;
    const latitude = firstLocation.latitude || fallBackLatitude;
    const longitude = firstLocation.longitude || fallbackLongitude;

    if (!latitude && !longitude) {
      return [];
    }
    const marker = this.mapService.getMarker(+latitude, +longitude, this.mapIcons.startIcon);
    const { startTime = '', startTimeUTC = '' } = this.tripDetails || {};
    const tooltipTempalate = this.getToolTipTemplate({
      eventTypeLabel: this.translate.instant('tripDetailsTripStart'),
      timestampUTC: startTimeUTC,
      timestamp: startTime,
      fullAddress: this.startLocation.startLocationFullAddress || undefined,
    });
    const tooltip = this.mapService.getTooltip(tooltipTempalate);
    marker.bindTooltip(tooltip);
    return [marker];
  }

  private getStartTripMarkersMapBox(fallBackLatitude = 0, fallbackLongitude = 0) {
    const { firstLocation = {} } = this.tripDetails;
    const latitude = firstLocation.latitude || fallBackLatitude;
    const longitude = firstLocation.longitude || fallbackLongitude;
    if (!latitude && !longitude) {
      return [];
    }
    const marker = new mapboxgl.Marker({ color: 'green' }).setLngLat([longitude, latitude]);
    const { startTime = '', startTimeUTC = '' } = this.tripDetails || {};
    const template = this.getToolTipTemplate({
      eventTypeLabel: this.translate.instant('tripDetailsTripStart'),
      timestampUTC: startTimeUTC,
      timestamp: startTime,
      fullAddress: this.startLocation.startLocationFullAddress || undefined,
    });
    const popupContent = template.innerHTML;
    const popup = this.createCustomPopup(popupContent);
    marker.setPopup(popup);
    return [marker];
  }

  private getEndTripMarkers(fallBackLatitude = 0, fallbackLongitude = 0, ongoing = false) {
    const { lastLocation = {}, firstLocation = {}, lastKnownLocation = {} } = this.tripDetails;
    const latitude = lastLocation.latitude || fallBackLatitude || lastKnownLocation.latitude || firstLocation.latitude;
    const longitude = lastLocation.longitude || fallbackLongitude || lastKnownLocation.longitude || firstLocation.longitude;

    if (!latitude && !longitude) {
      return [];
    }
    const endMarkerIcon = this.getEndMarkerIcon();
    const marker = this.mapService.getMarker(+latitude, +longitude, endMarkerIcon);
    const { endTimeUTC, startTimeUTC, statusUpdateTimestamp: statusUpdateTimestampUTC, timezoneOffset } = this.tripDetails || {};
    const timestampUTC = (!ongoing && endTimeUTC) || statusUpdateTimestampUTC || startTimeUTC;
    const timestamp = this.dateService.getLocalTimestamp(timezoneOffset, timestampUTC);
    const tooltipTempalate = this.getToolTipTemplate({
      eventTypeLabel: ongoing ? this.translate.instant('tripDetailsOngoinTrip') : this.translate.instant('tripDetailsTripEnd'),
      timestampUTC,
      timestamp,
      fullAddress: this.endLocation.endLocationFullAddress || undefined,
    });
    const tooltip = this.mapService.getTooltip(tooltipTempalate);
    marker.bindTooltip(tooltip);
    return [marker];
  }

  private getEndTripMarkersMapBox(fallBackLatitude = 0, fallbackLongitude = 0, ongoing = false) {
    const { lastLocation = {}, firstLocation = {}, lastKnownLocation = {} } = this.tripDetails;
    const latitude = lastLocation.latitude || fallBackLatitude || lastKnownLocation.latitude || firstLocation.latitude;
    const longitude = lastLocation.longitude || fallbackLongitude || lastKnownLocation.longitude || firstLocation.longitude;

    if (!latitude && !longitude) {
      return [];
    }
    const endMarkerIcon = this.getEndMarkerIconMapBox();
    const marker = new mapboxgl.Marker(endMarkerIcon).setLngLat([longitude, latitude]);
    const { endTimeUTC, startTimeUTC, statusUpdateTimestamp: statusUpdateTimestampUTC, timezoneOffset } = this.tripDetails || {};
    const timestampUTC = (!ongoing && endTimeUTC) || statusUpdateTimestampUTC || startTimeUTC;
    const timestamp = this.dateService.getLocalTimestamp(timezoneOffset, timestampUTC);
    const template = this.getToolTipTemplate({
      eventTypeLabel: ongoing ? this.translate.instant('tripDetailsOngoinTrip') : this.translate.instant('tripDetailsTripEnd'),
      timestampUTC,
      timestamp,
      fullAddress: this.endLocation.endLocationFullAddress || undefined,
    });
    const popupContent = template.innerHTML;
    const popup = this.createCustomPopup(popupContent);
    marker.setPopup(popup);
    return [marker];
  }

  private pushMarkerClickGaEvent(event) {
    if (!event) {
      return;
    }
    this.gtmService.incidentMarkerClick(event.eventTypeLabel);
  }

  /**
   * Filter the marker list and incident table rows
   * @param events Events to be shown
   */
  public onEventSelection(events: string[] = []) {
    this.eventsToBeShown = events;
    this.showExternalEvents = events.includes('externalEvents');
    this.showDvrEvents = events.includes('dvrEvents');
    this.showPossibleCollisionEvents = events.includes('possibleCollision');
    if (events.length === 0) {
      this.showExternalEvents = true;
      this.showDvrEvents = true;
      this.showPossibleCollisionEvents = true;
      this.eventsToBeShown = Object.keys(this.eventsConfig);
    }
    this.filterEvents.next();
  }

  /**
   * Click on events table button
   * @param event event being clicked
   */
  public onIncidentButtonClick(event: any = {}) {
    if (!event) {
      return;
    }
    const { currentIndex = 0, allEvents = [] } = event || {};
    const { eventTypeLabel = '' } = allEvents[currentIndex] || {};
    this.gtmService.incidentButtonClick(eventTypeLabel);
    this.showMedia(event);
  }

  /**
   * Open video modal
   * @param event event
   */
  private showMedia(event: any = {}) {
    const { currentIndex = 0, allEvents = [] } = event || {};
    const { driverId = '', fleetId = '', tripId = '' } = this.tripDetails || {};
    const allTripEvents = allEvents.map((x: any, idx: number) => {
      return {
        ...x,
        showCoachingCompleted: false,
        fleetId,
        driverId,
        tripId,
        positionIndex: idx,
      };
    });

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: 'TripDetails',
        allEvents: allTripEvents,
        currentIndex,
        isTripDetails: true,
      },
    });
  }

  public copyToClipboard(copyText) {
    const listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', copyText);
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
    this.snackBar.open(this.translate.instant('tripDetailsTripIdCopied'), null, {
      duration: 1000,
    });
  }

  public requestEDVR(event) {
    this.gtmService.createEdvrRequest(event.eventTypeLabel);
    const videoQuality = DEFAULT_VIDEO_QUALITY;
    const videoResolution = DEFAULT_EDVR_RESOLUTION;
    const { tripId = '', fleetId = '', driverId = '' } = this.tripDetails;

    const eventIndex = event.eventIndex;
    const body = new CreateEdvrRequestBody({
      tripId,
      fleetId,
      driverId,
      eventIndex,
      videoQuality,
      videoResolution,
    });
    this.tripDetailsService.createEdvrRequest(body).subscribe(
      () => {
        this.updateEdvrStatus(event);
        this.eventsList = this.eventsList.map((e) => {
          if (e.eventIndex === event.eventIndex) {
            return {
              ...e,
              edvrRequests: [...(e.edvrRequests || []), { status: 'PENDING' }],
              showLoader: false,
            };
          }
          return e;
        });
        this.snackBarService.success(this.translate.instant('tripDetailsHDVideoRequested'));
      },
      () => {
        this.eventsList = this.eventsList.map((e) => {
          if (e.eventIndex === event.eventIndex) {
            return {
              ...e,
              showLoader: false,
            };
          }
          return e;
        });
        this.snackBarService.failure(this.translate.instant('tripDetailsHDVideoFailed'));
      }
    );
  }

  private updateEdvrStatus(event = {} as any) {
    const { violations = [] } = this.tripDetails || {};
    const violationIndex = violations.findIndex((e) => e.eventIndex === event.eventIndex);
    if (violationIndex > -1) {
      const oldEvent = this.tripDetails.violations[violationIndex];
      const newEvent = {
        ...oldEvent,
        edvrRequests: [...(oldEvent.edvrRequests || []), { status: 'PENDING' }],
      };
      this.tripDetails.violations[violationIndex] = newEvent;
      return;
    }
    const customEventIndex = this.externalEventsList.findIndex((e) => e.eventIndex === event.eventIndex);
    if (customEventIndex > -1) {
      const oldEvent = this.externalEventsList[customEventIndex];
      const newEvent = {
        ...oldEvent,
        edvrRequests: [...(oldEvent.edvrRequests || []), { status: 'PENDING' }],
      };
      this.externalEventsList[customEventIndex] = newEvent;
    }
    return;
  }

  public onSeverityCategoryChange(severityCategory: string) {
    this.selectedSeverity = severityCategory;
    this.gtmService.changeEventSeverityFilter(severityCategory);
    this.filterEvents.next();
  }

  public showDriverImage() {
    const { thumbnail = '', metadata: metaData = {} } = this.tripDetails.frResults[0] || [];
    const { sampleDriverImage = '', tripId = '', frResultsCorrected = false, sampleDriverImageFaceCoordinates = {} } = this.tripDetails;
    const { driverId = '', driverName } = this.tripDetails;
    this.dialog.open(DriverImageComponent, {
      position: { top: '24px' },
      panelClass: ['mobile-modal'],
      width: '688px',
      data: {
        source: 'tripDetails',
        recognizedDriverImage: thumbnail,
        driverId,
        driverName,
        sampleDriverImage,
        tripId,
        frResultsCorrected,
        sampleDriverImageFaceCoordinates,
        metaData,
        showFeedbackTab: true,
        isDriverImage: true,
        showCoachingCompleted: false,
        isTripDetails: true,
      },
    });
  }

  public navigateBack() {
    this.tripDetailsService.back();
  }

  public requestVideo() {
    const {
      tripId,
      driverId,
      firstLocation: { latitude = US_CENTER_LAT_LNG.latitude, longitude = US_CENTER_LAT_LNG.longitude } = {},
    } = this.tripDetails || {};
    this.gtmService.gotoRequestVideoPageFromTripDetailsPage(this.tripDetails.asset.assetId || this.tripDetails.assetId, driverId);
    this.router.navigate(['/request-video'], {
      queryParams: {
        tripId,
        driverId,
        latitude,
        longitude,
      },
    });
  }

  public requestLivestreamAction() {
    this.tripDetailsService.openLivestreamModal(this.tripDetails);
  }

  public getEndMarkerIconMapBox() {
    if (!this.tripDetails.ongoing) {
      return { color: 'red' };
    }
    if (this.tripDetails.deviceState.getValue() === DeviceState.Active) {
      return this.getOngoingIconMapBox(this.deviceState.Active);
    }
    return this.getOngoingIconMapBox(this.deviceState.Amber);
  }

  private createCustomPopup(content) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      className: 'custom-mapbox-popup',
    });

    popup.setHTML(content);

    return popup;
  }

  public getOngoingIconMapBox(state) {
    const stateClass = `${state.toLowerCase()}-state`;

    const divIcon = document.createElement('div');
    divIcon.className = 'css-icon';
    divIcon.innerHTML = `<div class="gps-point ${stateClass}"></div><div class="gps-circle ${stateClass}"></div>`;
    return { element: divIcon };
  }

  public showMediaMarker(data: any) {
    const latLong = data._lngLat;
    const { lng, lat } = latLong;
    const matchingObjects: any[] = this.eventsList.filter((obj) => {
      if (this.isTripOngoing) {
        return obj.longitude === lng && obj.latitude === lat;
      } else {
        if (obj?.nearestCoordinates) {
          return (
            (obj?.nearestCoordinates.longitude || obj?.longitude) === lng && (obj?.nearestCoordinates.latitude || obj?.latitude) === lat
          );
        } else {
          return obj?.longitude === lng && obj?.latitude === lat;
        }
      }
    });
    if (matchingObjects.length) {
      this.showMedia({
        allEvents: [matchingObjects[0]],
        currentIndex: 0,
        isTripDetails: true,
      });
    }
  }
}
