import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UpdateCoachingTagsFilters } from '@app-coaching/actions/coaching-filter.actions';
import { UpdateDurationFilter } from '@app-coaching/actions/duration-filter.actions';
import { getCoachingTags, getDurationFilterState, State } from '@app-coaching/reducers';
import { COACHING_STATUS_LIST } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CLIENT_CONFIG } from '@config/config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coaching',
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.scss'],
})
export class CoachingComponent implements OnInit, OnDestroy {
  public incidentTypeList = [];
  public coachingStatusList = COACHING_STATUS_LIST;
  public selectedCoachingStatus = 'all';
  public currentMetricUnit: string;
  public selectedIncidentType = 'incidents';
  public coachingStatus = new FormControl('all');
  public incidentType = new FormControl('incidents');
  public loader = false;
  public startDate: string;
  public endDate: string;
  public bookmarkList = [];
  public fleetId: string;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public tagIds = [];
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();
  public coachingTags: any[];
  public clientConfig = CLIENT_CONFIG;

  constructor(
    public translate: TranslateService,
    public dataService: DataService,
    private gtmService: GoogleTagManagerService,
    private store: Store<State>,
    private dateService: DateService,
    private router: Router
  ) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyIncidentTypeList();

    this.incidentTypeList = [
      {
        label: 'All Events',
        value: 'incidents',
        type: 'INCIDENT',
      },
      ...combinedEventsList,
    ];

    this.store
      .select(getDurationFilterState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((durationFilterState) => {
        ({ paramStartDate: this.startDate, paramEndDate: this.endDate } = durationFilterState);
      });

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
    this.store
      .select(getCoachingTags)
      .pipe(takeUntil(this.ngUnsubscribeOnChanges))
      .subscribe((tagFilter) => {
        const { tagIds } = tagFilter;
        this.tagIds = tagIds;
      });
    this.coachingTags = this.tagIds.length ? this.tagIds.map((tagid) => ({ tagId: tagid })) : [];
  }

  public changeDuration(durationChange: any): void {
    const {
      paramStartDate: newStartDate = '',
      paramEndDate: newEndDate = '',
      displayStartDate = null,
      displayEndDate = null,
    } = durationChange || {};
    const oldStartDate = this.startDate;
    const oldEndDate = this.endDate;
    const isTimeRangeChanged = newStartDate !== oldStartDate || newEndDate !== oldEndDate;
    if (isTimeRangeChanged) {
      const noOfDays = this.dateService.getNoOfDays(newStartDate, newEndDate);
      const durationInText = this.dateService.getDurationText(displayStartDate, displayEndDate, noOfDays);
      this.gtmService.changeCoachingDurationTypeFilter(durationInText, noOfDays);
    }
    this.store.dispatch(new UpdateDurationFilter(durationChange));
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
  }

  public selectedTags(tags) {
    this.store.dispatch(new UpdateCoachingTagsFilters({ tagIds: tags }));
    this.tagIds = tags;
  }

  public navigateToCoaching() {
    this.router.navigate(['/configurations'], {
      queryParams: {
        tab: 'coaching',
      },
    });
  }
}
