import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-session-details-modal',
  templateUrl: './session-details-modal.component.html',
  styleUrls: ['./session-details-modal.component.scss'],
})
export class SessionDetailsModalComponent {
  public sessionDetails;
  public totalCoachedIncidents = 0;
  public totalSkippedIncidents = 0;
  public coachedIncidents = [];
  public eventsConfig;
  constructor(
    public dialogRef: MatDialogRef<SessionDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService
  ) {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
    this.sessionDetails = data?.details;
    const events = data?.details?.events;
    events.map((e) => {
      if (e.status === 'COACHED') {
        this.totalCoachedIncidents++;
        const index = this.coachedIncidents.indexOf(e.eventType);
        if (index === -1) {
          this.coachedIncidents.push(e.eventType);
        }
      } else {
        this.totalSkippedIncidents++;
      }
    });
  }

  public dailogClose() {
    this.dialogRef.close();
  }
}
