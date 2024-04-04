import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  // EVENTS_CONFIG,
  PANIC_BUTTON_LIST_PAGE_SIZE,
} from '@app-core/constants/constants';
import { DRIVER_PANIC_BUTTON_TABLE_COLUMNS } from '@app-driver-management/common/driver-management.constants';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CLIENT_CONFIG } from '@config/config';
import { DataService } from '@app-core/services/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panic-button',
  templateUrl: './panic-button.component.html',
  styleUrls: ['./panic-button.component.scss'],
})
export class PanicButtonComponent implements OnInit {
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;

  @Input()
  public driverId = '';
  @Input()
  public startDate = '';
  @Input()
  public endDate = '';

  public tableColumns = DRIVER_PANIC_BUTTON_TABLE_COLUMNS;
  public panicButtonLoader: boolean = false;
  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public panicButtonEventList = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public clientConfig = CLIENT_CONFIG;
  public currentTimeZone: string;
  public currentDateFormat: string;
  public currentTheme = 'light';
  public currentMetricUnit = null;

  constructor(
    private driverManagementService: DriverManagementService,
    public dataService: DataService,
    private dialog: MatDialog,
    private gtmService: GoogleTagManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
      }
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

    this.dataService._currentTheme.subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ((changes.startDate && changes.startDate.currentValue) || (changes.driverId && changes.driverId.currentValue)) {
      this.getDriverExternalEvents();
    }
  }

  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.driverPanicButtonTablePageChange(event);
    });
  }

  public getDriverExternalEvents(isRefresh?: boolean) {
    this.panicButtonLoader = true;
    this.tableSource.data = new Array(5).fill(undefined);
    this.paginator.firstPage();

    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      driverId: this.driverId,
      limit: 20,
      sort: 'desc',
    };
    this.driverManagementService
      .getDriverExternalEvents(params, isRefresh)
      .pipe(
        finalize(() => {
          this.panicButtonLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.panicButtonEventList = res.rows;
          this.panicButtonEventList = this.panicButtonEventList.map((x, index) => {
            const { asset = {} } = x || {};
            const { assetName, assetId } = asset;
            return {
              ...x,
              isExternalEvent: true,
              eventTypeLabel: this.clientConfig.externalEventsLabel,
              positionIndex: index,
              eventVideoFilename: x.eventVideoFile,
              assetName,
              assetId,
            };
          });
          this.tableSource.data = this.panicButtonEventList;
          this.tableSource.paginator = this.paginator;
        },
        () => {
          this.tableSource.data = [];
          this.tableSource.paginator = this.paginator;
        }
      );
  }

  public showMedia(positionIndex: any) {
    // modifying data for show only viewable pages
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(
      this.panicButtonEventList,
      positionIndex,
      PANIC_BUTTON_LIST_PAGE_SIZE
    );
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(positionIndex, PANIC_BUTTON_LIST_PAGE_SIZE);

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        allEvents: filteredDataForPagination,
        currentIndex: filteredDataPaginationIndex,
        isDriverPage: true,
      },
    });
    this.gtmService.viewRequestedVideoFromDriverPanicButtonTable(this.clientConfig.externalEventsLabel);
  }

  public navigateTo(event: any) {
    this.router.navigate(['/trip-details'], {
      queryParams: {
        tripId: event.tripId,
        driverId: event.driverId,
      },
    });
    this.gtmService.gotoTripDetailsFromDriverPanicTable(event?.eventType);
  }
}
