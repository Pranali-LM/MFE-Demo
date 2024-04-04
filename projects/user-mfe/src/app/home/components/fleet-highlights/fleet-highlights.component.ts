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

import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { finalize, takeUntil, delay } from 'rxjs/operators';

import { CONFIGS_WITH_SUBCONFIGS, EVENTS_CONFIG } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
import { Router } from '@angular/router';
import { AccessService } from '@app-core/services/access/access.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { getSideNavigationConfigState, State } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CLIENT_CONFIG } from '@config/config';
@Component({
  selector: 'app-fleet-highlights',
  templateUrl: './fleet-highlights.component.html',
  styleUrls: ['./fleet-highlights.component.scss'],
})
export class FleetHighlightsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('fleetHighlights', { static: true }) public fleetHighlights: ElementRef;

  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;

  @Input()
  public loader = false;
  @Input()
  set violations(violations) {
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
  }
  @Input()
  public timezone = '';
  @Input()
  public dateFormat = '';
  public videoList = [];
  public videoListDataSource = new MatTableDataSource<any>([]);
  public dummyVideoList = [];

  public carouselContainerWidth = 0;
  public carouselCardWidth = 0;
  public pageSize = 5;
  public clientConfig = CLIENT_CONFIG;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private unsubscribeOnDestroy: Subject<void> = new Subject<void>();
  public videoListObservable: Observable<any>;

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private gtmService: GoogleTagManagerService,
    private router: Router,
    private accessService: AccessService,
    private snackbarService: SnackBarService,
    private store: Store<State>,
    public translate: TranslateService
  ) {}

  public ngOnInit() {
    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.unsubscribeOnDestroy), delay(500))
      .subscribe(() => {
        this.checkCarouselConfiguration();
      });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.violations) {
      this.calculateSlidesToShowOnScreen();
      if (this.videoList.length) {
        this.videoList = this.videoList.map((x, index) => {
          return { ...x, positionIndex: index };
        });

        this.videoListDataSource = new MatTableDataSource(this.videoList);
        // connect datasource and pagination
        this.videoListDataSource.paginator = this.paginator;
        this.videoListObservable = this.videoListDataSource.connect();
        this.checkCarouselConfiguration();
        this.paginator.firstPage();
      } else {
        this.videoListDataSource = new MatTableDataSource([]);
        this.videoListDataSource.paginator = this.paginator;
        this.videoListObservable = this.videoListDataSource.connect();
        this.paginator.firstPage();
      }
    }

    if (changes.loader && changes.loader.currentValue) {
      this.paginator.firstPage();
    }
  }

  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.fleetHighlightsPageChange(event);
    });
    this.checkCarouselConfiguration();
  }

  public checkCarouselConfiguration() {
    this.carouselContainerWidth = this.fleetHighlights.nativeElement.offsetWidth;
    this.calculateSlidesToShowOnScreen();
    this.dummyVideoList = new Array(this.pageSize).fill(undefined);
    this.cdRef.detectChanges();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.videoListDataSource.disconnect();

    this.unsubscribeOnDestroy.next();
    this.unsubscribeOnDestroy.complete();
  }

  public showMedia(event: any = {}) {
    // modifying data for show only viewable pages
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(this.videoList, event.positionIndex, this.pageSize);
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(event.positionIndex, this.pageSize);

    this.gtmService.viewFleetHighlightsVideo(event.eventTypeLabel);
    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: 'Fleet',
        allEvents: filteredDataForPagination,
        currentIndex: filteredDataPaginationIndex,
      },
    });
  }

  public calculateSlidesToShowOnScreen() {
    const { carouselCardWidth, totalCardsInDisplay } = this.dataService.getCarouselConfiguration(this.carouselContainerWidth);
    this.carouselCardWidth = carouselCardWidth - (24 - 24 / totalCardsInDisplay);
    this.pageSize = totalCardsInDisplay;
  }

  public pageEvent(event: any) {
    if (event) {
      this.loader = true;

      setTimeout(() => {
        this.loader = false;
      }, 500);
    }
  }

  public coachIncident(incidentDetails: any) {
    this.gtmService.coachinginFleetIncidentList(incidentDetails.eventTypeLabel, incidentDetails.asset.assetId);
    this.updateIncident(incidentDetails, 'COACHING');
  }

  public discardIncident(incidentDetails: any) {
    this.gtmService.discardIncidentInFleetIncidentList(incidentDetails.eventTypeLabel, incidentDetails.asset.assetId);
    this.updateIncident(incidentDetails, 'REPORT_BUG');
  }

  public viewTripDetails(incident: any) {
    this.gtmService.gotoTripDetailsFromFleetIncidentsList(incident.eventTypeLabel, incident.asset.assetId);
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
}
