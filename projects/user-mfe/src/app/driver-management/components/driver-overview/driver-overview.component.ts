import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-driver-overview',
  templateUrl: './driver-overview.component.html',
  styleUrls: ['./driver-overview.component.scss'],
})
export class DriverOverviewComponent implements OnChanges {
  @Input() driverDetails;
  @Input() public loader = false;
  public eventDiff: any;
  public currentTheme = 'light';
  public eventsConfig;

  constructor(public dataService: DataService) {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.driverDetails.currentValue.eventCount) {
      this.loadEventDiff();
    }
  }

  private loadEventDiff() {
    var pieChartValue = {};
    for (let key in this.driverDetails.eventCount) {
      let value = this.driverDetails.eventCount[key];
      if (value > 0) {
        pieChartValue[key] = {
          current: value,
          diff: 0,
          percent: (value / this.driverDetails.eventCount['total']) * 100,
        };
      }
    }
    this.eventDiff = pieChartValue;
  }
}
