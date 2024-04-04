import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CSV_MIME_TYPE } from '@app-assets/constants/assets.constants';
import { AssetsService } from '@app-assets/services/assets.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-upload',
  templateUrl: './asset-upload.component.html',
  styleUrls: ['./asset-upload.component.scss'],
})
export class AssetUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInputRef')
  public fileInputRef: ElementRef;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public assetSampleLoader = false;
  public loader = false;
  public sampleDownloadError = false;
  public showFileError = false;
  public assetUpdationStatus: string;
  public csvFileSelected = false;
  public assetUpdationCsvFile: any;
  public updationFailedAssetList = [];
  public assetUpdationErrorMessage: string;
  public fleetId: string;

  constructor(
    private assetsService: AssetsService,
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
    this.assetUpdationCsvFile = event.target.files[0];
    this.showFileError = false;
    this.assetUpdationStatus = null;
    this.csvFileSelected = false;
    if (!this.assetUpdationCsvFile) {
      return;
    }
    if (!CSV_MIME_TYPE.includes(this.assetUpdationCsvFile.type)) {
      this.showFileError = true;
      return;
    }
    this.csvFileSelected = true;
  }

  public batchAssetUpdation() {
    if (!this.assetUpdationCsvFile) {
      return;
    }
    this.assetUpdationStatus = null;
    this.loader = true;
    this.gtmService.uploadBatchAssetList(this.fleetId);
    this.assetsService
      .batchAssetUpdation(this.assetUpdationCsvFile)
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
          this.assetUpdationStatus = 'success';
        },
        (err) => {
          const { status } = err;
          if (status === 202) {
            this.assetUpdationStatus = 'partialSuccess';
            this.updationFailedAssetList = err.error.text;
          } else if (status === 400) {
            this.assetUpdationStatus = 'error';
            this.assetUpdationErrorMessage = this.translate.instant('batchAdditionFailed');
          } else {
            this.assetUpdationStatus = 'error';
            this.assetUpdationErrorMessage = this.translate.instant('batchAdditionFailed');
          }
        }
      );
  }

  public resetUpload() {
    this.csvFileSelected = false;
    this.assetUpdationCsvFile = {};
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  public downloadFailedAssetList() {
    const csvFileName = `${this.fleetId}_updation_failed_assets.csv`;
    this.assetsService.downloadFile(this.updationFailedAssetList, csvFileName, 'text/csv;charset=utf-8;');
    this.assetUpdationStatus = null;
  }

  public downloadAssetUploadSample() {
    this.assetSampleLoader = true;
    this.sampleDownloadError = false;
    const params = {
      provisioned: true,
    };
    this.gtmService.downloadSampleAssetUpdateCSV(this.fleetId);
    this.assetsService
      .getSampleAssetsCsv(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.assetSampleLoader = false;
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
          this.sampleDownloadError = true;
        }
      );
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
