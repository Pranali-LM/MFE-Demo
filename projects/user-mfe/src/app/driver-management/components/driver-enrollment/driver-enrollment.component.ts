import { Component, ElementRef, Inject, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { IMAGE_LIST } from '@app-core/constants/constants';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EnrollmentFaqComponent } from '../enrollment-faq/enrollment-faq.component';

@Component({
  selector: 'app-driver-enrollment',
  templateUrl: './driver-enrollment.component.html',
  styleUrls: ['./driver-enrollment.component.scss'],
})
export class DriverEnrollmentComponent implements OnInit, OnChanges {
  @ViewChild('video')
  public video: ElementRef;
  @ViewChild('canvas')
  public canvas: ElementRef;
  @ViewChild('imageUpload')
  public imageUpload: ElementRef;

  public generatedSampleIds = [];
  public uploadedFiles = [];
  public driverImages = [];
  public validSamples = [];
  public isReplaceMode = false;
  public invalidSamples = [];
  public showLoader = false;
  public invalidSampleIncides = [];
  public showSuccess = false;
  public showWarning = false;
  public totalUploadCount = 5;
  public driverId: string;
  public driverName: string;
  public showError = false;
  public duplicatePersonError = false;
  public conflictingPersonId = '';
  public conflictingDriverId = '';
  public conflictPersonError = false;
  public conflictSamples = [];
  public imageList = IMAGE_LIST;
  public currentTabIndex = 0;

