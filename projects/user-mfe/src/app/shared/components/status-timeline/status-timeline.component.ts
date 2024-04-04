import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DVR_STATUS_LIST, DVR_STATUS_TIMELINE_MAPPING } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-status-timeline',
  templateUrl: './status-timeline.component.html',
  styleUrls: ['./status-timeline.component.scss'],
})
export class StatusTimelineComponent implements OnInit {
  public uploadRequestTimeline = [];
  public lastUpdatedStatus: any;
  public dvrStatusList = DVR_STATUS_LIST;
  public isVideoDisable = false;

  constructor(
    public dialogRef: MatDialogRef<StatusTimelineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService
  ) {}

  public ngOnInit(): void {
    const { uploadRequestTimeline = [] } = this.data || {};
    this.checkStatus(uploadRequestTimeline);
    if (this.isVideoDisable) {
      const newKey = {
        status: 'MediaUploadCompleted',
        disabled: true,
      };
      uploadRequestTimeline.push(newKey);
    }
    this.lastUpdatedStatus = uploadRequestTimeline[uploadRequestTimeline.length - 1 || 0] || {};
    this.uploadRequestTimeline = uploadRequestTimeline.map((x: any) => {
      const { status = '' } = x || {};
      return {
        ...x,
        type: DVR_STATUS_TIMELINE_MAPPING[status].type,
        description: DVR_STATUS_TIMELINE_MAPPING[status].description,
      };
    });

    if (
      this.lastUpdatedStatus.status === 'NotificationReceived' ||
      this.lastUpdatedStatus.status === 'MediaGenerationStarted' ||
      this.lastUpdatedStatus.status === 'MediaUploadStarted'
    ) {
      this.uploadRequestTimeline = [
        ...this.uploadRequestTimeline,
        {
          status: 'CustomStatusWaitingForNextUpdate',
          type: DVR_STATUS_TIMELINE_MAPPING['CustomStatusWaitingForNextUpdate'].type,
          description: DVR_STATUS_TIMELINE_MAPPING['CustomStatusWaitingForNextUpdate'].description,
        },
      ];
    }
  }
  public checkStatus(uploadRequestTimeline) {
    const notificationReceived = uploadRequestTimeline.some((item) => item.status === 'NotificationReceived');
    const mediaGenerationSuccessful = uploadRequestTimeline.some((item) => item.status === 'MediaGenerationSuccessful');
    const mediaUploadCompleted = uploadRequestTimeline.some((item) => item.status === 'MediaUploadCompleted');

    if (notificationReceived && mediaGenerationSuccessful && !mediaUploadCompleted) {
      this.isVideoDisable = true;
    } else {
      this.isVideoDisable = false;
    }
  }
}
