import { Component, Input, OnInit, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { ASSET_FILTER_TYPES, ASSET_LIST_COLUMNS } from '@app-assets/constants/assets.constants';
import { Device } from '@app-assets/models/assets.model';
import { AssetsService } from '@app-assets/services/assets.service';
import { ManageDeviceComponent } from '../manage-device/manage-device.component';
import { HttpResponse } from '@angular/common/http';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { AccessService } from '@app-core/services/access/access.service';
import { CLIENT_CONFIG } from '@config/config';
import { DataService } from '@app-core/services/data/data.service';
import { AssetConfigurationsExpansionPanelComponent } from '@app-assets/components/asset-configurations-expansion-panel/asset-configurations-expansion-panel.component';
import { AssetConfigurationService } from '@app-asset-config/services/asset-configuration.service';
import { Router } from '@angular/router';
import { AssetAutocompleteComponent } from '@app-shared/components/asset-autocomplete/asset-autocomplete.component';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss'],
})
export class AssetListComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public fleetId = '';

  @ViewChild(MatPaginator)
  public paginator: MatPaginator;
  @ViewChild(AssetConfigurationsExpansionPanelComponent, { static: true })
  public configExpansionPanel: AssetConfigurationsExpansionPanelComponent;
  @ViewChild(AssetAutocompleteComponent, { static: false }) assetAutocomplete: AssetAutocompleteComponent;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public assetFilterForm: FormGroup;
  public assetsDataSource: MatTableDataSource<Device> = new MatTableDataSource([]);
  public loader = false;
  public csvLoader = false;
  public tableColumns = ASSET_LIST_COLUMNS(CLIENT_CONFIG);
  public assetFilterTypeList = ASSET_FILTER_TYPES(CLIENT_CONFIG).sort((a, b) => (a.label > b.label ? 1 : -1));
  public totalDevicesCount = 0;
  public pageSize = 10;
  public assetCount = 0;
  public offset = 0;
  public toggleAdvancedSearch = false;
  public fleetDriverList = [];
  public customerName: string;
  public config = {};
  public currentAssetID = '';
  public entityType = ['asset'];
  public unSelectAllTag = false;
  public currentPageIndex = 0;
  public isSearchButtonDisabled: boolean = true;

  constructor(
    private assetsService: AssetsService,
    private dialog: MatDialog,
    private snackbarService: SnackBarService,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private accessService: AccessService,
    public dataService: DataService,
    public assetConfigService: AssetConfigurationService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    const { customerName = '' } = this.accessService.getLoginInfo() || {};
    this.customerName = customerName;

    this.assetFilterForm = new FormGroup({
      filterType: new FormControl('assetIdFilter'),
      deviceId: new FormControl(''),
      assetId: new FormControl(''),
      serialNumber: new FormControl(''),
      tagIds: new FormControl(''),
    });

    this.assetFilterForm
      .get('deviceId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.updateSearchButtonDisabled();
      });

    if (this.assetsService.currentPageEvent) {
      this.getPageEvent(this.assetsService.currentPageEvent);
      const { pageIndex = 0 } = this.assetsService.currentPageEvent;
      this.currentPageIndex = pageIndex;
    }
  }

  public ngOnChanges() {
    this.getFleetAssets();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getFleetAssets(isRefresh?: boolean, tagIds?: number[]) {
    this.loader = true;
    this.assetsDataSource.data = new Array(10).fill(undefined);
    const params = {
      sortBy: 'assetId',
      sort: 'asc',
      limit: this.pageSize,
      offset: this.offset,
      activeOnly: true,
      fleetId: this.fleetId,
    };
    if (tagIds && tagIds.length) {
      params['tagIds[]'] = tagIds;
    }
    this.assetsService
      .getFleetAssets(params, isRefresh)
      .pipe(
        finalize(() => {
          this.getDriverList();
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          const { assets = [], assetCount = 0 } = res.data || {};
          this.assetsDataSource.data = assets;
          this.assetCount = assetCount;
        },
        () => {
          this.assetsDataSource.data = [];
          this.assetCount = 0;
        }
      );
  }

  public getPageEvent(event: PageEvent) {
    this.assetsService.currentPageEvent = event;
    this.gtmService.assetListTablePageChange(event);
    const { pageIndex = 0 } = event;
    this.offset = pageIndex * this.pageSize;
    this.getFleetAssets();
  }

  public exportAssets() {
    this.csvLoader = true;
    const { tagIds } = this.assetFilterForm.value || {};

    const params = {
      activeOnly: true,
      sortBy: 'assetId',
      sort: 'asc',
    };

    if (tagIds && tagIds.length) {
      params['tagIds[]'] = tagIds;
    }

    this.assetsService
      .exportAssets(params)
      .pipe(
        finalize(() => (this.csvLoader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: HttpResponse<Blob>) => {
          const defaultFilename = `${this.fleetId}_assets.csv`;
          const contentDispositionHeader = res.headers.get('content-disposition');
          let filename = defaultFilename;
          if (contentDispositionHeader) {
            filename = this.assetsService.extractFilename(contentDispositionHeader);
          }
          this.assetsService.downloadFile(res.body, filename, res.headers.get('content-type'));
          this.snackbarService.success(this.translate.instant('assetListComponentAssetDownloadSuccess'));
          this.gtmService.exportAssetCsv(this.fleetId);
        },
        () => {
          this.snackbarService.failure(this.translate.instant('assetListComponentAssetDownloadFailure'));
        }
      );
  }

  public getDriverList(isRefresh?: boolean) {
    this.loader = true;
    this.assetsService
      .getDriverList(isRefresh)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.fleetDriverList = res.data || [];
          this.assetsService.fleetDriverList = res.data || [];
        },
        () => {
          this.fleetDriverList = [];
          this.assetsService.fleetDriverList = [];
        }
      );
  }

  public openEditAssetDialog(asset: any) {
    const { assetId } = asset || {};
    this.assetsService.assetDetails = { ...asset };
    this.router.navigate(['/assets/edit-asset'], {
      queryParams: {
        assetId,
      },
    });
  }

  public clearInput(input: string) {
    this.assetFilterForm.patchValue({
      [input]: '',
    });
  }

  public clearSearchForm() {
    this.assetFilterForm.reset();
    this.assetFilterForm.patchValue({
      filterType: 'assetIdFilter',
    });
    this.unSelectAllTag = true;
    this.getFleetAssets(true);
    this.clearAssetId();
  }

  public toggleAdvancedFilters() {
    this.toggleAdvancedSearch = !this.toggleAdvancedSearch;
    if (!this.toggleAdvancedSearch) {
      this.clearSearchForm();
      this.offset = 0;
      this.paginator.firstPage();
      this.getFleetAssets(true);
    }
  }

  public openManageDeviceDialog(device: Device) {
    const { deviceId, assetId, assetName = '', serialNumber } = device || {};
    this.dialog.open(ManageDeviceComponent, {
      width: '480px',
      disableClose: true,
      position: { top: '24px' },
      autoFocus: false,
      panelClass: ['mobile-modal'],
      data: {
        deviceId,
        assetName,
        assetId,
        serialNumber,
      },
    });
  }

  public onSearch() {
    this.paginator.firstPage();
    const { filterType = 'assetIdFilter', assetId, deviceId, serialNumber, tagIds } = this.assetFilterForm.value || {};
    if (filterType === 'assetIdFilter') {
      this.gtmService.searchAssetByAssetId(assetId);
      this.searchByAssetId(assetId);
    } else if (filterType === 'deviceIdFilter') {
      this.gtmService.searchAssetByDeviceId(deviceId);
      this.searchByDeviceId(deviceId);
    } else if (filterType === 'filterByTags') {
      this.getFleetAssets(false, tagIds);
    } else {
      this.searchBySerialNumber(serialNumber);
    }
  }

  public searchByAssetId(assetId: string) {
    if (!assetId) {
      return;
    }
    this.loader = true;
    this.assetsDataSource.data = new Array(1).fill(undefined);
    const params = {
      fleetId: this.fleetId,
      assetId,
      includeAssetTags: true,
    };
    this.assetsService
      .getAssetDetails(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        (res) => {
          this.assetsDataSource.data = [res];
          this.assetCount = 1;
        },
        () => {
          this.assetsDataSource.data = [];
          this.assetCount = 0;
        }
      );
  }

  updateSearchButtonDisabled(): void {
    const assetId = this.assetFilterForm.get('assetId').value;
    const deviceId = this.assetFilterForm.get('deviceId').value;
    const tags = this.assetFilterForm.get('tagIds').value;

    this.isSearchButtonDisabled = !(assetId || deviceId || (tags && tags.length > 0));
  }

  private getDeviceDetails(params: any) {
    this.loader = true;
    this.assetsDataSource.data = new Array(1).fill(undefined);
    this.assetsService
      .getDeviceDetails(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          const { assetId = '' } = res || {};
          this.searchByAssetId(assetId);
        },
        () => {
          this.assetsDataSource.data = [];
          this.assetCount = 0;
          this.loader = false;
        }
      );
  }

  public searchByDeviceId(deviceId: string) {
    if (!deviceId) {
      return;
    }
    const params = {
      deviceId,
    };
    this.getDeviceDetails(params);
  }

  public searchBySerialNumber(serialNumber: string) {
    if (!serialNumber) {
      return;
    }
    const params = {
      serialNumber,
    };

    this.getDeviceDetails(params);
  }

  public getAssetConfigurations(assetId) {
    const params = {
      assetId,
    };
    this.currentAssetID = assetId;
    this.assetConfigService.isLoadingConfig.next(true);
    this.assetConfigService
      .getAssetConfiguration(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.assetConfigService.isLoadingConfig.next(false);
        })
      )
      .subscribe((res: any) => {
        this.config = res.configuration;
        this.assetConfigService.currentAssetConfig.next(this.config);
      });
  }

  public selectedTags(tags) {
    this.assetFilterForm.get('tagIds').patchValue(tags);
    this.updateSearchButtonDisabled();
  }

  public assetChanged(assetId = '') {
    this.assetFilterForm.patchValue({ assetId });
    this.updateSearchButtonDisabled();
  }

  private clearAssetId() {
    this.assetAutocomplete.clearInput();
  }
}
