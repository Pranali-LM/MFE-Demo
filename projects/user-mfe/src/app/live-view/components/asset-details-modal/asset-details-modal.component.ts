import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LiveViewService } from '@app-live-view/services/live-view/live-view.service';
import { MatPaginator } from '@angular/material/paginator';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { GetTripDetailsParams } from '@app-trip-details/common/trip-details.model';
import { Subject } from 'rxjs';
import { LiveDevice } from '@app-core/models/core.model';
import { DataService } from '@app-core/services/data/data.service';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
import { TRIP_DETAILS_EVENT_LIST_PAGE_SIZE } from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';

@Component({
  selector: 'app-asset-details-modal',
  templateUrl: './asset-details-modal.component.html',
  styleUrls: ['./asset-details-modal.component.scss'],
})
export class AssetDetailsModalComponent implements OnInit, OnChanges {
  @ViewChild('paginator') public paginator: MatPaginator;

  @Input() public assetDetails: LiveDevice = {} as LiveDevice;

  @Output() public openLiveStream = new EventEmitter<any>();

  public eventListDataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['eventName', 'actions'];
  public loader = false;
  public totalEventCount: number = 0;
  public tablePageSize: number = TRIP_DETAILS_EVENT_LIST_PAGE_SIZE;
  public tripDetails;
  public eventsConfig;
  public direction: string = 'North';
  public defaultTabIndex: number = 0;

  private eventList = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private customerName = '';

  constructor(
    private liveViewService: LiveViewService,
    private tripDetailsService: TripDetailsService,
    public dataService: DataService,
    private dialog: MatDialog,
    private accessService: AccessService
  ) {}

  ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
    ({ customerName: this.customerName = '' } = this.accessService.getLoginInfo() || {});
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.assetDetails && changes.assetDetails.currentValue) {
      this.defaultTabIndex = 0;
      this.direction = this.calculateBearing(this.assetDetails?.gpsData?.bearing);
      this.getEventsList();
    }
  }

  public navigateToLiveStream() {
    this.openLiveStream.emit(this.assetDetails);
  }

  public navigateToTripDetails() {
    this.liveViewService.navigateToTripDetailsPage(this.assetDetails as any, 'table');
  }

  private getEventsList() {
    const { tripId, driverId } = this.assetDetails;
    const params = new GetTripDetailsParams({
      tripId,
      driverId,
      includeViolations: true,
      includePathInfo: false,
      includeCustomEvents: true,
      includeTripConfig: false,
      excludeChallengeAcceptedViolations: true,
    });
    this.loader = true;
    this.eventListDataSource.data = new Array(10).fill(undefined);
    this.tripDetailsService
      .getTripDetails(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.tripDetails = res;
          const externalEventsList = (this.tripDetails.customEvents || []).map((event) => {
            const { eventVideoFile = '' } = event;
            const eventMediaType = eventVideoFile.indexOf('.mp4') > -1 ? 'video' : 'image';
            return {
              ...event,
              isExternalEvent: true,
              eventMediaType,
              eventTypeLabel: this.tripDetailsService.getCustomEventLabel(event, this.customerName),
              showLoader: false,
            };
          });
          this.eventList = [...this.tripDetails.violations, ...externalEventsList];
          this.eventList = this.eventList.map((event) => {
            event.driverId = res.driverId;
            event.tripId = res.tripId;
            return event;
          });
          this.totalEventCount = this.eventList.length;
          this.assignDataSource();
        },
        () => {
          this.loader = false;
        }
      );
  }

  public openIncidentModal(positionIndex: number) {
    const start = this.paginator.pageIndex * this.tablePageSize;
    const end = start + this.tablePageSize;
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(
      this.eventList.slice(start, end),
      positionIndex,
      this.tablePageSize
    );
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(positionIndex, this.tablePageSize);

    const eventDetails = {
      allEvents: filteredDataForPagination,
      currentIndex: filteredDataPaginationIndex,
      isTripDetails: true,
    };
    this.showMedia(eventDetails);
  }

  private calculateBearing(bearing) {
    if (bearing === 0 || bearing === 360) {
      return 'North';
    } else if (bearing > 0 && bearing < 90) {
      return 'North East';
    } else if (bearing === 90) {
      return 'East';
    } else if (bearing > 90 && bearing < 180) {
      return 'South East';
    } else if (bearing === 180) {
      return 'South';
    } else if (bearing > 180 && bearing < 270) {
      return 'South West';
    } else if (bearing === 270) {
      return 'West';
    } else if (bearing > 270 && bearing < 360) {
      return 'North West';
    }
  }

  public showMedia(event: any = {}) {
    const { currentIndex = 0, allEvents = [] } = event || {};
    const { driverId = '', fleetId = '', tripId = '' } = this.tripDetails || {};
    const allTripEvents = allEvents.map((x: any, idx: number) => {
      return {
        ...x,
        showCoachingCompleted: false,
        fleetId,
        driverId,
        tripId,
        positionIndex: idx,
      };
    });

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: 'TripDetails',
        allEvents: allTripEvents,
        currentIndex,
        isTripDetails: true,
      },
    });
  }

  private assignDataSource() {
    this.eventListDataSource.data = this.eventList;
    this.eventListDataSource.paginator = this.paginator;
  }
}
