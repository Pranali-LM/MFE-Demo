import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';

import { BREAKPOINTS_SMALL } from '@app-core/constants/constants';

import { DataService } from '@app-core/services/data/data.service';
import { CLIENT_CONFIG } from '@config/config';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-driver-image',
  templateUrl: './driver-image.component.html',
  styleUrls: ['./driver-image.component.scss'],
})
export class DriverImageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tabGroup', { static: true }) public tabGroup: MatTabGroup;
  public currentTabIndex = 0;
  public enrolledDriverList = [];
  public loader = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public tripFrFeedbackForm = this.fb.group({
    driverId: ['', Validators.required],
  });
  public feedbackLoader = false;
  public showSuccess = false;
  public showError = false;
  public tabCount: number;
  public showFaceBox = false;
  public isMobile = false;
  public customOptions = {
    showLargeInput: true,
    showAdditionalDisplayProp: true,
    additionalDisplayPropKey: 'driverName',
  };
  public clientConfig = CLIENT_CONFIG;

  constructor(
    public dialogRef: MatDialogRef<DriverImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService
  ) {
    dialogRef.disableClose = true;
  }

  public ngOnInit() {
    this.breakpointObserver.observe(BREAKPOINTS_SMALL).subscribe((state: BreakpointState) => {
      this.isMobile = state.matches;
    });
  }

  public onClose() {
    this.dialogRef.close();
  }

  public ngAfterViewInit() {
    this.tabCount = this.tabGroup._tabs.length;
    this.drawFaceCoordinates();
    if (this.currentTabIndex === 0) {
      if (this.data.source === 'trips') {
        this.gtmService.viewDriverImageRecognizedDriver('Trip List');
      } else if (this.data.source === 'tripDetails') {
        this.gtmService.viewDriverImageRecognizedDriver('Trip Details');
      } else {
        this.gtmService.viewDriverImageRecognizedDriver('Request Video');
      }
    }
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.drawFaceCoordinates();
    this.tripFrFeedbackForm.reset();
    this.currentTabIndex = tabChangeEvent.index;
    switch (this.currentTabIndex) {
      case 0:
        if (this.data.source === 'trips') {
          this.gtmService.viewDriverImageRecognizedDriver('Trip List');
        } else if (this.data.source === 'tripDetails') {
          this.gtmService.viewDriverImageRecognizedDriver('Trip Details');
        } else if (this.data.source === 'requestVideo') {
          this.gtmService.viewDriverImageRecognizedDriver('Request Video');
        }
        break;
      case 1:
        if (this.data.source === 'trips') {
          this.gtmService.viewDriverImageCapturedImage('Trip List');
        } else if (this.data.source === 'tripDetails') {
          this.gtmService.viewDriverImageCapturedImage('Trip Details');
        } else if (this.data.source === 'requestVideo') {
          this.gtmService.viewDriverImageCapturedImage('Request Video');
        }
        break;
      case 2:
        if (this.data.source === 'tripDetails') {
          this.gtmService.viewDriverImageFeedback('Trip Details');
        } else if (this.data.source === 'requestVideo') {
          this.gtmService.viewDriverImageFeedback('Request Video');
        }
        break;
    }
    if (this.currentTabIndex === this.tabCount - 1) {
      this.loader = true;
      this.getEnrolledDriverList();
    }
  }

  public getEnrolledDriverList() {
    this.dataService
      .getAllDriversForAFleet()
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.enrolledDriverList = res.data || [];
          this.enrolledDriverList = this.enrolledDriverList.filter((driver) => driver.personId !== undefined);
          if (this.enrolledDriverList.length && this.enrolledDriverList[0].driverId !== 'Driver not enrolled') {
            this.enrolledDriverList.unshift({
              driverId: this.translate.instant('driverImageComponentDriverNotEnrolledLabel'),
              showDivider: true,
            });
          } else {
            this.enrolledDriverList.push({
              driverId: this.translate.instant('driverImageComponentDriverNotEnrolledLabel'),
              showDivider: false,
            });
          }
        },
        () => {
          this.enrolledDriverList = [];
        }
      );
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.unsubscribe();
  }

  public selectedDriver(driverId = '') {
    this.tripFrFeedbackForm.patchValue({ driverId });
    this.showError = false;
    this.showSuccess = false;
  }

  public sendTripFrFeedback() {
    this.showError = false;
    this.showSuccess = false;
    this.feedbackLoader = true;
    const selectedDriverId = this.tripFrFeedbackForm.value.driverId;
    let body = {};
    if (selectedDriverId === 'Driver not enrolled') {
      body = {
        tripId: this.data.tripId,
        frFeedbackPersonNotEnrolled: true,
      };
    } else {
      const selectedPerson = this.enrolledDriverList.filter((person) => person.driverId === selectedDriverId)[0];
      const { personId } = selectedPerson;
      body = {
        tripId: this.data.tripId,
        frFeedbackSuggestedPersonId: personId,
      };
    }
    this.gtmService.sendFeedback(selectedDriverId);
    this.dataService
      .sendTripFrFeedback(body)
      .pipe(
        finalize(() => {
          this.feedbackLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.showSuccess = true;
        },
        () => {
          this.showError = true;
        }
      );
  }

  public drawFaceCoordinates() {
    const { sampleDriverImageFaceCoordinates = {} } = this.data || {};
    if (Object.keys(sampleDriverImageFaceCoordinates).length !== 4) {
      return;
    }
    let { topLeftX: x1, topLeftY: y1, bottomRightX: x2, bottomRightY: y2 } = sampleDriverImageFaceCoordinates;
    this.showFaceBox = true;
    this.cdRef.detectChanges();
    const canvas = document.getElementById('image-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00A300';

      // dividing by 2 for downsized image of resolution (640 * 360)
      x1 = x1 / 2;
      y1 = y1 / 2;
      x2 = x2 / 2;
      y2 = y2 / 2;

      // top line
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1);

      // right line
      ctx.moveTo(x2, y1);
      ctx.lineTo(x2, y2);

      // bottom line
      ctx.moveTo(x2, y2);
      ctx.lineTo(x1, y2);

      // left line
      ctx.moveTo(x1, y2);
      ctx.lineTo(x1, y1);

      ctx.stroke();
    }
  }
}
