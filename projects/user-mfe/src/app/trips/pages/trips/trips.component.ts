import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { UpdateTripsFilter } from '@app-trips/actions/trip-filter.actions';
import { UpdateTripsTablePageIndex, UpdateTripsTableSort } from '@app-trips/actions/trips-table.actions';
import { AssetStatsParams, DriverStatsParams, FleetStatsParams } from '@app-trips/common/trips.model';
import { getTripsFilter, getTripsState, getTripsTableState, State, TripsFilterState, TripsTableState } from '@app-trips/reducers';
import { TripsService } from '@app-trips/services/trips.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyboardShortcutsService } from '@app-core/services/keyboard-shortcuts/keyboard-shortcuts.service';
import { KEYBOARD_SHORTCUTS } from '@app-core/constants/keyboard-shortcuts.constants';
import { HttpResponse } from '@angular/common/http';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { TripListComponent } from '@app-trips/components/trip-list/trip-list.component';
import { OrientationBlockerComponent } from '@app-shared/components/orientation-blocker/orientation-blocker.component';
import { BREAKPOINTS_LANDSCAPE, BREAKPOINTS_MEDIUM, BREAKPOINTS_PORTRAIT, BREAKPOINTS_SMALL } from '@app-core/constants/constants';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';

const tabNameIndexMapping = {
  trips: 0,
  'active-drivers': 1,
};
@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss'],
})
export class TripsComponent implements OnInit, OnDestroy {
  public fleetId: string;
  public tripsTableState: TripsTableState = {} as TripsTableState;
  public tripsFilterState: TripsFilterState = {} as TripsFilterState;
  public tripsCount = 0;
  public currentMetricUnit = null;
  public loader = false;
  public currentTabIndex = 0;
  public keyboardShortcuts = KEYBOARD_SHORTCUTS;
  public currentOS = 'windows';
  public csvLoader = false;
  public currentDateFormat: string;
  public isMobile: boolean;
  public entityType = ['trip', 'asset', 'driver'];
  @ViewChild(TripListComponent) tripListComponent: TripListComponent;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private unsubscribeStatsApi: Subject<void> = new Subject<void>();

  constructor(
    public dataService: DataService,
    private gtmService: GoogleTagManagerService,
    private store: Store<State>,
    private tripsService: TripsService,
    private dateService: DateService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackBarService,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private keyboardShortcutsService: KeyboardShortcutsService
  ) {}

