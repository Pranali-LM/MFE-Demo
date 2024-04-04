import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { Sort } from '@angular/material/sort';
import { Subject, timer } from 'rxjs';
import { finalize, skip, take, takeUntil } from 'rxjs/operators';

import { UpdateDurationFilter } from '@app-home/actions/duration-filter.actions';
import { getDurationFilterState, getHomeTags, State } from '@app-home/reducers';

import { FleetStatsParams, SevereViolationsData } from '@app-home/models/home.model';
import { CONFIGS_WITH_SUBCONFIGS, DURATION_LIST, EVENTS_CONFIG, speedSignTag, speedSignTagFilter } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { DateService } from '@app-core/services/date/date.service';
import { GoogleTagManagerService, ToggleState } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { HomeService } from '../../services/home.service';
import { environment } from '@env/environment';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackwidgetComponent } from '@app-shared/components/feedback-widget/feedback-widget.component';
import { CoachingService } from '@app-coaching/services/coaching/coaching.service';
import { FormControl } from '@angular/forms';
import { AnnouncementBannerComponent } from '@app-home/components/announcement-banner/announcement-banner.component';
import { CLIENT_CONFIG } from '@config/config';
import { UpdateHomeTagsFilter } from '@app-home/actions/home-filter-tags.action';
import { ChildConfigs, FleetEvents } from '@app-core/models/core.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('paginator')
  public paginator: MatPaginator;
  public durationDays: number;
  public durationTitle: string;
  public durationList = DURATION_LIST;
  public fleetStats = {
    tripCount: 0,
    distance: 0,
    eventsPer100Units: 0,
    totalEventsDiff: 0,
    tripDuration: 0,
  };
  public eventDiff = [];
  public safeDriverList = [];
  public unSafeDriverList = [];
  public driverListTitle = 'Driver list';
  public safeDriversTitle = 'Top Drivers';
  public unSafeDriversTitle = 'Require Coaching';
  public showTopIncident = true;
  public currentTimeZone: string;
  public severeFleetViolations: SevereViolationsData;
  public selectedTags: string[] = [];
  public clientConfig = CLIENT_CONFIG;

  public loginName: string;
  public fleetId: string;

  public startDate: string;
  public endDate: string;
  public fleetEventLoader = true;
  public driverListLoader = true;
  public fleetStatsLoader = true;
  public currentMetricUnit = null;
  public currentDateFormat = null;
  public currentTheme = 'light';
  public isDevEnv = environment?.env === 'dev' ? true : false;
  public feedbackButtonLoader = false;
  public coachingRecommendLoader = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public highlightsEventType = new FormControl('');
  public eventList = [];
  public currentTabIndex: number;
  public isFeedbackWidgetOpen = false;
  public coachableDriverList = [];

  public alert = {
    showAlert: false,
    alertMessage: '',
    alertType: '',
  };
  public modifiedEventList;
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();
  public tagIds: any[];
  public homeTags: any[];

  private limit = 5;
  public topDriversOffset: number = 0;
  public coachableDriversOffset: number = 0;
  public topDriversTotalCount: number;
  public coachableDriversTotalCount: number;
  public highlightsData: SevereViolationsData;
  public highlightsSubEventType = new FormControl('');
  public displaySubEventSelection: boolean;
  public subEventList = [];
  public fleetEvents: FleetEvents;

  /**
   *  Inject analytics, access and date services
   */
  constructor(
    private store: Store<State>,
    private homeService: HomeService,
    private accessService: AccessService,
    private dateService: DateService,
    private gtmService: GoogleTagManagerService,
    public dataService: DataService,
    public translate: TranslateService,
    private dialog: MatDialog,
    private coachingService: CoachingService
  ) {}

  /**
   * Get currently applied filter data from the store
   *
   * Get login name and fleet ID of the logged in user
   *
   * Call getData function
   */
  public ngOnInit() {
    this.dataService.refreshIncidentsList$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getFleetSevereViolations(true);
    });
    const combinedEventsList = this.dataService.modifyFleeEvents();
    this.modifiedEventList = combinedEventsList
      .filter((r) => r['showHighlights'])
      .map((k) => ({ key: k['key'], label: k['label'], childConfigs: k['childConfigs'] }));

    this.displaySubEventSelection = !!this.highlightsEventType.value && this.getChildConfigs(this.highlightsEventType.value).length > 0;

    this.highlightsEventType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      const event = this.eventList.find((e) => e.key === value);
      const childConfigs = this.getChildConfigs(this.highlightsEventType.value);

      this.displaySubEventSelection = !!this.highlightsEventType.value && childConfigs.length > 0;
      if (this.displaySubEventSelection) {
        this.subEventList = [...childConfigs].sort((a, b) => (a.label > b.label ? 1 : -1));

        this.filterChildConfigs();

        if (value === 'Traffic-Speed-Violated') {
          this.subEventList = [...speedSignTagFilter, ...this.subEventList].sort((a, b) => (a.label > b.label ? 1 : -1));
        }
        this.setDefaultSubEventType();
      } else {
        this.subEventList = [];
      }

      this.gtmService.changeFleetHighlightsEventTypeFilter(event.label);
      if (value) {
        if (childConfigs.length && this.highlightsSubEventType.value === childConfigs[0].key) {
          this.getFilteredSevereViolations(value);
        } else {
          this.getSubFilteredSevereViolations();
        }
      } else {
        this.fleetEventLoader = true;
        timer(500)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.fleetEventLoader = false;
            const filteredData = this.modifyResponse({ ...this.highlightsData });
            const modifiedData = Object.keys(filteredData).reduce((result, key) => {
              const array = filteredData[key];
              result[key] = array.length > 0 ? [array[0]] : [];
              return result;
            }, {});
            this.severeFleetViolations = this.homeService.fillModifiedDataToTarget(modifiedData, filteredData, 5);
          });
      }
    });

    this.highlightsSubEventType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.getSubFilteredSevereViolations());

    this.eventList = [
      {
        key: '',
        label: 'All',
      },
      ...this.modifiedEventList,
    ];

    ({ loginName: this.loginName } = this.accessService.getLoginInfo());

    this.store
      .select(getDurationFilterState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((durationFilterState) => {
        ({ days: this.durationDays, startDate: this.startDate, endDate: this.endDate } = durationFilterState);
        if (this.startDate && this.endDate && this.currentMetricUnit) {
          this.getData();
        }
        this.durationTitle = this.getDurationTitle(this.durationDays);
      });

    this.dataService._currentMetricUnit.subscribe((value: string) => {
      if (value) {
        this.currentMetricUnit = value;
        if (this.startDate && this.endDate && this.currentMetricUnit) {
          this.getData();
        }
      }
    });

    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
      }
    });

    this.dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });

    this.dataService._currentTheme.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTheme = value;
      }
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe), take(1)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe), skip(1)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        this.getData();
      }
    });
    this.store
      .select(getHomeTags)
      .pipe(takeUntil(this.ngUnsubscribeOnChanges))
      .subscribe((tagFilter) => {
        const { tagIds } = tagFilter;
        this.tagIds = tagIds;
      });
    this.homeTags = this.tagIds.length
      ? this.tagIds.map((tagid) => ({ tagId: tagid }))
      : this.homeService?.tagIds.map((tagid) => ({ tagId: tagid }));
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
  }

  private getDurationTitle(days: number) {
    const index = this.durationList.findIndex((d) => d.days === days);
    return index > -1 ? this.durationList[index].title : '';
  }

  public getChildConfigs(eventKey: string): ChildConfigs[] {
    const selectedEvent = this.modifiedEventList.find((event) => event.key === eventKey);
    if (selectedEvent && selectedEvent.childConfigs) {
      return Object.entries(selectedEvent.childConfigs).map(([key, value]: [string, { label: string }]) => ({ key, label: value.label }));
    }
    return [];
  }

  // Method to set the default value for highlightsSubEventType
  public setDefaultSubEventType() {
    const childConfigs = this.getChildConfigs(this.highlightsEventType.value);
    if (childConfigs.length > 0) {
      this.highlightsSubEventType.setValue(this.getChildConfigKey(childConfigs, this.highlightsEventType.value));
    }
  }

  public filterChildConfigs() {
    this.fleetEvents = this.dataService.getFleetEvents();
    if (this.fleetEvents && this.fleetEvents.standardEvents.length) {
      let fleetSubEvents = this.fleetEvents.standardEvents.filter((f) =>
        this.subEventList.some((subEvent) => subEvent.key === f.eventType)
      );
      this.subEventList = this.subEventList.filter((subEvent) => {
        const matchedSubEvents = fleetSubEvents.find((event) => event.eventType === subEvent.key);

        // If matchedSubEvents is undefined, it means subEvent.key is not in fleetEvents
        // If matchedSubEvents is defined, check its state and include in subEventList accordingly
        return !matchedSubEvents || matchedSubEvents.state !== 'DISABLED';
      });
    }
  }

  public getChildConfigKey(childConfigs: ChildConfigs[], parent_key: string): string {
    const data = this.highlightsData;

    // If none of the keys from data are present, look for parentKey
    if (data && data.hasOwnProperty(parent_key) && data[parent_key].length > 0) {
      return childConfigs[0].key;
    }

    for (const item of childConfigs) {
      if (data && data.hasOwnProperty(item.key) && data[item.key].length > 0) {
        return item.key;
      }
    }

    // If none of the keys are present, return an empty string
    return childConfigs[0].key;
  }

  /**
   * If fleetId is present call getFleetStats and getSafeAndUnsafeDriverList function
   * asynchronously and toggle loader flag.
   * @returns {undefined}
   */
  public async getData() {
    this.feedbackButtonLoader = true;
    if (!this.fleetId) {
      return;
    }
    this.getCoachReccomendList();
    this.getFleetStats();
    this.getTopDrivers();
    this.getFleetSevereViolations();
    this.feedbackButtonLoader = false;
  }

  private getTopDrivers() {
    this.driverListLoader = true;
    const topDriversParams = {
      startDate: this.startDate,
      endDate: this.endDate,
      fleetId: this.fleetId,
      unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      category: 'SAFE',
      limit: 5,
      offset: this.topDriversOffset,
    };
    if (this.selectedTags.length) {
      topDriversParams['tagIds[]'] = this.selectedTags;
    }
    this.homeService
      .getTopDriversList(topDriversParams)
      .pipe(
        finalize(() => {
          this.driverListLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.safeDriverList = res?.topDrivers;
          this.topDriversTotalCount = res?.totalCount;
        },
        () => {
          this.safeDriverList = [];
          this.topDriversTotalCount = 0;
        }
      );
  }

  /**
   * Get fleet statistics for the selected duration.
   *
   * @returns {Promise} Resolve in both success and error callbacks.
   */
  public getFleetStats(): Promise<void> {
    this.fleetStatsLoader = true;
    return new Promise((resolve) => {
      const params = new FleetStatsParams({
        startDate: this.startDate,
        endDate: this.endDate,
        fleetId: this.fleetId,
        includeEventDiff: true,
        unit: this.currentMetricUnit === 'Miles' ? 'mi' : 'km',
      });
      if (this.selectedTags.length) {
        params['tagIds[]'] = this.selectedTags;
      }
      this.homeService
        .getFleetStats(params)
        .pipe(
          finalize(() => {
            resolve();
            this.fleetStatsLoader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res: any = {}) => {
            const { distance = 0, tripCount = 0, eventsPer100Units = 0, totalEventsDiff = 0, eventDiff = {}, tripDuration } = res.aggregate;

            this.eventDiff = eventDiff;
            this.fleetStats = {
              distance,
              tripCount,
              eventsPer100Units,
              totalEventsDiff,
              tripDuration,
            };
          },
          () => {}
        );
    });
  }

  /**
   * Helper function to get from and to ISO string for the given days.
   * @param {number} noOfDays Number of days
   * @returns {{from: string, to: string}} Object with from and to ISO string.
   */
  private getStartAndEndTime(noOfDays) {
    const dateRange = this.dateService.getDateRangeInISO(noOfDays);
    const { from, to } = dateRange;
    return {
      from,
      to,
    };
  }

  /**
   * Get fleet severe violations for the selected duration.
   *
   * @returns {Promise} Resolve in both success and error callbacks.
   */
  public getFleetSevereViolations(isRefresh?: Boolean): Promise<void> {
    this.fleetEventLoader = true;
    return new Promise((resolve) => {
      const eventType = this.highlightsEventType.value;
      const params = {
        startDate: this.startDate,
        endDate: this.endDate,
        limit: 5,
      };

      if (this.selectedTags.length) {
        params['tagIds[]'] = this.selectedTags;
      }

      this.homeService
        .getSevereViolations(params, isRefresh)
        .pipe(
          finalize(() => {
            resolve();
            this.fleetEventLoader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res: SevereViolationsData = {}) => {
            this.highlightsData = res;
            if (eventType) {
              this.getFilteredSevereViolations(eventType);
              this.getSubFilteredSevereViolations();
            } else {
              const modifiedResp = this.modifyResponse({ ...res });
              const modifiedData = Object.keys(modifiedResp).reduce((result, key) => {
                const array = modifiedResp[key];
                result[key] = array.length > 0 ? [array[0]] : [];
                return result;
              }, {});
              this.severeFleetViolations = this.homeService.fillModifiedDataToTarget(modifiedData, modifiedResp, 5);
            }
          },
          () => {
            this.severeFleetViolations = {};
          }
        );
    });
  }

  /**
   * Function binded to duration filter change output event
   *
   * Dispatch update duration filter action
   */
  public changeDuration(days): void {
    const { from: startDate, to: endDate } = this.getStartAndEndTime(days);
    this.store.dispatch(new UpdateDurationFilter({ days, startDate, endDate }));
    const durationTitle = this.getDurationTitle(days);
    this.gtmService.changeFleetOverviewDurationFilter(durationTitle, days);
  }

  public onDriversTablePageChange(event: PageEvent, isSafeDriver: boolean) {
    if (isSafeDriver) {
      this.gtmService.safeDriversPageChange(event);
      const { pageIndex = 0 } = event;
      this.topDriversOffset = pageIndex * 5;
      this.getTopDrivers();
    } else {
      this.gtmService.unsafeDriversPageChange(event);
      const { pageIndex = 0 } = event;
      this.coachableDriversOffset = pageIndex * 5;
      this.getCoachReccomendList();
    }
  }

  public onDriversTableSortChange(event: Sort, isSafeDriver: boolean) {
    if (isSafeDriver) {
      this.gtmService.sortSafeDrivers(event);
    } else if (isSafeDriver !== undefined && !isSafeDriver) {
      this.gtmService.sortUnsafeDrivers(event);
    }
  }

  /**
   * Function binded to search tag output event
   *
   * Dispatch update search tag filter action
   */
  public changeSearchByTags(tags: any): void {
    let overViewTags;
    if (tags) {
      overViewTags = tags.join(' + ');
      this.homeService.tagIds = tags;
      this.store.dispatch(new UpdateHomeTagsFilter({ tagIds: tags }));
      this.gtmService.changeFleetOverviewTags(overViewTags);
    }
    this.selectedTags = tags;
    this.getData();
  }

  public openFeedbackWidget() {
    this.feedbackButtonLoader = true;
    this.dialog.closeAll();
    this.isFeedbackWidgetOpen = true;
    const dialogRef = this.dialog.open(FeedbackwidgetComponent, {
      position: {
        bottom: '96px',
        right: '32px',
      },
      width: '400px',
      height: '480px',
      autoFocus: false,
      disableClose: false,
      hasBackdrop: false,
      closeOnNavigation: true,
    });
    this.gtmService.toggleFeedbackWidget(ToggleState.show);
    this.feedbackButtonLoader = false;
    dialogRef.afterClosed().subscribe(() => {
      this.gtmService.toggleFeedbackWidget(ToggleState.hide);
      this.isFeedbackWidgetOpen = false;
    });
  }

  public closeFeedbackWidget() {
    this.isFeedbackWidgetOpen = false;
    this.dialog.closeAll();
  }

  private getCoachReccomendList() {
    this.coachingRecommendLoader = true;
    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      fleetId: this.fleetId,
      limit: this.limit,
      skip: this.coachableDriversOffset,
    };

    if (this.selectedTags.length) {
      params['tagIds[]'] = this.selectedTags;
    }

    this.coachingService
      .getCoachReccomendList(params)
      .pipe(
        finalize(() => {
          this.coachingRecommendLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.coachableDriversTotalCount = res?.totalCount;
          this.coachableDriverList = res?.rows;
        },
        () => {
          this.coachableDriverList = [];
        }
      ),
      (error) => {
        console.error(error);
        this.coachableDriverList = [];
      };
  }

  public viewAnnouncementDetails() {
    this.dialog.open(AnnouncementBannerComponent, {
      width: '640px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: false,
    });
  }

  private getFilteredSevereViolations(eventType: string, tag?: boolean) {
    let filteredHighlightsData;
    if (tag) {
      filteredHighlightsData = this.highlightsData
        ? this.highlightsData[this.highlightsEventType.value].filter(
            (element) => element.hasOwnProperty('autoTags') && element.autoTags.includes(tag)
          )
        : [];
    } else {
      filteredHighlightsData = this.highlightsData && eventType in this.highlightsData ? this.highlightsData[eventType] : [];
    }
    const data = filteredHighlightsData;

    this.fleetEventLoader = true;
    const filteredData = { [eventType]: data };
    timer(500)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.fleetEventLoader = false;
        this.severeFleetViolations = filteredData;
      });
  }

  private deleteChildKey(data: SevereViolationsData, parent_key: string): SevereViolationsData {
    // Find a child key present in response_data, in alphabetical order, that has a value
    const validChildKey = CONFIGS_WITH_SUBCONFIGS[parent_key].sort().find((child_key) => {
      return data[child_key] && data[child_key].length > 0;
    });

    if (validChildKey) {
      // Remove other child keys present in response_data
      CONFIGS_WITH_SUBCONFIGS[parent_key].forEach((child_key) => {
        if (child_key !== validChildKey) {
          delete data[child_key];
        }
      });
    }
    return data;
  }

  private removeParticularViolations(data: SevereViolationsData): SevereViolationsData {
    const filteredEvents = {};
    for (const [key, value] of Object.entries(EVENTS_CONFIG)) {
      if (value.showHighlights === false) {
        filteredEvents[key] = value;
      }
    }
    // Remove keys from the original object
    for (const key of Object.keys(filteredEvents)) {
      delete data[key];
    }
    return data;
  }

  private modifyResponse(data: SevereViolationsData): SevereViolationsData {
    for (const parent_key in CONFIGS_WITH_SUBCONFIGS) {
      if (parent_key in data) {
        if (data[parent_key].length > 0) {
          CONFIGS_WITH_SUBCONFIGS[parent_key].forEach((child_key) => delete data[child_key]);
        } else {
          data = this.deleteChildKey(data, parent_key);
        }
      } else {
        data = this.deleteChildKey(data, parent_key);
      }
    }
    data = this.removeParticularViolations(data);
    return data;
  }

  public getSubFilteredSevereViolations() {
    const subEvent = this.highlightsSubEventType.value;
    const filterbySpeedSigntags = Object.keys(speedSignTag).includes(subEvent);

    const childConfigs = this.getChildConfigs(this.highlightsEventType.value);
    if (subEvent && childConfigs.length && subEvent !== childConfigs[0].key) {
      this.getFilteredSevereViolations(subEvent, filterbySpeedSigntags);
    } else {
      this.getFilteredSevereViolations(this.highlightsEventType.value, filterbySpeedSigntags);
    }
  }
}
