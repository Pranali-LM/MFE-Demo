import { Component, Input, OnInit } from '@angular/core';

import { DataService } from '@app-core/services/data/data.service';
import { AbbreviateNumberPipe } from '@app-shared/pipes/abbreviate-number/abbreviate-number.pipe';
import { DistancePipe } from '@app-shared/pipes/distance/distance.pipe';

/**
 * Analytics page Fleet snapshot component
 */
@Component({
  selector: 'app-fleet-stats',
  templateUrl: './fleet-stats.component.html',
  styleUrls: ['./fleet-stats.component.scss'],
  providers: [DistancePipe, AbbreviateNumberPipe],
})
export class FleetStatsComponent implements OnInit {
  @Input()
  public fleetStats;
  @Input()
  public loader = true;
  public currentMetricUnit = null;

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
  }
}