  public ngOnInit() {
    this.breakpointObserver.observe(BREAKPOINTS_PORTRAIT).subscribe((state: BreakpointState) => {
      if (state.matches && this.router.url === '/trips') {
        this.dialog.closeAll();
        this.dialog.open(OrientationBlockerComponent, {
          panelClass: ['orientation-modal'],
          data: {
            title: this.translate.instant('appRotateYourDevice'),
            description: this.translate.instant('appRotateYourDeviceToLandscapeDescription'),
            imageUrl: 'assets/common/mobile-rotation-icon.svg',
          },
        });
      }
    });

    this.breakpointObserver
      .observe([...BREAKPOINTS_SMALL, ...BREAKPOINTS_MEDIUM, ...BREAKPOINTS_LANDSCAPE])
      .subscribe((state: BreakpointState) => {
        if (state.matches && this.router.url === '/trips') {
          this.isMobile = state.matches;
        }
      });

    this.store
      .select(getTripsFilter)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((tripsFilterState) => {
        this.tripsFilterState = tripsFilterState;
      });

    this.store
      .select(getTripsTableState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((tripsTableFilterState) => {
        this.tripsTableState = tripsTableFilterState;
      });

    this.store
      .select(getTripsState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.unsubscribeStatsApi.next();
        this.updateTripCount();
      });

    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });

    this.dataService._currentDateFormat.subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });

    this.dataService._currentFleet.subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        this.updateTripCount();
      }
    });

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param: any) => {
      const currentTab = param.tab;
      this.currentTabIndex = tabNameIndexMapping[currentTab] || 0;
      if (this.currentTabIndex === 0) {
        this.gtmService.customTabs('/trips', 'Trips', 'Trips');
      } else {
        this.gtmService.customTabs('/trips', 'Trips', 'Active Drivers');
      }
    });

    this.currentOS = this.dataService.getCurrentOS();
    this.configureKeyboardShortcuts();
  }

  public onPageTabChange(event: MatTabChangeEvent) {
    const [tabName = 'trips'] = Object.entries(tabNameIndexMapping).find(([, index]) => index === event.index);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }
  public onRefresh(): void {
    if (this.tripListComponent) {
      this.tripListComponent.getTripList(true);
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeStatsApi.next();
    this.unsubscribeStatsApi.complete();
  }

  public onTripFilterChange(tripFilter: any) {
    const {
      driverId: newDriverId = '',
      paramStartDate: newStartDate = '',
      paramEndDate: newEndDate = '',
      displayStartDate = null,
      displayEndDate = null,
      assetId: newAssetId = undefined,
      filterType: newFilterType = 'driverFilter',
    } = tripFilter || {};
    const {
      driverId: oldDriverId = '',
      paramStartDate: oldStartDate = '',
      paramEndDate: oldEndDate = '',
      assetId: oldAssetId = undefined,
      filterType: oldFilterType = 'driverFilter',
    } = this.tripsFilterState;
    const isDriverIdChanged = newDriverId !== oldDriverId;
    const isTimeRangeChanged = newStartDate !== oldStartDate || newEndDate !== oldEndDate;
    const isAssetIdChanged = newAssetId !== oldAssetId;
    const isFilterTypeChanged = newFilterType !== oldFilterType;
    if (newFilterType === 'driverFilter' && isDriverIdChanged) {
      this.gtmService.changeTripListDriverFilter(newDriverId || 'All Drivers');
    }
    if (isTimeRangeChanged) {
      const noOfDays = this.dateService.getNoOfDays(newStartDate, newEndDate);
      const durationInText = this.dateService.getDurationText(displayStartDate, displayEndDate, noOfDays);
      if (this.currentTabIndex === 0) {
        this.gtmService.changeTripListDurationFilter(durationInText, noOfDays);
      } else {
        this.gtmService.changeActiveDriversListDurationTypeFilter(durationInText, noOfDays);
      }
    }
    if (newFilterType === 'assetFilter' && isAssetIdChanged) {
      this.gtmService.changeTripListAssetTypeFilter(newAssetId);
    }
    if (isFilterTypeChanged) {
      this.gtmService.changeTripListFilterTypeFilter(newFilterType);
    }
    this.store.dispatch(new UpdateTripsFilter(tripFilter));
  }

  public onTripsTablePageChange(event: PageEvent) {
    this.gtmService.tripListPageChange(event);
    this.store.dispatch(new UpdateTripsTablePageIndex({ pageIndex: event.pageIndex }));
  }

  public onTripsTableSortChange(event: Sort) {
    this.store.dispatch(
      new UpdateTripsTableSort({
        sortKey: event.active,
        sortDirection: event.direction,
      })
    );
    this.gtmService.sortTripList(event);
  }

  public pushTripDetailsEvent(trip: any) {
    if (!trip) {
      return;
    }
  }

  private updateTripCount() {
    this.loader = true;
    this.getStatsApiObservable()
      .pipe(
        takeUntil(this.unsubscribeStatsApi),
        finalize(() => (this.loader = false))
      )
      .subscribe(
        (res = {} as any) => {
          this.tripsCount = res.aggregate.tripCount || 0;
        },
        () => {
          this.tripsCount = 0;
        }
      );
  }

  private getStatsApiObservable() {
    const { driverId, assetId, paramStartDate, paramEndDate, tagIds } = this.tripsFilterState;

    if (assetId) {
      const assetStatsParams = new AssetStatsParams({
        fleetId: this.fleetId,
        assetId,
        startDate: paramStartDate,
        endDate: paramEndDate,
        unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      });
      if (tagIds && tagIds.length) {
        assetStatsParams['tagIds[]'] = tagIds;
      }
      return this.tripsService.getAssetStats(assetStatsParams);
    }

    if (driverId) {
      const driverStatsParams = new DriverStatsParams({
        fleetId: this.fleetId,
        driverId,
        startDate: paramStartDate,
        endDate: paramEndDate,
        includeEventDiff: true,
        unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      });
      if (tagIds && tagIds.length) {
        driverStatsParams['tagIds[]'] = tagIds;
      }
      return this.tripsService.getDriverStats(driverStatsParams);
    }
    const fleetStatsParams = new FleetStatsParams({
      fleetId: this.fleetId,
      startDate: paramStartDate,
      endDate: paramEndDate,
      includeEventDiff: true,
      unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
    });
    if (tagIds && tagIds.length) {
      fleetStatsParams['tagIds[]'] = tagIds;
    }
    return this.tripsService.getFleetStats(fleetStatsParams);
  }

  public configureKeyboardShortcuts() {
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab0[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(0);
      });
    this.keyboardShortcutsService
      .addShortcut({ keys: this.keyboardShortcuts.goToTab1[this.currentOS] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.onKeyboardTabChange(1);
      });
  }

  public onKeyboardTabChange(tabIndex: number) {
    const [tabName = 'trips'] = Object.entries(tabNameIndexMapping).find(([, idx]) => idx === tabIndex);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }

  public exportTrips() {
    const { driverId, assetId, paramStartDate, paramEndDate, tagIds, includeInsignificantTrips } = this.tripsFilterState;
    this.csvLoader = true;
    const params = {
      startDate: paramStartDate,
      endDate: paramEndDate,
      dateFormat: this.currentDateFormat,
      unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      ...(assetId ? { assetId } : {}),
      ...(driverId ? { driverId } : {}),
      ...(includeInsignificantTrips ? { includeInsignificantTrips } : {}),
    };
    if (tagIds && tagIds.length) {
      params['tagIds[]'] = tagIds;
    }
    this.gtmService.exportTripsCSV(this.fleetId);
    this.tripsService
      .exportTrips(params)
      .pipe(
        finalize(() => (this.csvLoader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: HttpResponse<Blob>) => {
          const defaultFilename = `${this.fleetId}_trips.csv`;
          const contentDispositionHeader = res.headers.get('content-disposition');
          let filename = defaultFilename;
          if (contentDispositionHeader) {
            filename = this.tripsService.extractFilename(contentDispositionHeader);
          }
          this.tripsService.downloadFile(res.body, filename, res.headers.get('content-type'));
          this.snackbarService.success(this.translate.instant('tripListComponentTripsDownloadSuccess'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('tripListComponentTripsDownloadFailure'));
        }
      );
  }

  public tripCountEmit(tripsCount: number) {
    this.tripsCount = tripsCount;
  }
}
