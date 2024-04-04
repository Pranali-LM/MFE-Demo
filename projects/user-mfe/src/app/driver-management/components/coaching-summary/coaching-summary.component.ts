import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AccessService } from '@app-core/services/access/access.service';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { FormControl, Validators } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-coaching-summary',
  templateUrl: './coaching-summary.component.html',
  styleUrls: ['./coaching-summary.component.scss'],
})
export class CoachingSummaryComponent implements OnInit, OnChanges {
  @Input()
  public isSideNavOpen: any;
  @Input()
  public driverDetails;
  @Input()
  public coachedDetails;
  @Input()
  private stepper;
  @Input()
  public loading = false;
  @Output()
  public clickPrevious = new EventEmitter<any>();
  @Output()
  public coachingComplete = new EventEmitter<any>();
  public loader = false;
  public dataSource = new MatTableDataSource<any>();
  public displayedColumns = ['incidentName', 'coachedCount', 'skippedCount'];
  public userInfo;
  public eventsConfig;
  public sessionComment = new FormControl('', Validators.maxLength(240));

  constructor(private accessService: AccessService, private dataService: DataService) {}

  ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };

    this.userInfo = this.accessService.getLoginInfo();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.coachedDetails?.currentValue) {
      this.getSummery();
    }
  }

  public getSummery() {
    this.dataSource.data = this.coachedDetails.incidentSummery;
  }

  public previous() {
    this.clickPrevious.emit(this.stepper);
  }

  public onCoachingComplete() {
    const data = {
      stepper: this.stepper,
      coachingSummary: (this.sessionComment.value || '').trim(),
      coachedByDetails: this.userInfo,
    };
    this.coachingComplete.emit(data);
  }
}
