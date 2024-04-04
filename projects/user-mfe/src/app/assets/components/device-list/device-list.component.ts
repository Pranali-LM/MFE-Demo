import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DEVICES_LIST_COLUMNS } from '@app-assets/constants/assets.constants';
import { AssetsService } from '@app-assets/services/assets.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ProvisionDeviceComponent } from '../provision-device/provision-device.component';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
})
export class DeviceListComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input()
  public fleetId = '';

  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public loader = true;
  public tableColumns = DEVICES_LIST_COLUMNS;
  public tablePageSize = 10;
  public totalDevices = null;
  public fleetDriverList = [];

  constructor(
    private assetsService: AssetsService,
    private dialog: MatDialog,
    private gtmService: GoogleTagManagerService,
    public dataService: DataService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.fleetId) {
      this.tableSource.data = new Array(this.tablePageSize).fill(undefined);
      this.getFleetDevices();
    }
  }

  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.changeDeviceListAssetPageChange(event);
    });
  }

  public getDriverList(isRefresh?: boolean) {
    this.loader = true;
    this.assetsService
      .getDriverList(isRefresh)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.fleetDriverList = res.data || [];
        },
        () => {
          this.fleetDriverList = [];
        }
      );
  }

  public getFleetDevices(isRefresh?: boolean) {
    this.tableSource.data = new Array(this.tablePageSize).fill(undefined);
    this.loader = true;
    const params = {
      semiProvisioned: true,
    };
    this.assetsService
      .getFleetDevices(params, isRefresh)
      .pipe(
        finalize(() => {
          this.getDriverList();
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          const { devices = [] } = res || {};
          this.totalDevices = devices.length;
          this.tableSource.data = devices;
          this.tableSource.paginator = this.paginator;
        },
        () => {
          this.tableSource.data = [];
          this.tableSource.paginator = this.paginator;
        }
      );
  }

  public onProvisionDevice(device: any) {
    const dialogRef = this.dialog.open(ProvisionDeviceComponent, {
      position: { top: '24px' },
      width: '480px',
      minHeight: '300px',
      autoFocus: false,
      disableClose: true,
      data: {
        device,
        driverList: this.fleetDriverList,
      },
    });
    dialogRef.afterClosed().subscribe((val) => {
      const { isEdited = false } = val || {};
      this.gtmService.provisionDevice(device.deviceId);
      if (isEdited) {
        this.getFleetDevices(true);
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
