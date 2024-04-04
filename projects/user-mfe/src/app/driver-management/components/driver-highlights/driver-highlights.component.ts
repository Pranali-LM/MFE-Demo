import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CONFIGS_WITH_SUBCONFIGS, EVENTS_CONFIG, speedSignTag, speedSignTagFilter } from '@app-core/constants/constants';
import { ChildConfigs, FleetEvents } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { SevereViolationsData } from '@app-home/models/home.model';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
import { getSideNavigationConfigState, State } from '@app-shared/reducers';
import { CLIENT_CONFIG } from '@config/config';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, finalize, delay } from 'rxjs/operators';
import { HomeService } from '@app-home/services/home.service';
@Component({
  selector: 'app-driver-highlights',
  templateUrl: './driver-highlights.component.html',
  styleUrls: ['./driver-highlights.component.scss'],
})
export class DriverHighlightsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;
  @ViewChild('driverHighlights', { static: true }) public driverHighlights: ElementRef;

  @Input()
  public timezone = '';
  @Input()
  public dateFormat = '';
  @Input()
  public driverName: string = '';
  @Input()
  public startDate = '';
  @Input()
  public endDate = '';
  @Input()
  public driverId = '';

  public videoList = [];
  public videoListDataSource: any;
  public dummyVideoList = new Array(5).fill(undefined);
  private unsubscribeRace = new Subject<void>();

  public carouselContainerWidth = 0;
  public carouselCardWidth = 0;
  public pageSize = 5;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private unsubscribeOnDestroy: Subject<void> = new Subject<void>();
  public videoListObservable: Observable<any>;
  public highlightsEventType = new FormControl('');
  public eventList = [];
  private driverSevereViolations: SevereViolationsData;
  public loader = true;
  public driverHighlightsData: SevereViolationsData;
  public highlightsSubEventType = new FormControl('');
  public displaySubEventSelection: boolean;
  public subEventList = [];
  public modifiedEventList;
  public fleetEvents: FleetEvents;
  public paginatedVideoList: any[] = [];
  public clientConfig = CLIENT_CONFIG;

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private gtmService: GoogleTagManagerService,
    private router: Router,
    private accessService: AccessService,
    private snackbarService: SnackBarService,
    private store: Store<State>,
    public translate: TranslateService,
    private homeService: HomeService
  ) {}

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    this.modifiedEventList = combinedEventsList
      .filter((r) => r['showHighlights'])
      .map((k) => ({ key: k['key'], label: k['label'], childConfigs: k['childConfigs'] }));

    this.displaySubEventSelection = !!this.highlightsEventType.value && this.getChildConfigs(this.highlightsEventType.value).length > 0;

    this.dataService.refreshIncidentsList$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getDriverSevereViolations(true);
    });

    this.eventList = [
      {
        key: '',
        label: 'All',
      },
      ...this.modifiedEventList,
    ];

    this.highlightsEventType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      const event = this.eventList.find((e) => e.key === value);
      const childConfigs = this.getChildConfigs(this.highlightsEventType.value);

      this.gtmService.changeDriverHighlightsEventTypeFilter(event.label);
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
      this.getDriverSpecificSevereViolations();
    });

    this.highlightsSubEventType.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.getDriverSpecificSevereViolations());

    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.unsubscribeOnDestroy), delay(500))
      .subscribe(() => {
        this.checkCarouselConfiguration();
      });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ((changes.startDate && changes.startDate.currentValue) || (changes.driverId && changes.driverId.currentValue)) {
      this.getDriverSevereViolations();
      this.paginator.firstPage();
    }
  }

  public ngAfterViewInit(): void {
    this.checkCarouselConfiguration();
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.driverHighlightsTablePageChange(event);
    });
    // this.tableSource.paginator = this.paginator;
  }

  public checkCarouselConfiguration() {
    this.carouselContainerWidth = this.driverHighlights.nativeElement.offsetWidth;
    this.calculateSlidesToShowOnScreen();
    this.cdRef.detectChanges();
    this.dummyVideoList = new Array(this.pageSize).fill(undefined);
    this.updatePaginatedList();
  }

  public ngOnDestroy() {
    this.unsubscribeRace.next();
    this.unsubscribeRace.complete();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.unsubscribeOnDestroy.next();
    this.unsubscribeOnDestroy.complete();
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
    if (this.subEventList.length > 0) {
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
        const matchedSubEvvents = fleetSubEvents.find((event) => event.eventType === subEvent.key);

        // If matchedSubEvents is undefined, it means subEvent.key is not in fleetEvents
        // If matchedSubEvents is defined, check its state and include in subEventList accordingly
        return !matchedSubEvvents || matchedSubEvvents.state !== 'DISABLED';
      });
    }
  }

  public getChildConfigKey(childConfigs: ChildConfigs[], parent_key: string): string {
    const data = this.driverHighlightsData;

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

  public showMedia(event: any = {}) {
    // modifying data for show only viewable pages
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(this.videoList, event.positionIndex, this.pageSize);
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(event.positionIndex, this.pageSize);

    this.gtmService.viewDriverHighlightsVideo(event.eventTypeLabel);

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: 'Drivers',
        allEvents: filteredDataForPagination,
        currentIndex: filteredDataPaginationIndex,
        isDriverPage: true,
      },
    });
  }

  public calculateSlidesToShowOnScreen() {
    const { carouselCardWidth, totalCardsInDisplay } = this.dataService.getCarouselConfiguration(this.carouselContainerWidth);
    this.carouselCardWidth = carouselCardWidth - (24 - 24 / totalCardsInDisplay);
    this.pageSize = totalCardsInDisplay;
  }

  public getPaginatedVideoList(): any[] {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    if (this.videoListDataSource && this.videoListDataSource.data) {
      return this.videoListDataSource.data.slice(startIndex, endIndex);
    }
  }

  private updatePaginatedList() {
    this.paginatedVideoList = this.getPaginatedVideoList();
  }

  public pushGotoTripDetailsGtmEvent(event: any = {}) {
    this.gtmService.gotoTripDetailsFromDriverHighlights(event.eventTypeLabel);
  }

  public pageEvent(event: any) {
    this.paginator.pageIndex = event.pageIndex;
    this.updatePaginatedList();
    if (event) {
      this.loader = true;

      setTimeout(() => {
        this.loader = false;
      }, 500);
    }
  }

  public coachIncident(incidentDetails: any) {
    this.gtmService.coachinginDriverIncidentList(incidentDetails.eventTypeLabel, incidentDetails.asset.assetId);
    this.updateIncident(incidentDetails, 'COACHING');
  }

  public discardIncident(incidentDetails: any) {
    this.gtmService.discardIncidentInDriverIncidentList(incidentDetails.eventTypeLabel, incidentDetails.asset.assetId);
    this.updateIncident(incidentDetails, 'REPORT_BUG');
  }

  public viewTripDetails(incident: any) {
    this.gtmService.gotoTripDetailsFromDriversIncidentsList(incident.eventTypeLabel, incident.asset.assetId);
    this.router.navigate(['/trip-details'], {
      queryParams: {
        tripId: incident.tripId,
        driverId: incident.driverId,
      },
    });
  }

  private updateIncident(incidentDetails: any, updateType: string) {
    incidentDetails.actionLoader = true;
    const { tripId = '', driverId = '', eventIndex = '' } = incidentDetails;
    const { loginName: userEmail, name: userName } = this.accessService.getLoginInfo();
    const params = {
      tripId,
      driverId,
      events: [
        {
          eventIndex,
          ...(updateType === 'REPORT_BUG' && {
            reportBug: true,
            challengeRaised: true,
            challengeAccepted: true,
            challengeResolved: true,
          }),
          ...(updateType === 'COACHING' && {
            bookmark: true,
            coachingCompleted: false,
            coachingInitiatedMetadata: {
              userType: 'FLEET_MANAGER',
              email: userEmail,
              name: userName,
            },
          }),
        },
      ],
    };
    this.dataService
      .updateEventMetadata(params)
      .pipe(
        finalize(() => {
          incidentDetails.actionLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          if (updateType === 'REPORT_BUG') {
            incidentDetails.reportBug = true;
          } else {
            incidentDetails.bookmark = true;
          }
          this.snackbarService.success(this.translate.instant('commonIncidentViewUpdatedSuccessfully'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('commonIncidentViewUpdateFailed'));
        }
      );
  }

  public getDriverSevereViolations(isRefresh?: Boolean) {
    this.loader = true;

    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      driverId: this.driverId,
      limit: 5,
    };
    this.homeService
      .getSevereViolations(params, isRefresh)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: SevereViolationsData) => {
          this.driverHighlightsData = res;
          this.getDriverSpecificSevereViolations();
        },
        () => {
          this.driverSevereViolations = {};
          this.violations(this.driverSevereViolations);
        }
      );
  }

  private violations(violations) {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = { ...EVENTS_CONFIG, ...this.dataService.transformObject(combinedEventsList) };
    this.videoList = Object.entries(violations || {})
      .reduce((acc, [key, value = []]: any) => {
        const parentKey = (() => {
          const entry = Object.entries(CONFIGS_WITH_SUBCONFIGS).find(([_parentkey, array]) => array.includes(key));
          return entry ? entry[0] : null;
        })();
        const events = value.map((e) => ({
          eventTypeLabel: parentKey ? modifiedEventsConfig[parentKey]?.label : modifiedEventsConfig[key]?.label,
          isVideo: e?.mediaFiles.length && e?.mediaFiles[0]?.videoDetails ? true : false,
          ...e,
        }));
        return [...acc, ...events];
      }, [])
      .sort((a, b) => (a.eventTypeLabel < b.eventTypeLabel ? -1 : 1));
    this.setVedioList();
  }

  private setVedioList() {
    this.calculateSlidesToShowOnScreen();

    if (this.videoList.length) {
      this.videoList = this.videoList.map((x, index) => {
        return { ...x, positionIndex: index };
      });

      this.videoListDataSource = new MatTableDataSource<any>(this.videoList);
      // connect datasource and pagination
      this.videoListDataSource.paginator = this.paginator;
      this.checkCarouselConfiguration();
      this.paginator.firstPage();
    } else {
      this.videoListDataSource = new MatTableDataSource<any>([]);
      // connect datasource and pagination
      this.videoListDataSource.paginator = this.paginator;
      this.checkCarouselConfiguration();
      this.paginator.firstPage();
    }
  }

  public getDriverSpecificSevereViolations() {
    // const childConfigs = this.getChildConfigs(this.highlightsEventType.value);
    if (this.highlightsEventType.value && this.driverHighlightsData) {
      this.getSubFilteredSevereViolations();
    } else {
      this.getAllDriverFilteredSevereViolations({ ...this.driverHighlightsData });
    }
  }

  private getAllDriverFilteredSevereViolations(data: SevereViolationsData) {
    this.loader = true;
    const modifiedResp = this.modifyResponse(data);
    const modifiedData = Object.keys(modifiedResp).reduce((result, key) => {
      const array = modifiedResp[key];
      result[key] = array.length > 0 ? [array[0]] : [];
      return result;
    }, {});

    timer(100)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.loader = false;
        this.driverSevereViolations = this.homeService.fillModifiedDataToTarget(modifiedData, modifiedResp, 5);
        this.violations(this.driverSevereViolations);
      });
  }

  private getDriverFilteredSevereViolations(eventType: string, data: SevereViolationsData, tag?: boolean) {
    let filteredHighlightsData;
    if (tag) {
      filteredHighlightsData = data
        ? data[this.highlightsEventType.value].filter((element) => element.hasOwnProperty('autoTags') && element.autoTags.includes(tag))
        : [];
    } else {
      filteredHighlightsData = data && eventType in data ? data[eventType] : [];
    }
    const filteredDriverHighlightsData = filteredHighlightsData;

    this.loader = true;
    const FilteredData = { [eventType]: filteredDriverHighlightsData };
    timer(100)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.loader = false;
        this.driverSevereViolations = FilteredData;
        this.violations(this.driverSevereViolations);
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

    const childConfigs = this.getChildConfigs(this.highlightsEventType.value);
    const filterbySpeedSigntags = Object.keys(speedSignTag).includes(subEvent);
    if (subEvent && childConfigs.length && subEvent !== childConfigs[0].key) {
      this.getDriverFilteredSevereViolations(subEvent, this.driverHighlightsData, filterbySpeedSigntags);
    } else {
      this.getDriverFilteredSevereViolations(this.highlightsEventType.value, this.driverHighlightsData, filterbySpeedSigntags);
    }
  }
}
