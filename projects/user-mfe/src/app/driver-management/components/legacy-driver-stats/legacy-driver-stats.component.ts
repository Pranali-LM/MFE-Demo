import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-legacy-driver-stats',
  templateUrl: './legacy-driver-stats.component.html',
  styleUrls: ['./legacy-driver-stats.component.scss'],
})
export class LegacyDriverStatsComponent implements OnInit {
  @Input()
  public driverStats;
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
