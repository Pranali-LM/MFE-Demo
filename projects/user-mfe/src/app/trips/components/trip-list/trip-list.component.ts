import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { forkJoin, of as observableOf, of, Subject } from 'rxjs';
import { catchError, finalize, map, takeUntil } from 'rxjs/operators';

import { BREAKPOINTS_SMALL, EVENTS_CONFIG, US_CENTER_LAT_LNG } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { TRIP_TABLE_COLUMNS, TRIPS_TABLE_PAGE_SIZE } from '@app-trips/common/trips.constants';
import { TripDetailsPageQueryParams, TripListParams } from '@app-trips/common/trips.model';
import { TripsService } from '@app-trips/services/trips.service';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { DriverImageComponent } from '@app-shared/components/driver-image/driver-image.component';
import { TripsTableState } from '@app-trips/reducers';
import { initialState as initialTripsTableState } from '@app-trips/reducers/trips-table.reducer';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';
import { DateService } from '@app-core/services/date/date.service';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input()
  public fleetId = '';
  @Input()
  public driverId = '';
  @Input()
  public assetId = '';
  @Input()
  public startDate = '';
  @Input()
  public endDate = '';
  @Input()
  public tripsCount = 0;
  @Input()
  public tripsTableState: TripsTableState = initialTripsTableState;
  @Input()
  public filterType = 'driverFilter';
  @Input()
  public tagIds = [];
  @Input()
  public includeInsignificantTrips = false;

  @Output()
  private sortChange = new EventEmitter<Sort>();
  @Output()
  private pageChange = new EventEmitter<PageEvent>();
  @Output()
  private tripLinkClick = new EventEmitter();
  @Output()
  private tripCountEmit = new EventEmitter<number>();

  @ViewChild('sort', { static: true })
  public sort: MatSort;
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;

  public tableColumns = [];
  public tablePageSize = TRIPS_TABLE_PAGE_SIZE;
  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public isLoadingTrips = false;
  public isLoadingDvrUploadStatus = false;
  public isTimelapseTabDisabled = false;
  public dummyList = new Array(5).fill(undefined);
  public eventsConfig = EVENTS_CONFIG;
  public isMobile = false;
  public locationLoader = true;
  public dvrAvailableLoader = true;

  private customerName: string;
  private unsubscribeTripDetailsApi: Subject<void> = new Subject<void>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();

  constructor(
    private tripsService: TripsService,
    public dataService: DataService,
    private accessService: AccessService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private gtmService: GoogleTagManagerService,
    private router: Router,
    private dateService: DateService
  ) {}

  public ngOnInit() {
    this.breakpointObserver.observe(BREAKPOINTS_SMALL).subscribe((breakpointState: BreakpointState) => {
      this.isMobile = breakpointState.matches;
    });
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = { ...EVENTS_CONFIG, ...this.dataService.transformObject(combinedEventsList) };
    this.eventsConfig = modifiedEventsConfig;

    ({ customerName: this.customerName = '' } = this.accessService.getLoginInfo() || {});
    this.tableColumns = TRIP_TABLE_COLUMNS(this.customerName);
    this.updateTableColumns();
  }

  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.pageChange.emit(event);
    });

    this.sort.sortChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: Sort) => {
      this.sortChange.emit(event);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (
      changes.startDate ||
      changes.endDate ||
      changes.driverId ||
      changes.assetId ||
      changes.fleetId ||
      changes.tagIds ||
      changes.includeInsignificantTrips
    ) {
      this.paginator.firstPage();
    }
    const changedInputs = Object.keys(changes);
    const isOnlyTripCountChanged = changedInputs.length === 1 && changedInputs[0] === 'tripsCount';
    // No need of getting trip list again when only tripsCount is changed
    if (isOnlyTripCountChanged) {
      return;
    }
    if (changes) {
      this.tableSource.data = new Array(10).fill({});
    }
    this.ngUnsubscribeOnChanges.next();
    this.updateTableColumns();
    this.getTripList();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
    this.unsubscribeTripDetailsApi.next();
    this.unsubscribeTripDetailsApi.complete();
  }

  private updateTableColumns() {
    if (this.driverId) {
      this.tableColumns = TRIP_TABLE_COLUMNS(this.customerName).filter((x) => x !== 'driverName');
    } else if (this.assetId) {
      this.tableColumns = TRIP_TABLE_COLUMNS(this.customerName).filter((x) => x !== 'assetId');
    } else {
      this.tableColumns = TRIP_TABLE_COLUMNS(this.customerName);
    }
  }

  public getTripDetailPageQueryParams(trip): TripDetailsPageQueryParams {
    const {
      driverId,
      tripId,
      firstLocation: { latitude = US_CENTER_LAT_LNG.latitude, longitude = US_CENTER_LAT_LNG.longitude } = {},
    } = trip;
    return new TripDetailsPageQueryParams({
      tripId,
      driverId,
      latitude,
      longitude,
    });
  }

  public getTripList(isRefresh?: boolean) {
    if (!this.fleetId) {
      this.tableSource.data = [];
    }
    this.isLoadingTrips = true;
    this.dvrAvailableLoader = true;
    const { pageIndex = 0, sortKey: sortBy = '', sortDirection: sort = '' } = this.tripsTableState || {};
    const offset = pageIndex * this.tablePageSize;
    const api = this.getTripListApi(offset, sort, sortBy, isRefresh);
    return api
      .pipe(
        finalize(() => (this.isLoadingTrips = false)),
        takeUntil(this.ngUnsubscribeOnChanges),
        map((res: any) => {
          this.tripsCount = res?.totalCount;
          this.tripCountEmit.emit(this.tripsCount);
          return res.data.trips || [];
        }),
        catchError(() => {
          return observableOf([]);
        })
      )
      .subscribe((trips) => {
        if (trips.length) {
          const tripList = trips.map((trip: any) => {
            if (trip.asset.cameraType === 'RideCam') {
              return trip;
            } else if (trip.asset.cameraType === 'RideCam_Plus' && trip.device.model === 'TREQ MSCAM') {
              return trip;
            } else {
              return {
                ...trip,
                cameraMountingStatus: undefined,
              };
            }
          });

          const updatedTripList = tripList.map((trip: any) => {
            const { frPersonsList = [], sampleDriverImage = '', frResultsCorrected = false, driverId } = trip || {};
            const { metaData = {}, thumbnailSmall } = frPersonsList.length && frPersonsList[0];
            const { driverId: recognizedDriverId } = metaData;
            return {
              ...trip,
              isFaceIdAvailable: sampleDriverImage || thumbnailSmall,
              isRecognizedDriverMismatch:
                recognizedDriverId && !frResultsCorrected && driverId !== recognizedDriverId && driverId !== '_UNASSIGNED',
              faceIdImageUrl: thumbnailSmall,
              isDvrAvailable: true,
            };
          });

          this.tableSource.data = updatedTripList;
          this.getLocations(tripList);
        } else {
          this.tripsCount = 0;
          this.tripCountEmit.emit(this.tripsCount);
          this.tableSource.data = [];
        }
      });
  }

  public checkDvrAvaibility(trips: any[]) {
    this.dvrAvailableLoader = true;
    const APIS = (trips || []).map((x: any) => {
      const { device = {} } = x || {};
      const { deviceId = null } = device || {};
      const dateRange = this.dateService.getDateRangeInISO(7);
      const { from, to } = dateRange;
      const params = {
        startDate: from,
        endDate: to,
        deviceId: deviceId,
        limit: 3,
        eventTypes: ['Device-Storage', 'TripStarted', 'TripEnded'],
      };
      return this.tripsService.checkDvrAvailibility(params);
    });

    forkJoin(APIS)
      .pipe(
        finalize(() => {
          this.dvrAvailableLoader = false;
        }),
        takeUntil(this.ngUnsubscribe),
        catchError(() => of(undefined))
      )
      .subscribe(
        (res: any[]) => {
          const updatedTrips = trips.map((x, index) => {
            const { events = [] } = res[index] || {};
            const { startTimeUTC = '' } = x;
            const { oldestDvrTimestamp = null } =
              events.length &&
              events
                .filter((x: any) => x !== null && x.hasOwnProperty('oldestDvrTimestamp'))
                .reduce((a: any, b: any) => (a.timestampUTC > b.timestampUTC ? a : b), {});
            if (oldestDvrTimestamp) {
              if (new Date(oldestDvrTimestamp).getTime() < new Date(startTimeUTC).getTime()) {
                return {
                  ...x,
                  isDvrAvailable: true,
                };
              } else {
                return {
                  ...x,
                  isDvrAvailable: false,
                };
              }
            } else {
              return {
                ...x,
                isDvrAvailable: true,
              };
            }
          });

          this.tableSource.data = updatedTrips;
        },
        () => {}
      );
  }

  private getLocations(tripList: any) {
    this.locationLoader = true;
    const tripStartLocationRequests = tripList.map((trip: any) => {
      const { firstLocation = {} } = trip || {};
      const { latitude = 0, longitude = 0 } = firstLocation || {};
      const params = {
        location: `${longitude},${latitude}`,
      };
      return this.tripsService.getLocationData(params);
    });

    const tripEndLocationRequests = tripList.map((trip: any) => {
      const { lastLocation = {} } = trip || {};
      const { latitude = 0, longitude = 0 } = lastLocation || {};
      const params = {
        location: `${longitude},${latitude}`,
      };
      return this.tripsService.getLocationData(params);
    });

    forkJoin(tripStartLocationRequests).subscribe(
      (res) => {
        const startLocations = res.map((x: any) => {
          const { address = {} } = x || {};
          const { City = '', LongLabel = '' } = address || {};

          if (City !== '' && LongLabel !== '') {
            return {
              startLocation: City,
              startLocationFullAddress: LongLabel,
            };
          } else {
            return {
              startLocation: '-',
            };
          }
        });
        this.tableSource.data = this.tableSource.data.map((x: any, index: number) => {
          return {
            ...x,
            startLocation: startLocations[index].startLocation,
            startLocationFullAddress: startLocations[index].startLocationFullAddress,
          };
        });
      },
      () => {}
    );

    forkJoin(tripEndLocationRequests)
      .pipe(finalize(() => ((this.locationLoader = false), this.checkDvrAvaibility(this.tableSource.data))))
      .subscribe(
        (res) => {
          const endLocations = res.map((x: any) => {
            const { address = {} } = x || {};
            const { City = '', LongLabel = '' } = address || {};

            if (City !== '' && LongLabel !== '') {
              return {
                endLocation: City,
                endLocationFullAddress: LongLabel,
              };
            } else {
              return {
                endLocation: '-',
              };
            }
          });
          this.tableSource.data = this.tableSource.data.map((x: any, index: number) => {
            return {
              ...x,
              endLocation: endLocations[index].endLocation,
              endLocationFullAddress: endLocations[index].endLocationFullAddress,
            };
          });
        },
        () => {}
      );
  }

  private getTripListApi(offset, sort, sortBy, isRefresh) {
    const params = new TripListParams({
      fleetId: this.fleetId,
      driverId: this.driverId,
      assetId: this.assetId,
      startDate: this.startDate,
      endDate: this.endDate,
      limit: this.tablePageSize,
      offset,
      sort,
      sortBy,
      includeInsignificantTrips: this.includeInsignificantTrips,
    });
    params['tagIds[]'] = this.tagIds;

    if (this.driverId) {
      return this.tripsService.getDriverTripList(params, isRefresh);
    } else if (this.assetId) {
      return this.tripsService.getAssetTripList(params, isRefresh);
    }
    return this.tripsService.getFleetTripList(params, isRefresh);
  }

  public tripDetailLinkClick(trip) {
    this.tripLinkClick.emit(trip);
  }

  public showDriverImage(tripDetails: any) {
    const {
      sampleDriverImage = '',
      tripId = '',
      sampleDriverImageFaceCoordinates = [],
      frPersonsList = [],
      driverId = '',
      driverName,
      frResultsCorrected,
    } = tripDetails || {};
    const { metaData = {}, thumbnail = '' } = frPersonsList.length && frPersonsList[0];
    this.dialog.open(DriverImageComponent, {
      position: { top: '24px' },
      panelClass: ['normal-media-popup', 'mobile-modal'],
      data: {
        source: 'trips',
        recognizedDriverImage: thumbnail,
        sampleDriverImage,
        tripId,
        sampleDriverImageFaceCoordinates,
        showFeedbackTab: false,
        driverId,
        driverName,
        metaData,
        frResultsCorrected,
        isTripDetails: false,
      },
    });
  }

  public navigateToTripDetails(trip: any) {
    this.gtmService.gotoTripDetailsFromTripsTable(trip.driverId);
    const {
      driverId,
      tripId,
      firstLocation: { latitude = US_CENTER_LAT_LNG.latitude, longitude = US_CENTER_LAT_LNG.longitude } = {},
    } = trip || {};
    this.router.navigate(['/trip-details'], {
      queryParams: {
        driverId,
        tripId,
        latitude,
        longitude,
      },
    });
  }

  public navigateToVideoRequest(trip: any) {
    const {
      driverId,
      tripId,
      firstLocation: { latitude = US_CENTER_LAT_LNG.latitude, longitude = US_CENTER_LAT_LNG.longitude } = {},
    } = trip || {};
    this.gtmService.gotoRequestVideoPageFromTripsListPage(trip.asset.assetId || trip.assetId, driverId);
    this.router.navigate(['/request-video'], {
      queryParams: {
        driverId,
        tripId,
        latitude,
        longitude,
      },
    });
  }

  public navigateToEditTrip(trip: any) {
    this.tripsService.tripDetails = trip;
    this.router.navigate(['/trips/edit-trip'], {
      queryParams: {
        action: 'Edit',
        tripId: trip.tripId,
        driverId: trip.driverId,
      },
    });
  }
}