  constructor(
    public gtmService: GoogleTagManagerService,
    private driverManagementService: DriverManagementService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DriverEnrollmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public ngOnInit(): void {
    switch (this.data.source) {
      case 'addDriver':
        if (this.currentTabIndex === 0) {
          this.gtmService.viewUploadImagesManageDriver('Add Driver Button');
        }
        break;
      case 'driverList':
        if (this.currentTabIndex === 0) {
          this.gtmService.viewUploadImagesManageDriver('Driver List Action');
        }
        break;
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.driverDetails) {
      this.resetDriverEnrollment();
    }
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent) {
    this.currentTabIndex = tabChangeEvent.index;
    switch (this.data.source) {
      case 'addDriver':
        if (this.currentTabIndex === 0) {
          this.gtmService.viewUploadImagesManageDriver('Add Driver Button');
        } else {
          this.gtmService.viewUploadImagesUserGuideManageDrivers('Add Driver Button');
        }
        break;
      case 'driverList':
        if (this.currentTabIndex === 0) {
          this.gtmService.viewUploadImagesManageDriver('Driver List Action');
        } else {
          this.gtmService.viewUploadImagesUserGuideManageDrivers('Driver List Action');
        }
        break;
    }
  }

  public chooseImages(event: any) {
    this.showError = false;
    this.uploadedFiles = event.target.files;

    if (this.uploadedFiles.length == 0 || this.uploadedFiles.length !== this.totalUploadCount) {
      if (!this.isReplaceMode) {
        this.resetDriverEnrollment();
      }
      this.showWarning = true;
      return;
    }

    for (const file of this.uploadedFiles) {
      const fileExtension = file.name.substring(file.name.length - 3);
      if (fileExtension !== 'jpg') {
        this.showWarning = true;
        return;
      }
    }

    this.showWarning = false;
    let iterator = 0;
    for (const file of this.uploadedFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.isReplaceMode) {
          this.driverImages[this.invalidSampleIncides[iterator]] = {
            imageUrl: e.target.result,
            isValid: undefined,
            sampleId: undefined,
          };
          iterator += 1;
        } else {
          this.driverImages.push({
            imageUrl: e.target.result,
            isValid: undefined,
            sampleId: undefined,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  public onSubmit() {
    const fileList = Object.keys(this.uploadedFiles).map((key) => this.uploadedFiles[key]);
    if (this.data.source === 'addDriver') {
      this.gtmService.uploadDriverImages('Add Driver Button', this.data.driverId);
    } else if (this.data.source === 'driverList') {
      this.gtmService.uploadDriverImages('Driver List Action', this.data.driverId);
    }
    this.showLoader = true;
    this.driverManagementService.generateSampleUrls().subscribe(
      ({ samples = [] }) => {
        if (this.isReplaceMode) {
          this.generatedSampleIds = this.generatedSampleIds.map((x, idx) => {
            const invalidSampleIds = this.invalidSamples.map((y) => y.sampleId);
            if (invalidSampleIds.includes(x)) {
              return samples[idx].sampleId;
            }
            return x;
          });
        } else {
          this.generatedSampleIds = samples.map((x: any) => x.sampleId);
        }
        const sampleList = this.isReplaceMode ? samples.slice(0, this.totalUploadCount) : samples;
        this.uploadFilesToS3(sampleList, fileList);
        this.driverImages = this.driverImages.map((x, idx) => {
          return {
            ...x,
            sampleId: this.generatedSampleIds[idx],
          };
        });
      },
      () => {
        this.showLoader = false;
        this.showError = true;
      }
    );
  }

  public uploadFilesToS3(sampleIdsList: any, fileList: any) {
    const uploadFilesToS3Requests = sampleIdsList.map((x: any, idx: number) => {
      return this.driverManagementService.uploadFileToS3(x.url, fileList[idx]);
    });

    forkJoin(uploadFilesToS3Requests).subscribe(
      () => {
        this.enrollDriver(sampleIdsList);
      },
      () => {
        this.showLoader = false;
        this.showError = true;
      }
    );
  }

  public enrollDriver(sampleList: any) {
    this.showLoader = true;
    const { driverId = '', driverName = '', personId, email: driverEmail } = this.data;
    const body = {
      sampleIds: sampleList.map((x) => x.sampleId),
      metadata: {
        driverId,
        driverName,
        driverEmail,
      },
      personId,
      ...(this.isReplaceMode ? { validSampleIds: this.validSamples.length ? this.validSamples.map((x) => x.sampleId) : undefined } : {}),
    };

    this.invalidSampleIncides = [];
    this.driverManagementService.enrollDriver(body).subscribe(
      (res) => {
        this.invalidSamples = [];
        this.driverImages = this.driverImages.map((img) => {
          return {
            ...img,
            isValid: true,
          };
        });

        if (personId) {
          this.showSuccess = true;
        }

        // Update driver call
        if (res && !personId) {
          this.updateDriverMetadataWithPersonId(res.body.personId).subscribe(
            () => {
              this.showSuccess = true;
            },
            () => {
              this.showError = true;
              this.resetDriverEnrollment();
              this.deletePersonDetails(personId).subscribe();
            }
          );
        }
        this.showLoader = false;
      },
      (err) => {
        const data = err.error;
        if (err && err.status === 409) {
          this.verifyConflictPersonDetails(data);
          return;
        }

        this.isReplaceMode = true;
        this.invalidSampleIncides = [];
        if (err && err.status === 400) {
          this.validSamples = data.validSamples.map((sample) => {
            return {
              sampleId: sample,
              isValid: true,
            };
          });
          this.invalidSamples = data.invalidSamples.map((sample) => {
            return {
              ...sample,
              isValid: false,
            };
          });

          const allSamples = [...this.validSamples, ...this.invalidSamples];

          // assigning valid state for each image
          this.driverImages.map((img, index) => {
            allSamples.map((sample) => {
              if (img.sampleId === sample.sampleId) {
                this.driverImages[index].isValid = sample.isValid;
              }
            });
          });

          // getting invalid image indices
          this.driverImages.map((img, index) => {
            if (img.isValid === false) {
              this.invalidSampleIncides.push(index);
            }
          });

          this.totalUploadCount = this.invalidSamples.length;
          this.showLoader = false;
          // console.log(this.totalUploadCount);
          return;
        }

        this.showLoader = false;
        this.showError = true;
        this.duplicatePersonError = false;
        this.resetDriverEnrollment();
      }
    );
  }

  public resetDriverEnrollment() {
    this.totalUploadCount = 5;
    this.validSamples = [];
    this.invalidSampleIncides = [];
    this.invalidSamples = [];
    this.showLoader = false;
    this.showWarning = false;
    this.showSuccess = false;
    this.isReplaceMode = false;
    this.conflictingPersonId = '';
    this.conflictingDriverId = '';
    this.conflictPersonError = false;
    this.conflictSamples = [];
    this.driverImages = [];
    this.uploadedFiles = [];
    this.generatedSampleIds = [];
    if (this.imageUpload) {
      this.imageUpload.nativeElement.value = '';
    }
  }

  public openDriverEnrollmentFaqDialog() {
    this.dialog.open(EnrollmentFaqComponent, {
      panelClass: ['enrollment-faq-dialog', 'mobile-modal'],
    });
  }

  public onAcceptConflict() {
    this.updateDriverMetadataWithPersonId(this.conflictingPersonId).subscribe(
      () => {
        this.showSuccess = true;
        this.showError = false;
      },
      () => {
        this.showError = true;
        this.resetDriverEnrollment();
        this.deletePersonDetails(this.conflictingPersonId).subscribe();
      }
    );
  }

  public onRejectConflict() {
    this.showLoader = true;
    this.deletePersonDetails(this.conflictingPersonId)
      .pipe(finalize(() => (this.showLoader = false)))
      .subscribe(
        () => {
          this.showError = false;
          this.resetDriverEnrollment();
        },
        () => {
          this.showError = true;
          this.resetDriverEnrollment();
        }
      );
  }

  private verifyConflictPersonDetails(data: { message: string }) {
    // data.message format: "Person is already enrolled with personId- dbb4f03c-44e7-4c29-92f4-897342f0a60b"
    this.showLoader = true;
    const [, conflictingPersonId] = (data.message || '').split('- '); // space is required after hyphen
    this.conflictingPersonId = conflictingPersonId;
    if (!conflictingPersonId) {
      this.duplicatePersonError = true;
      this.resetDriverEnrollment();
      return;
    }
    const params = { personId: conflictingPersonId };
    this.driverManagementService
      .getDriverImages(params)
      .pipe(
        finalize(() => {
          this.showLoader = false;
        })
      )
      .subscribe(
        (personDetails) => {
          const { metadata = {}, samples = [] } = personDetails;
          this.showError = true;
          if (this.data.driverId === metadata.driverId) {
            this.conflictPersonError = true;
            this.conflictSamples = samples;
            return;
          }
          this.duplicatePersonError = true;
          this.resetDriverEnrollment();
          this.conflictingDriverId = metadata.driverId;
        },
        () => {
          this.showError = true;
          this.duplicatePersonError = true;
          this.resetDriverEnrollment();
        }
      );
  }

  private updateDriverMetadataWithPersonId(personId: string) {
    const { username = '' } = this.data || {};
    const updateDriverBody = {
      username,
      personId: personId,
    };
    this.showSuccess = false;
    this.showLoader = true;
    return this.driverManagementService.updateDriverDetails(updateDriverBody).pipe(
      finalize(() => {
        this.showLoader = false;
      })
    );
  }

  private deletePersonDetails(personId: string) {
    const param = {
      personId,
    };
    return this.driverManagementService.deletePersonDetails(param);
  }
}
