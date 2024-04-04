import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-incident-stats',
  templateUrl: './incident-stats.component.html',
  styleUrls: ['./incident-stats.component.scss'],
})
export class IncidentStatsComponent implements OnInit {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() public incidentDetails: any;
  @Input() public loader = true;
  @Input() public eventTagList: any;
  @Input() public workflowTags: any = [];
  @Input() public tagListLoader = true;
  @Input() public workflowTagLoader = true;

  public fleetId: string;
  public currentMetricUnit = null;
  public workFlowStatus = 'NEW';

  @Output()
  private markIncidentAsNew = new EventEmitter<any>();

  constructor(public dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
  }

  public markAsNew() {
    this.markIncidentAsNew.emit();
  }
}
