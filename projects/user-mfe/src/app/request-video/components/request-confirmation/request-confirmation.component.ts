import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { CreateDvrRequestBody } from '@app-trips/common/trips.model';
import { TripsService } from '@app-trips/services/trips.service';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
@Component({
  selector: 'app-request-confirmation',
  templateUrl: './request-confirmation.component.html',
  styleUrls: ['./request-confirmation.component.scss'],
})
export class RequestConfirmationComponent implements OnInit {
  public isSuccess = false;
  public isError = false;
  public loader = false;
  public mapImageSrc: string;

  constructor(
    public dialogRef: MatDialogRef<RequestConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService,
    private router: Router,
    private accessService: AccessService,
    private tripsService: TripsService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit() {
    console.log();
  }

  public onSubmit() {
    this.isSuccess = false;
    this.isError = false;
    this.loader = true;
    const {
      videoResolution = '',
      enabledTimelapse = false,
      tripDetails = {},
      selectedTimeUTC,
      dvrDuration,
      dvrVideoType = 'road',
      dvrVideoTypes,
    } = this.data || {};

    const { tripId = '', driverId = '', endTimeUTC } = tripDetails || {};
    this.gtmService.confirmVideoRequestInRequestVideoPage(driverId);
    const { loginName: userEmail, name: userName } = this.accessService.getLoginInfo();

    let selectedEndTimeUTC = moment(selectedTimeUTC).add(dvrDuration, 'seconds').toISOString();
    selectedEndTimeUTC = new Date(selectedEndTimeUTC) > new Date(endTimeUTC) ? endTimeUTC : selectedEndTimeUTC;

    const videoType =
      dvrVideoType === 'pictureInPictureRoadSide' || dvrVideoType === 'pictureInPictureDriverSide' ? 'pictureInPicture' : dvrVideoType;

    let dvrVideoTypeMainFrame = 'road';
    if (dvrVideoType === 'pictureInPictureRoadSide') {
      dvrVideoTypeMainFrame = 'road';
    } else if (dvrVideoType === 'pictureInPictureDriverSide') {
      dvrVideoTypeMainFrame = 'driver';
    }

    const body = new CreateDvrRequestBody({
      tripId,
      driverId,
      startTimeUTC: selectedTimeUTC,
      endTimeUTC: selectedEndTimeUTC,
      videoResolution,
      enabledTimelapse,
      dvrVideoType: videoType,
      dvrVideoTypeMainFrame,
      ...(dvrVideoType === 'separate' ? { driverCameraVideoResolution: videoResolution } : {}),
      ...(dvrVideoType === 'pictureInPicture' ? { timelapseCaptureInterval: 1, timelapseDisplayInterval: 50, dvrVideoTypeMainFrame } : {}),
      dvrInitiatedMetadata: {
        userType: 'FLEET_MANAGER',
        email: userEmail,
        name: userName,
      },
      dvrVideoTypes,
    });
    this.tripsService
      .createDvrRequest(body)
      .pipe(
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        () => {
          this.isSuccess = true;
        },
        () => {
          this.isError = true;
        }
      );
  }

  public onClose() {
    this.gtmService.requestAnotherVideoOnSuccessfulRequestVideoPage();
    this.dialogRef.close('SUCCESS');
  }

  public navigateToVideoRequests() {
    this.gtmService.gotoVideoRequestFromSuccessfullRequestVideoConfirm();
    this.dialogRef.close();
    this.router.navigate(['/video-requests']);
  }
}
