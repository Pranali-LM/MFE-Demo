import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { DRIVER_CONFIGURATION_TABLE_COLUMNS } from '@app-asset-config/common/asset-configuration.constants';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { FleetDriverListParams } from '@app-core/models/core.model';
import { CommonHttpService } from '@app-core/services/common-http/common-http.service';
import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { AudioConsentComponent } from '@app-shared/components/audio-consent/audio-consent.component';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-driver-configurations',
  templateUrl: './driver-configurations.component.html',
  styleUrls: ['./driver-configurations.component.scss'],
})
export class DriverConfigurationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator)
  public paginator: MatPaginator;
  public dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public tableColumns = DRIVER_CONFIGURATION_TABLE_COLUMNS;
  public totalDevicesCount = 0;
  public pageSize = 5;
  public totalCount = 0;
  public hasGivenAudioConsent = false;
  public loader = false;
  public consentLoader = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public translate: TranslateService;
  private fleetId: string;

  constructor(
    public dataService: DataService,
    private dialog: MatDialog,
    private assetConfigurationService: AssetConfigurationService,
    private snackbarService: SnackBarService,
    private gtmService: GoogleTagManagerService,
    private commonHttpService: CommonHttpService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.dataService._currentFleet.subscribe((value: string) => {
      if (value) {
        this.hasGivenAudioConsent = false;
        this.consentLoader = true;
        this.loader = true;
        this.fleetId = value;
        this.getDriverList();
        this.getAudioConsent();
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.changeDriversListConfigurationPageChange(event);
    });
  }

  private getDriverList() {
    if (!this.fleetId) {
      return;
    }
    const { from: driversStartDate, to: driversEndDate } = this.dateService.getDateRangeInISO(30 * 6); // Past 6 months
    const params = new FleetDriverListParams({
      fleetId: this.fleetId,
      startDate: driversStartDate,
      endDate: driversEndDate,
      limit: 100,
    });

    this.loader = true;
    this.dataSource.data = new Array(this.pageSize).fill(undefined);
    this.commonHttpService
      .getFleetDriverList(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        ({ data: { drivers = [] } } = {}) => {
          this.getDriverPermissions(drivers);
        },
        () => {
          this.getDriverPermissions([]);
        }
      );
  }

  public getAudioConsent() {
    this.consentLoader = true;
    this.dataService
      .getDriverConfigConsent()
      .pipe(
        finalize(() => (this.consentLoader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        ({ driverConfigConsentStatus = false }) => {
          this.hasGivenAudioConsent = driverConfigConsentStatus;
        },
        () => {
          this.hasGivenAudioConsent = false;
        }
      );
  }

  public getDriverPermissions(driverList: any) {
    this.loader = true;
    this.dataSource.data = new Array(this.pageSize).fill(undefined);
    const driverPermissionRequests = driverList.map((driver: any) => {
      const { driverId = '' } = driver || {};
      const params = {
        driverId,
      };
      return this.assetConfigurationService.getDriverPermissions(params);
    });

    forkJoin(driverPermissionRequests)
      .pipe(
        finalize(() => (this.loader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          const driverPermissionDetails = res.map((x: any) => {
            const { permissions = {} } = x.data || {};
            const { audioRecording = false } = permissions || {};
            return {
              audioRecording,
            };
          });
          this.dataSource.data = driverList
            .map((driver: any, index: number) => {
              return {
                ...driver,
                loader: false,
                audioRecording: driverPermissionDetails[index].audioRecording,
              };
            })
            .filter((x: any) => x.driverId !== '_UNASSIGNED');
          this.totalCount = this.dataSource.data.length;
          this.dataSource.paginator = this.paginator;
        },
        () => {
          this.dataSource.data = [];
          this.dataSource.paginator = this.paginator;
        }
      );
  }

  public openAudioConsentDialog() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(AudioConsentComponent, {
      width: '640px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((val: any) => {
      if (val) {
        this.hasGivenAudioConsent = true;
      }
    });
  }

  public onToggleChange(event: MatSlideToggleChange, driverDetails: any) {
    const { checked = false } = event;
    const { driverId = '' } = driverDetails || {};
    driverDetails.loader = true;
    const params = {
      driverId,
    };
    const body = {
      permissions: {
        audioRecording: checked,
      },
    };
    if (checked) {
      this.gtmService.saveDriverAudioRecordingConfigurations('Enabled');
    } else {
      this.gtmService.saveDriverAudioRecordingConfigurations('Disabled');
    }
    this.assetConfigurationService
      .updateDriverPermissions(params, body)
      .pipe(
        finalize(() => (driverDetails.loader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          driverDetails.audioRecording = checked;
          this.snackbarService.success(this.translate.instant('driverConfigSuccessModified'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('driverConfigFailedToModify'));
        }
      );
  }
}
