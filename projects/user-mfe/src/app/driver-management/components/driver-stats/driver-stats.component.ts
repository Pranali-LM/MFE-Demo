import { Component, Input, OnInit, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { asymmetricArrayDiff } from '@app-core/models/dirty-check';

@Component({
  selector: 'app-driver-stats',
  templateUrl: './driver-stats.component.html',
  styleUrls: ['./driver-stats.component.scss'],
})
export class DriverStatsComponent implements OnInit, OnChanges {
  @Input()
  public driverStats;
  @Input()
  public loader = true;
  @Input()
  public driverTags;
  @Input()
  public driverTagsLoader = true;
  @Input()
  private driverId;

  @Output() public isCoachingRequired = new EventEmitter<any>();
  public tagSelected: boolean = false;
  public currentMetricUnit = null;
  public assignTagsLoader = false;
  public getDriverTagsLoader = false;
  public assignedTags = [];
  public driverDetails = {};
  private oldDriverTags = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private selectedTagIds = [];

  constructor(
    private dataService: DataService,
    private driverManagementService: DriverManagementService,
    private snackBarService: SnackBarService,
    private translate: TranslateService
  ) {}

  public ngOnInit() {
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
    this.getDriverTags();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.driverId || changes.driverId?.currentValue) {
      this.getDriverTags();
    }
  }

  public selectedTags(value) {
    this.selectedTagIds = value;
    const eventTagsIds: Number[] = (this.oldDriverTags || []).map((t) => t.tagId);
    const diff = asymmetricArrayDiff<Number>(value || [], eventTagsIds);
    this.tagSelected = Boolean(diff.length);
  }

  public assignTags() {
    this.assignTagsLoader = true;

    const body = {
      driverTags: this.selectedTagIds,
    };

    this.driverManagementService
      .updateDriverTags(body, this.driverId)
      .pipe(
        finalize(() => {
          this.assignTagsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('driverTagAssignSuccess'));
          this.getDriverTags();
        },
        () => {
          this.snackBarService.failure(this.translate.instant('driverTagAssignFailure'));
        }
      ),
      () => {
        this.snackBarService.failure(this.translate.instant('driverTagAssignFailure'));
      };
  }

  private getDriverTags() {
    this.getDriverTagsLoader = true;
    this.driverManagementService
      .getDriverTags_v2(this.driverId)
      .pipe(
        finalize(() => {
          this.getDriverTagsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.assignedTags = res?.data?.driverTags;
          this.oldDriverTags = res?.data?.driverTags;
          this.driverDetails = res?.data;
          this.driverManagementService.driverStats.next(res?.data || {});
          this.isCoachingRequired.emit(res?.data?.isCoachingRequired || false);
        },
        () => {
          this.assignedTags = [];
        }
      ),
      () => {
        this.assignedTags = [];
      };
  }
}
