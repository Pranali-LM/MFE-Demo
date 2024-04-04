import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CSV_MIME_TYPE } from '@app-assets/constants/assets.constants';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-batch-driver-addition',
  templateUrl: './batch-driver-addition.component.html',
  styleUrls: ['./batch-driver-addition.component.scss'],
})
export class BatchDriverAdditionComponent implements OnInit, OnDestroy {
  @ViewChild('fileInputRef')
  public fileInputRef: ElementRef;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public loader = false;
  public driverSampleLoader = false;
  public sampleDownloadError = false;
  public showFileError = false;
  public driverAdditionStatus: string;
  public csvFileSelected = false;
  public driverAdditionCsvFile: any;
  public additionFailedDriverList = [];
  public driverAdditionErrorMessage: string;
  public fleetId: string;

  constructor(
    private driverManagementService: DriverManagementService,
    private dataService: DataService,
    private translate: TranslateService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit() {
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
  }

  public selectCsvFile(event: any) {
    this.driverAdditionCsvFile = event.target.files[0];
    this.showFileError = false;
    this.driverAdditionStatus = null;
    this.csvFileSelected = false;
    if (!this.driverAdditionCsvFile) {
      return;
    }
    if (!CSV_MIME_TYPE.includes(this.driverAdditionCsvFile.type)) {
      this.showFileError = true;
      return;
    }
    this.csvFileSelected = true;
  }

  public batchDriverAddition() {
    if (!this.driverAdditionCsvFile) {
      return;
    }
    this.driverAdditionStatus = null;
    this.loader = true;
    this.gtmService.uploadBatchDriversList(this.fleetId);
    this.driverManagementService
      .batchDriverAddition(this.driverAdditionCsvFile)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loader = false;
          this.csvFileSelected = false;
          this.resetUpload();
        })
      )
      .subscribe(
        () => {
          this.driverAdditionStatus = 'success';
        },
        (err) => {
          const { status } = err;
          if (status === 202) {
            this.driverAdditionStatus = 'partialSuccess';
            this.additionFailedDriverList = err.error.text;
          } else if (status === 400) {
            this.driverAdditionStatus = 'error';
            this.driverAdditionErrorMessage = this.translate.instant('batchAdditionFailed');
          } else {
            this.driverAdditionStatus = 'error';
            this.driverAdditionErrorMessage = this.translate.instant('batchAdditionFailed');
          }
        }
      );
  }

  public downloadDriverAdditionSample() {
    this.driverSampleLoader = true;
    this.sampleDownloadError = false;
    const params = {
      provisioned: true,
    };
    this.gtmService.downloadSampleDriversCSV(this.fleetId);
    this.driverManagementService
      .getSampleDriverCsv(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.driverSampleLoader = false;
        })
      )
      .subscribe(
        (res: HttpResponse<Blob>) => {
          const contentDispositionHeader = res.headers.get('content-disposition');
          let filename: string;
          if (contentDispositionHeader) {
            filename = this.driverManagementService.extractFilename(contentDispositionHeader);
          }
          this.driverManagementService.downloadFile(res.body, filename, res.headers.get('content-type'));
        },
        () => {
          this.sampleDownloadError = true;
        }
      );
  }

  public resetUpload() {
    this.csvFileSelected = false;
    this.driverAdditionCsvFile = {};
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  public downloadFailedDriverList() {
    const csvFileName = `${this.fleetId}_addition_failed_drivers.csv`;
    this.driverManagementService.downloadFile(this.additionFailedDriverList, csvFileName, 'text/csv;charset=utf-8;');
    this.driverAdditionStatus = null;
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
