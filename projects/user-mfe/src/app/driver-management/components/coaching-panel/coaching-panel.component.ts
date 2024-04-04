import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { speedSignTag, speedSignTagFilter } from '@app-core/constants/constants';
import { FormControl } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HomeService } from '@app-home/services/home.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { ChildConfigs, FleetEvents } from '@app-core/models/core.model';

@Component({
  selector: 'app-coaching-panel',
  templateUrl: './coaching-panel.component.html',
  styleUrls: ['./coaching-panel.component.scss'],
})
export class CoachingPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public startDate = '';
  @Input() public endDate = '';
  @Input() public driverId = '';
  public bookmarkLoader = false;
  public selectedBookmarkType = 'incidents';
  public bookmarkType = new FormControl('incidents');
  public bookmarkTypeList = [];
  public bookmarkList = [];
  public currentTimeZone: string;
  public currentDateFormat: string;
  public currentMetricUnit = null;
  public currentTheme = 'light';
  public subEventType = new FormControl('');
  public displaySubEventSelection: boolean;
  public subEventList = [];
  public fleetEvents: FleetEvents;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private gtmService: GoogleTagManagerService, private homeService: HomeService, public dataService: DataService) {
    const combinedEventsList = this.dataService.modifyIncidentTypeList();
    this.bookmarkTypeList = [
      {
        label: 'All Events',
        value: 'incidents',
        type: 'INCIDENT',
      },
      ...combinedEventsList,
    ];
  }

  ngOnInit() {
    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
      }
    });
    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
      }
    });
    this.dataService._currentDateFormat.subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });

    this.dataService._currentTheme.subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });

    if (this.bookmarkType) {
      this.displaySubEventSelection = !!this.bookmarkType.value && this.getChildConfigs(this.bookmarkType.value).length > 0;
      this.bookmarkType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
        this.displaySubEventSelection = !!val && this.getChildConfigs(val).length > 0;

        if (this.displaySubEventSelection) {
          this.subEventList = [...this.getChildConfigs(this.bookmarkType.value).sort((a, b) => (a.label > b.label ? 1 : -1))];
          this.filterChildConfigs();

          if (this.bookmarkType.value === 'Traffic-Speed-Violated') {
            this.subEventList = [...speedSignTagFilter, ...this.subEventList].sort((a, b) => (a.label > b.label ? 1 : -1));
          }
          this.setDefaultSubEventType();
        } else {
          this.subEventList = [];
        }
        const bkType = this.bookmarkTypeList.filter((x) => x.value === val)[0].value || 'incidents';
        this.selectedBookmarkType = bkType;
        this.gtmService.changeDriverVideoTypeFilter(this.selectedBookmarkType);
        this.getBookmarkedVideos();
      });
      this.subEventType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.getBookmarkedVideos());
    }
  }

  public ngOnChanges(): void {
    this.getBookmarkedVideos();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getChildConfigs(eventKey: string): ChildConfigs[] {
    const selectedEvent = this.dataService.modifyIncidentTypeList().find((event) => event.value === eventKey);
    if (selectedEvent && selectedEvent.childConfigs) {
      return Object.entries(selectedEvent.childConfigs).map(([key, value]: [string, { label: string }]) => ({ key, label: value.label }));
    }
    return [];
  }

  // Method to set the default value for highlightsSubEventType
  public setDefaultSubEventType() {
    const childConfigs = this.getChildConfigs(this.bookmarkType.value);
    if (childConfigs.length > 0) {
      this.subEventType.setValue(childConfigs[0].key);
    }
  }

  public filterChildConfigs() {
    this.fleetEvents = this.dataService.getFleetEvents();
    if (this.fleetEvents && this.fleetEvents.standardEvents.length) {
      let fleetSubEvents = this.fleetEvents.standardEvents.filter((f) =>
        this.subEventList.some((subEvent) => subEvent.key === f.eventType)
      );
      this.subEventList = this.subEventList.filter((subEvent) => {
        const matchedSubEvvents = fleetSubEvents.find((event) => event.eventType === subEvent.key);

        // If matchedSubEvents is undefined, it means subEvent.key is not in fleetEvents
        // If matchedSubEvents is defined, check its state and include in subEventList accordingly
        return !matchedSubEvvents || matchedSubEvvents.state !== 'DISABLED';
      });
    }
  }

  public getBookmarkedVideos(isRefresh?: boolean) {
    this.bookmarkLoader = true;
    return new Promise<void>((resolve) => {
      let requestType;
      if (this.bookmarkTypeList.filter((x) => x.value === this.selectedBookmarkType)[0]) {
        requestType = this.bookmarkTypeList.filter((x) => x.value === this.selectedBookmarkType)[0].type || 'INCIDENT';
      }
      const params = {
        offset: 0,
        limit: 100,
        sortBy: 'timestamp',
        sort: 'desc',
        bookmarkedOnly: true,
        startDate: this.startDate,
        endDate: this.endDate,
        driverId: this.driverId,
      };
      const childConfigs = this.getChildConfigs(this.bookmarkType.value);
      const arrayOfSpeedSignTags = Object.keys(speedSignTag);

      if (childConfigs.length > 0 && this.selectedBookmarkType !== 'incidents') {
        if (arrayOfSpeedSignTags.includes(this.subEventType.value)) {
          params['eventType'] = this.selectedBookmarkType;
          params['speedSignTag'] = this.subEventType.value;
        } else if (this.subEventType.value !== childConfigs[0].key) {
          params['eventType'] = this.subEventType.value;
        } else {
          params['eventType'] = this.selectedBookmarkType;
        }
      } else if (this.selectedBookmarkType !== 'incidents') {
        params['eventType'] = this.selectedBookmarkType;
      }

      this.homeService
        .getBookmarkedEvents(params, requestType, isRefresh)
        .pipe(
          finalize(() => {
            this.bookmarkLoader = false;
            resolve();
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res) => {
            const filteredRows = res.rows.filter((e) => {
              if (childConfigs.length > 0) {
                if (this.subEventType.value !== childConfigs[0].key) {
                  return e;
                } else {
                  return !e.hasOwnProperty('originalEventType');
                }
              } else {
                return e;
              }
            });
            this.bookmarkList = filteredRows || [];
          },
          () => {
            this.bookmarkList = [];
          }
        );
    });
  }
}
