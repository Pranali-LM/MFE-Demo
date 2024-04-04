import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { DRIVER_TABLE_COLUMNS } from '@app-trips/common/trips.constants';
import { FleetDriverListParams } from '@app-trips/common/trips.model';
import { TripsService } from '@app-trips/services/trips.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Store } from '@ngrx/store';
import { State } from '@app-trips/reducers/activeDrivers-filter.reducer';
import { ActiveDriverTableState, getActiveDriverFilter } from '@app-trips/reducers';
import { UpdateActiveDriverFilter } from '@app-trips/actions/activeDrivers-filter.actions';
@Component({
  selector: 'app-active-drivers',
  templateUrl: './active-drivers.component.html',
  styleUrls: ['./active-drivers.component.scss'],
})
export class ActiveDriversComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input()
  public fleetId = '';
  @Input()
  public currentTabIndex: number = 1;

  @ViewChild('sort', { static: true })
  public sort: MatSort;
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;

  public tableColumns = DRIVER_TABLE_COLUMNS;
  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public isLoadingDrivers = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private unsubscribeDriverListApi: Subject<void> = new Subject<void>();
  public currentMetricUnit: string;
  public driverList = [];
  public tripsFilterState: ActiveDriverTableState = {} as ActiveDriverTableState;
  public entityType = ['driver'];

  constructor(
    private tripsService: TripsService,
    public dataService: DataService,
    private gtmService: GoogleTagManagerService,
    public dateService: DateService,
    private store: Store<State>
  ) {}

  public ngOnInit() {
    this.dataService._currentMetricUnit.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });

    this.store
      .select(getActiveDriverFilter)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((tripsFilterState) => {
        this.tripsFilterState = tripsFilterState;
        this.getActiveDrivers();
      });
  }

  public ngAfterViewInit() {
    this.sort.sortChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: Sort) => {
      this.onDriversTableSortChange(event);
    });
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.onDriversTablePageChange(event);
    });
    this.tableSource.sort = this.sort;
    this.tableSource.paginator = this.paginator;
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.unsubscribeDriverListApi.next();
    if (
      ((changes.fleetId && changes.fleetId.currentValue) || (changes.currentTabIndex && changes.currentTabIndex.currentValue)) &&
      this.tripsFilterState &&
      this.tripsFilterState?.paramStartDate &&
      this.tripsFilterState?.paramEndDate
    ) {
      this.getActiveDrivers();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeDriverListApi.next();
    this.unsubscribeDriverListApi.complete();
  }

  public getActiveDrivers() {
    if (!this.fleetId) {
      return;
    }
    const getDriverListParams = new FleetDriverListParams({
      fleetId: this.fleetId,
      startDate: this.tripsFilterState?.paramStartDate,
      endDate: this.tripsFilterState?.paramEndDate,
    });

    if (this.tripsFilterState?.tagIds && this.tripsFilterState?.tagIds?.length) {
      getDriverListParams['tagIds[]'] = this.tripsFilterState?.tagIds;
    }

    this.isLoadingDrivers = true;
    this.tableSource.data = new Array(10).fill({});
    this.tripsService
      .getFleetDriverList(getDriverListParams)
      .pipe(
        finalize(() => (this.isLoadingDrivers = false)),
        takeUntil(this.unsubscribeDriverListApi)
      )
      .subscribe(
        ({ data: { drivers = [] } } = {}) => {
          const driverList = drivers.map(this.calculateEventsPer100Units.bind(this));
          this.tableSource.data = driverList;
        },
        () => {
          this.tableSource.data = [];
        }
      );
  }

  private calculateEventsPer100Units(driver = {} as any) {
    const { eventCount: { total: totalEventCount = 0 } = {}, tripDistance = 0 } = driver;
    const convertedDistance = tripDistance || 1;
    const eventsPer100Units = (totalEventCount * 100) / convertedDistance;
    return {
      ...driver,
      eventsPer100Units,
    };
  }

  public onTripFilterChange(tripFilter: any) {
    const {
      driverId: newDriverId = '',
      paramStartDate: newStartDate = '',
      paramEndDate: newEndDate = '',
      displayStartDate = null,
      displayEndDate = null,
    } = tripFilter || {};
    const { driverId: oldDriverId = '', paramStartDate: oldStartDate = '', paramEndDate: oldEndDate = '' } = this.tripsFilterState;
    const isDriverIdChanged = newDriverId !== oldDriverId;
    const isTimeRangeChanged = newStartDate !== oldStartDate || newEndDate !== oldEndDate;
    if (isDriverIdChanged) {
      this.gtmService.changeTripListDriverFilter(newDriverId || 'All Drivers');
    }
    if (isTimeRangeChanged) {
      const noOfDays = this.dateService.getNoOfDays(newStartDate, newEndDate);
      const durationInText = this.dateService.getDurationText(displayStartDate, displayEndDate, noOfDays);
      this.gtmService.changeTripListDurationFilter(durationInText, noOfDays);
    }
    this.store.dispatch(new UpdateActiveDriverFilter(tripFilter));
  }

  public onDriversTableSortChange(event: Sort) {
    this.gtmService.sortActiveDrivers(event);
  }

  public onDriversTablePageChange(event: PageEvent) {
    this.gtmService.activeDriverPageChange(event);
  }
}
