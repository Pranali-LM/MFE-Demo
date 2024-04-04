import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AssetsService } from '@app-assets/services/assets.service';
import { AccessService } from '@app-core/services/access/access.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CSV_MIME_TYPE } from '@app-core/constants/constants';
import { HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-batch-provision',
  templateUrl: './batch-provision.component.html',
  styleUrls: ['./batch-provision.component.scss'],
})
export class BatchProvisionComponent implements OnInit, OnDestroy {
  @ViewChild('provisionInputRef')
  public provisionInputRef: ElementRef;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public provisionSampleLoader = false;
  public provisionSampleDownloadError = false;
  public provisionUploadedCsvFile: any;
  public provisionUploadStatus: string;
  public provisionFileError = false;
  public provisionFileSelected = false;
  public provisionUploadErrorMessage: string;
  public provisionFailedDeviceList = [];
  public loader = false;
  private fleetId: string;

  constructor(
    private assetsService: AssetsService,
    private accessService: AccessService,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private dataService: DataService
  ) {}

  public ngOnInit() {
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
  }

  public selectCsvFile(event: any) {
    this.provisionUploadedCsvFile = event.target.files[0];
    this.provisionFileError = false;
    this.provisionUploadStatus = null;
    this.provisionFileSelected = false;
    if (!this.provisionUploadedCsvFile) {
      return;
    }
    if (!CSV_MIME_TYPE.includes(this.provisionUploadedCsvFile.type)) {
      this.provisionFileError = true;
      return;
    }
    this.provisionFileSelected = Object.keys(this.provisionUploadedCsvFile) ? true : false;
  }

  public batchProvisionDevice() {
    if (!this.provisionUploadedCsvFile) {
      return;
    }
    this.provisionUploadStatus = null;
    this.loader = true;
    this.gtmService.uploadBatchProvisioningDeviceList(this.fleetId);
    this.assetsService
      .batchDeviceProvisioning(this.provisionUploadedCsvFile)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loader = false;
          this.provisionFileSelected = false;
          this.resetUpload();
        })
      )
      .subscribe(
        () => {
          this.provisionUploadStatus = 'success';
        },
        (err) => {
          const { status } = err;
          if (status === 202) {
            this.provisionUploadStatus = 'partialSuccess';
            this.provisionFailedDeviceList = err.error.text;
          } else if (status === 400) {
            this.provisionUploadStatus = 'error';
            this.provisionUploadErrorMessage = err.error.message || this.translate.instant('batchProvisionFileUploadFailed');
          } else {
            this.provisionUploadStatus = 'error';
            this.provisionUploadErrorMessage = this.translate.instant('batchProvisionFileUploadFailed');
          }
        }
      );
  }

  public resetUpload() {
    this.provisionFileSelected = false;
    this.provisionUploadedCsvFile = {};
    if (this.provisionInputRef) {
      this.provisionInputRef.nativeElement.value = '';
    }
  }

  public downloadFailedDeviceList() {
    const { customerName = '' } = this.accessService.getLoginInfo() || {};
    const csvFileName = `${customerName}_provisioning_failed_devices.csv`;
    this.assetsService.downloadFile(this.provisionFailedDeviceList, csvFileName, 'text/csv;charset=utf-8;');
    this.provisionUploadStatus = null;
  }

  public downloadProvisionSample() {
    this.provisionSampleLoader = true;
    this.provisionSampleDownloadError = false;
    const params = {
      provisioned: true,
    };
    this.gtmService.downloadSampleProvisioningCSV(this.fleetId);
    this.assetsService
      .getSampleDevicesCsv(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.provisionSampleLoader = false;
        })
      )
      .subscribe(
        (res: HttpResponse<Blob>) => {
          const contentDispositionHeader = res.headers.get('content-disposition');
          let filename: string;
          if (contentDispositionHeader) {
            filename = this.assetsService.extractFilename(contentDispositionHeader);
          }
          this.assetsService.downloadFile(res.body, filename, res.headers.get('content-type'));
        },
        () => {
          this.provisionSampleDownloadError = true;
        }
      );
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
