import { HttpResponse } from '@angular/common/http';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { KEYBOARD_SHORTCUTS } from '@app-core/constants/keyboard-shortcuts.constants';
import { FleetDriverListParams } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { KeyboardShortcutsService } from '@app-core/services/keyboard-shortcuts/keyboard-shortcuts.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { UpdateDriverIdInDriverQuery, UpdateDriverQuery } from '@app-driver-management/actions/driver-query.actions';
import { AddDriverComponent } from '@app-driver-management/components/add-driver/add-driver.component';
import { DriverEnrollmentComponent } from '@app-driver-management/components/driver-enrollment/driver-enrollment.component';
import { DriverImagesComponent } from '@app-driver-management/components/driver-images/driver-images.component';
import { DriverQueryState, getDriverQueryState } from '@app-driver-management/reducers';
import { State } from '@app-driver-management/reducers/driver-query.reducer';
import { CLIENT_CONFIG } from '@config/config';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subject } from 'rxjs';
import { finalize, skip, take, takeUntil } from 'rxjs/operators';
import { ALL_DRIVER_FOR_FLEET_COLUMNS, ALL_DRIVER_FOR_FLEET_COLUMNS_USERTYPE_EMAIL_FALSE } from '../../common/driver-management.constants';
import { DriverManagementService } from '../../services/driver-management.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}

const tabNameIndexMapping = {
  overview: 0,
  'manage-drivers': 1,
};

