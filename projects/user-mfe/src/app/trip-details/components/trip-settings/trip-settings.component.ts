import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { MatCheckboxChange } from '@angular/material/checkbox';

import { DataService } from '@app-core/services/data/data.service';
import { CLIENT_CONFIG } from '@config/config';

@Component({
  selector: 'app-trip-settings',
  templateUrl: './trip-settings.component.html',
  styleUrls: ['./trip-settings.component.scss'],
})
export class TripSettingsComponent implements OnInit {
  @Output()
  private eventListChange = new EventEmitter<string[]>();
  private clientConfig = CLIENT_CONFIG;

  public otherEvents = [];
  public eventsConfig: any;
  public selectedEventList = [];
  public modifiedEventList;

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    this.modifiedEventList = combinedEventsList.filter((r) => r['showHighlights']).map((k) => ({ key: k['key'], label: k['label'] }));

    this.eventsConfig = this.modifiedEventList;
    this.otherEvents = [
      {
        key: 'dvrEvents',
        label: 'Video Requests',
      },
      {
        key: 'externalEvents',
        label: this.clientConfig.externalEventsLabel || 'Ext. Incidents',
      },
      {
        key: 'possibleCollision',
        label: 'Possible Collision',
      },
    ];
  }

  /**
   * Stop Propogation incase of multiple selection to avoid closing of the menu
   * @param e Click event
   */
  public selectEvent(e: Event) {
    e.stopPropagation();
  }

  /**
   * Alter selcted event list array based on mat checkbox checked property
   * @param e Mat check box event
   * @param event Event type
   */
  public checkEvent(e: MatCheckboxChange, event: string) {
    if (!event) {
      return;
    }
    if (e.checked) {
      this.selectedEventList.push(event);
    } else {
      const index = this.selectedEventList.findIndex((o) => o === event);
      if (index > -1) {
        this.selectedEventList.splice(index, 1);
      }
    }
    this.eventListChange.emit(this.selectedEventList);
  }
}
