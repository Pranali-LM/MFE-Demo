import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
import { getSideNavigationConfigState, State } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize, delay } from 'rxjs/operators';

@Component({
  selector: 'app-incident-hightlights',
  templateUrl: './incident-hightlights.component.html',
  styleUrls: ['./incident-hightlights.component.scss'],
})
export class IncidentHightlightsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;
  @ViewChild('incidentHighlights', { static: true }) public incidentHighlights: ElementRef;

  @Input()
  public loader = true;
  @Input()
  set violations(violations) {
    this.videoList = Object.entries(violations || {})
      .reduce((acc, [key, value = []]: any) => {
        const events = value.map((e) => ({
          eventTypeLabel: EVENTS_CONFIG[key].label,
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
  @Input() public driverName: string = '';

  @Output() public playIncident = new EventEmitter<any>();

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
  public selectedCoachableEvent = 0;

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
    private driverManagementService: DriverManagementService
  ) {}

  public ngOnInit() {
    this.driverManagementService.getDataObservable().subscribe((data) => {
      this.selectedCoachableEvent = data;
    });

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

        this.videoListDataSource = new MatTableDataSource<any>(this.videoList);
        // connect datasource and pagination
        this.videoListDataSource.paginator = this.paginator;
        this.videoListObservable = this.videoListDataSource.connect();
        this.checkCarouselConfiguration();
        this.paginator.firstPage();
      } else {
        this.videoListDataSource = new MatTableDataSource<any>([]);
        // connect datasource and pagination
        this.videoListDataSource.paginator = this.paginator;
        this.videoListObservable = this.videoListDataSource.connect();
        this.checkCarouselConfiguration();
        this.paginator.firstPage();
      }
    }

    if (changes.loader && changes.loader.currentValue) {
      this.paginator.pageIndex = 0;
    }
  }

  public ngAfterViewInit() {
    this.checkCarouselConfiguration();
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.driverHighlightsTablePageChange(event);
    });
  }

  public checkCarouselConfiguration() {
    this.carouselContainerWidth = this.incidentHighlights.nativeElement.offsetWidth;
    this.calculateSlidesToShowOnScreen();
    this.cdRef.detectChanges();
    this.dummyVideoList = new Array(this.pageSize).fill(undefined);
  }

  public ngOnDestroy() {
    this.unsubscribeRace.next();
    this.unsubscribeRace.complete();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.unsubscribeOnDestroy.next();
    this.unsubscribeOnDestroy.complete();
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

  public pageEvent(event: any) {
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

  public onPlayIncident(event: any = {}, index: number) {
    const details = {
      eventDetails: event,
      index: index,
    };
    this.selectedCoachableEvent = index;
    this.playIncident.emit(details);
  }
}