@Component({
  selector: 'app-driver-management',
  templateUrl: './driver-management.component.html',
  styleUrls: ['./driver-management.component.scss'],
})
export class DriverManagementComponent implements OnInit, AfterViewChecked {
  @ViewChild('paginator')
  public paginator: MatPaginator;

  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public matcher = new MyErrorStateMatcher();
  public loader = true;
  public tableColumns = CLIENT_CONFIG?.showUserTypeEmail ? ALL_DRIVER_FOR_FLEET_COLUMNS : ALL_DRIVER_FOR_FLEET_COLUMNS_USERTYPE_EMAIL_FALSE;
  public pageSize = 5;
  public driverQueryState: DriverQueryState = {} as DriverQueryState;
  public fleetId: string;
  public fleetDriverList = [];
  public driverEventLoader = true;
  public startDate: string;
  public endDate: string;
  public currentTabIndex = 0;
  public clientConfig = CLIENT_CONFIG;
  public currentTheme = 'light';
  public currentOS = 'windows';
  public keyboardShortcuts = KEYBOARD_SHORTCUTS;
  public csvLoader = false;
  public currentDateFormat: string;
  public driverDetails;
  public driverDetailsLoader = false;
  public driverListLoader: boolean;
  public iscoachingRequired = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private driverManagementService: DriverManagementService,
    private store: Store<State>,
    private gtmService: GoogleTagManagerService,
    public dataService: DataService,
    private dateService: DateService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbarService: SnackBarService,
    private router: Router,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private accessService: AccessService,
    private keyboardShortcutsService: KeyboardShortcutsService,
    private commonHttpService: CommonHttpService
  ) {}

  public ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  public ngOnInit() {
    this.store
      .select(getDriverQueryState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((driverQueryState) => {
        this.driverQueryState = driverQueryState;
      });

    // Initialize sort and pagination of tables
    this.tableSource.data = new Array(this.pageSize).fill(undefined);
    this.tableSource.paginator = this.paginator;

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe), take(1)).subscribe((value) => {
      this.fleetId = value;
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe), skip(1)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        if (this.currentTabIndex === 1) {
          const enrollDriverId = this.route.snapshot.queryParamMap.get('enrollDriverId');
          if (enrollDriverId) {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {
                enrollDriverId: null,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          } else {
            this.getRegisteredDriverList();
          }
        } else {
          this.store.dispatch(new UpdateDriverIdInDriverQuery(''));
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              driverId: null,
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          this.getDriverList();
        }
      }
    });

    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });

    this.dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param: any) => {
      const currentTab = param.tab;
      this.currentTabIndex = tabNameIndexMapping[currentTab] || 0;
      if (this.currentTabIndex === 1) {
        this.gtmService.customTabs('/drivers', 'Drivers', 'Manage Drivers');
        this.getRegisteredDriverList();
      } else {
        this.gtmService.customTabs('/drivers', 'Drivers', 'Drivers Overview');
        if (param.driverId) {
          this.store.dispatch(new UpdateDriverIdInDriverQuery(param.driverId));
        } else if (this.driverQueryState.driverId) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              driverId: this.driverQueryState.driverId,
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        } else {
          this.getDriverList();
        }
      }
    });

    this.currentOS = this.dataService.getCurrentOS();
    this.configureKeyboardShortcuts();
  }

  private getDriverList() {
    if (!this.fleetId) {
      return;
    }
    this.driverListLoader = true;
    const { from: driversStartDate, to: driversEndDate } = this.dateService.getDateRangeInISO(30 * 6); // Past 6 months
    const params = new FleetDriverListParams({
      fleetId: this.fleetId,
      startDate: driversStartDate,
      endDate: driversEndDate,
      limit: 100,
    });

    this.loader = true;
    this.commonHttpService
      .getFleetDriverList(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.driverListLoader = false))
      )
      .subscribe(
        ({ data: { drivers = [] } } = {}) => {
          this.fleetDriverList = drivers;
          if (this.fleetDriverList.length === 0) {
            this.driverEventLoader = false;
          }
          const [{ driverId: initialDriverId = '' } = {}] = (this.fleetDriverList || []).sort((a, b) =>
            a.tripCount > b.tripCount ? -1 : 1
          );

          if (this.route.snapshot.queryParamMap.get('driverId')) {
            const driverId = this.route.snapshot.queryParamMap.get('driverId');
            this.store.dispatch(new UpdateDriverIdInDriverQuery(driverId));
          } else {
            this.store.dispatch(new UpdateDriverIdInDriverQuery(initialDriverId));
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {
                driverId: initialDriverId,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        },
        () => {}
      );
  }

  public onPageTabChange(event: MatTabChangeEvent) {
    const [tabName = 'overview'] = Object.entries(tabNameIndexMapping).find(([, index]) => index === event.index);
    const newQueryParams: any = {
      tab: tabName,
    };
    if (tabName === 'overview') {
      newQueryParams.enrollDriverId = null;
    } else {
      newQueryParams.driverId = null;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newQueryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  public getRegisteredDriverList(isRefresh?: boolean) {
    this.loader = true;
    this.tableSource.data = new Array(this.pageSize).fill(undefined);
    this.tableSource.paginator = this.paginator;
    this.driverManagementService
      .getRegisteredDriverList(isRefresh)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          const allDrivers = res.data.map((driver: any) => {
            return {
              ...driver,
              loader: false,
            };
          });
          this.tableSource.data = allDrivers || [];
          setTimeout(() => {
            this.tableSource.paginator = this.paginator;
          });
          const toBeEnrolledDriverId = this.route.snapshot.queryParamMap.get('enrollDriverId');
          if (toBeEnrolledDriverId && !isRefresh) {
            this.enrollSpecificDriver(toBeEnrolledDriverId);
          }
        },
        () => {
          this.tableSource.data = [];
        }
      );
  }

  private enrollSpecificDriver(driverId: string) {
    const registeredDriver = this.tableSource.data.find((d) => d.driverId === driverId);
    if (registeredDriver) {
      const enrolledPersonId = registeredDriver.personId;
      if (enrolledPersonId) {
        this.openDriverImagesDialog(registeredDriver, 'driverManagementAlreadyEnrolled');
      } else {
        this.openDriverEnrollmentDialog(registeredDriver);
      }
    } else {
      this.openAddDriverDialog(driverId, 'driverManagementRegistrationRequiredBeforeEnroll');
    }
  }

  /**
   * Function called on change of driver query filters.
   *
   * Update local variables being passed as inputs to driver query results cmponent.
   *
   * @param {DriverQueryState} driverQueryOptions
   */
  public onDriverQuery(driverQueryOptions: DriverQueryState): void {
    const { driverId: oldDriverId = '', paramStartDate: oldStartDate = '', paramEndDate: oldEndDate = '' } = this.driverQueryState;
    const {
      driverId: newDriverId = '',
      paramStartDate: newStartDate = '',
      paramEndDate: newEndDate = '',
      displayStartDate = null,
      displayEndDate = null,
    } = driverQueryOptions || {};
    if (newDriverId && displayStartDate && displayEndDate) {
      const isDriverIdChanged = newDriverId !== oldDriverId;
      const isTimeRangeChanged = newStartDate !== oldStartDate || newEndDate !== oldEndDate;
      if (isDriverIdChanged) {
        this.gtmService.changeDriverOverviewDriverFilter(newDriverId);
      }
      if (isTimeRangeChanged) {
        const noOfDays = this.dateService.getNoOfDays(newStartDate, newEndDate);
        const durationInText = this.dateService.getDurationText(displayStartDate, displayEndDate, noOfDays);
        this.gtmService.changeDriverOverviewDurationFilter(durationInText, noOfDays);
      }
    }
    this.store.dispatch(new UpdateDriverQuery(driverQueryOptions));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        driverId: driverQueryOptions.driverId,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  public openDriverImagesDialog(driver: any, infoMessage?: string) {
    this.gtmService.viewDriverImages();
    this.dialog.open(DriverImagesComponent, {
      panelClass: ['driver-images-dialog', 'mobile-modal'],
      position: { top: '24px' },
      width: '480px',
      autoFocus: false,
      data: {
        driver,
        infoMessage,
      },
    });
  }

  // function to send driver temporary password email, if the driver has not received one
  public resendTempPasswordEmail(driver: any) {
    driver.loader = true;
    const body = {
      email: driver.email,
    };
    this.gtmService.resendDriverTempPassword(this.fleetId);
    this.driverManagementService
      .resendDriverTempPassword(body)
      .pipe(
        finalize(() => {
          driver.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('driverManagementTempPasswordSuccess'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('driverManagementEmailFailed'));
        }
      );
  }

  public deleteDriver(driver: any) {
    if (confirm(this.translate.instant('driverManagementRemoveDriver'))) {
      driver.deleteDriverLoader = true;

      const { personId = '', username = '' } = driver || {};
      const deletePersonRequest = this.driverManagementService.deletePersonDetails({ personId });
      const deleteDriverRequest = this.driverManagementService.deleteDriver(
        {
          userType: 'DRIVER',
        },
        username
      );

      this.gtmService.deleteDriver(this.fleetId);

      const APIS = driver.personId ? [deletePersonRequest, deleteDriverRequest] : [deleteDriverRequest];

      forkJoin(APIS)
        .pipe(
          finalize(() => {
            driver.deleteDriverLoader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          () => {
            this.snackbarService.success(this.translate.instant('driverManagementDriverDeleteSuccess'));
            this.doRefresh();
          },
          () => {
            this.snackbarService.failure(this.translate.instant('driverManagementDriverDeleteFailed'));
          }
        );
    }
  }

  public doRefresh() {
    this.paginator.firstPage();
    this.getRegisteredDriverList(true);
  }

  public openAddDriverDialog(driverId?: string, infoMessage?: string) {
    const dialog = this.dialog.open(AddDriverComponent, {
      width: '480px',
      minHeight: '560px',
      autoFocus: false,
      disableClose: true,
      position: { top: '24px' },
      data: {
        driverId,
        infoMessage,
      },
    });

    dialog.afterClosed().subscribe((val) => {
      const { isAddDriverSuccessful = false } = val || {};
      if (isAddDriverSuccessful) {
        this.doRefresh();
      }
    });
  }

  public openDriverEnrollmentDialog(driverDetails: any) {
    const { driverId, driverName, personId, email } = driverDetails || {};
    const dialog = this.dialog.open(DriverEnrollmentComponent, {
      width: '720px',
      height: '640px',
      autoFocus: false,
      disableClose: true,
      position: { top: '24px' },
      data: {
        source: 'driverList',
        driverId,
        driverName,
        personId,
        email,
        username: email || driverId,
      },
    });

    dialog.afterClosed().subscribe((val) => {
      const { isDriverEnrollmentSuccessful = false } = val || {};
      if (isDriverEnrollmentSuccessful) {
        this.doRefresh();
      }
    });
  }

  public exportUsers() {
    this.csvLoader = true;
    const { customerName = '' } = this.accessService.getLoginInfo();
    const params = {
      userType: 'DRIVER',
      customerName,
      dateFormat: this.currentDateFormat,
    };

    this.gtmService.exportDriversCSV(this.fleetId);
    this.dataService
      .exportUsers(params)
      .pipe(
        finalize(() => (this.csvLoader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: HttpResponse<Blob>) => {
          const defaultFilename = `${this.fleetId}_drivers.csv`;
          const contentDispositionHeader = res.headers.get('content-disposition');
          let filename = defaultFilename;
          if (contentDispositionHeader) {
            filename = this.dataService.extractFilename(contentDispositionHeader);
          }
          this.dataService.downloadFile(res.body, filename, res.headers.get('content-type'));
          this.snackbarService.success(this.translate.instant('driverManagementDriverListSuccess'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('driverManagementDriverListFailure'));
        }
      );
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
    const [tabName = 'overview'] = Object.entries(tabNameIndexMapping).find(([, idx]) => idx === tabIndex);
    this.router.navigate([], {
      queryParams: {
        tab: tabName,
      },
    });
  }

  public coachingRequired(coachReq) {
    this.iscoachingRequired = coachReq;
  }
}
