import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { REMOTE_ACTION_LIST, STOP_RECORDING_EXPIRY_OPTIONS } from '@app-assets/constants/assets.constants';
import { AssetsService } from '@app-assets/services/assets.service';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manage-device',
  templateUrl: './manage-device.component.html',
  styleUrls: ['./manage-device.component.scss'],
})
export class ManageDeviceComponent implements OnInit {
  public loader = false;
  public manageDeviceForm: FormGroup;
  public actionList = REMOTE_ACTION_LIST;
  public stopRecordingExpiryOptions = STOP_RECORDING_EXPIRY_OPTIONS;
  public isError = false;
  public recordingStatus: any;
  public isAdminRole = false;
  public getDevicTaskeStatusLoader = false;
  public tripRecordingStatus = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ManageDeviceComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private fb: FormBuilder,
    private assetsService: AssetsService,
    private snackbarService: SnackBarService,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private dateService: DateService,
    public accessService: AccessService,
    public dataService: DataService
  ) {}

  ngOnInit(): void {
    this.createForm();
    const isAdminRole = this.accessService.isAdminRole();
    if (isAdminRole) {
      this.actionList = [
        ...REMOTE_ACTION_LIST,
        {
          value: 'disableCameraRecording',
          label: 'Stop Recording',
          type: 'recordingTask',
        },
        {
          value: 'enableCameraRecording',
          label: 'Resume Recording',
          type: 'recordingTask',
        },
      ];
      this.getDeviceTaskStatus();
    }
  }

  private createForm() {
    this.manageDeviceForm = this.fb.group({
      action: this.fb.control('', Validators.required),
      expiryTime: this.fb.control(1),
    });
  }
  public updateActionList() {
    // Get current time
    const currentTime = new Date();

    // Determine which action to show based on recordingStatus
    if (this.recordingStatus) {
      const endTimestamp = new Date(this.recordingStatus.temporaryTripBlockingEndTimestamp);

      // Conditions for showing disableCameraRecording
      if (!this.recordingStatus.temporaryTripBlocking || endTimestamp < currentTime) {
        this.actionList = this.actionList.filter((action) => action.value !== 'enableCameraRecording');
        this.tripRecordingStatus = true; // disableCameraRecording is shown, so recording is not in progress
      }

      // Conditions for showing enableCameraRecording
      if (this.recordingStatus.temporaryTripBlocking && endTimestamp > currentTime) {
        this.actionList = this.actionList.filter((action) => action.value !== 'disableCameraRecording');
        this.tripRecordingStatus = false; // enableCameraRecording is shown, so recording is in progress
      }
    } else {
      // If there's no recordingStatus, or an error occurred, default to showing disableCameraRecording
      this.actionList = this.actionList.filter((action) => action.value !== 'enableCameraRecording');
      this.tripRecordingStatus = true; // Default to assuming that recording is not in progress
    }
  }

  private getDeviceTaskStatus() {
    const { deviceId } = this.data || {};
    const params = {
      taskType: 'disableCameraRecording',
    };
    this.getDevicTaskeStatusLoader = true;
    this.assetsService
      .getDeviceTaskStatus(deviceId, params)
      .pipe(
        finalize(() => {
          this.getDevicTaskeStatusLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.recordingStatus = res.data || {};
          this.updateActionList();
        },

        () => {
          this.recordingStatus = null;
          this.updateActionList();
        }
      );
  }

  public isDeviceIdPrimaryKey() {
    return this.assetsService.isDeviceIdPrimaryKey();
  }

  public onSubmit(): void {
    if (this.manageDeviceForm.invalid) {
      return;
    }
    this.loader = true;
    this.isError = false;
    const { deviceId } = this.data || {};
    const { action = '', expiryTime } = this.manageDeviceForm.getRawValue();
    const expiryTimeInUTC = this.dateService.addOrSubtractDays(new Date(), expiryTime, 'add');

    if (action === 'disableCameraRecording' || action === 'enableCameraRecording') {
      const body = {
        taskType: 'disableCameraRecording',
        temporaryTripBlocking: action === 'disableCameraRecording' ? true : false,
        ...(expiryTimeInUTC ? { temporaryTripBlockingEndTimestamp: expiryTimeInUTC } : {}),
      };
      this.assetsService
        .triggerDeviceTask(deviceId, body)
        .pipe(
          finalize(() => {
            this.loader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          () => {
            this.snackbarService.success(this.translate.instant('manageDeviceComponentNotificationSuccess'));
          },
          () => {
            this.isError = true;
          }
        );
    } else {
      const params = {
        action,
      };
      this.gtmService.manageAsset(deviceId, action);
      this.assetsService
        .manageDevice(deviceId, params)
        .pipe(
          finalize(() => {
            this.loader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          () => {
            this.snackbarService.success(this.translate.instant('manageDeviceComponentNotificationSuccess'));
          },
          () => {
            this.isError = true;
          }
        );
    }
  }
}
