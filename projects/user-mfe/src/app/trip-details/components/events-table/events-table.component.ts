import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

import { AccessService } from '@app-core/services/access/access.service';

import { MatTableDataSource } from '@angular/material/table';
import { BREAKPOINTS_LANDSCAPE, DEFAULT_TRIP_VIEW, TRIP_DETAILS_EVENT_LIST_PAGE_SIZE } from '@app-core/constants/constants';
import { TripDetailsViewType } from '@app-core/models/access.model';
import { GoogleTagManagerService, ToggleState } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { TRIP_EVENTS_TABLE_COLUMNS } from '@app-trip-details/common/trip-details.constants';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@app-core/services/data/data.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-events-table',
  templateUrl: './events-table.component.html',
  styleUrls: ['./events-table.component.scss'],
})
export class EventsTableComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('paginator')
  public paginator: MatPaginator;
  @Input()
  public eventsList;
  @Input()
  public dvrEnabled;
  @Input()
  public currentTimeZone: string;
  @Output()
  private incidentButtonClick = new EventEmitter();
  @Output()
  private requestEdvrClick = new EventEmitter();
  @Output()
  private changeSeverityCategory = new EventEmitter<string>();

  public tripEventsList: MatTableDataSource<any> = new MatTableDataSource([]);
  public tripEventsTableColumns = TRIP_EVENTS_TABLE_COLUMNS;
  public selectedSeverity = 'all';
  public toggleButtonTitle = null;
  public viewType = DEFAULT_TRIP_VIEW;
  public translateVal = 0;
  public edvrLoader = false;
  public currentTheme = 'light';
  public PageSize: number;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private accessService: AccessService,
    private gtmService: GoogleTagManagerService,
    public translate: TranslateService,
    private dataService: DataService,
    private breakpointObserver: BreakpointObserver
  ) {}

  public ngOnInit() {
    this.breakpointObserver.observe(BREAKPOINTS_LANDSCAPE).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.PageSize = 4;
      } else {
        this.PageSize = 10;
      }
    });
    this.translate.stream('evenetTabaleTooltip').subscribe((text: string) => {
      this.tableTooltip(text);
    });

    this.dataService._currentTheme.subscribe((val) => {
      if (val) {
        this.currentTheme = val;
      }
    });
  }

  public tableTooltip(text) {
    this.viewType = this.accessService.tripDetailsViewType;
    this.toggleButtonTitle = this.viewType === 'table' ? text.eventsTableCollapseTable : text.eventsTableExpandTable;
    this.translateVal = this.viewType === 'table' ? 0 : 400;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.eventsList) {
      this.eventsList = this.eventsList
        .map((event: any) => {
          const { edvrRequests = [{}] } = event;
          const {
            status: latestEdvrStatus = '',
            eventVideoFile: latestEdvrVideoFile = '',
            videoResolution = '',
            mediaFiles = [],
          } = edvrRequests[edvrRequests.length - 1];
          switch (latestEdvrStatus) {
            case 'STARTED':
            case 'ACKNOWLEDGED':
            case 'PENDING':
              return {
                ...event,
                edvrStatus: latestEdvrStatus,
                edvrStatusClass: 'pending',
                edvrDisplayTitle: event?.isEventVideoRatelimited
                  ? this.translate.instant('eventsTableVideoRequestPending')
                  : this.translate.instant('eventsTableHDVideoPending'),
              };

            case 'CANCELED':
            case 'UNAVAILABLE':
            case 'FAILED':
              return {
                ...event,
                edvrStatus: latestEdvrStatus,
                edvrStatusClass: 'failed',
                edvrDisplayTitle: event?.isEventVideoRatelimited
                  ? this.translate.instant('eventsTableVideoRequestFailed')
                  : this.translate.instant('eventsTableHDVideoFailed'),
              };

            case 'FINISHED':
              const edvrVideoHeight = videoResolution && videoResolution.split('x')[1];
              return {
                ...event,
                eventVideoFilename: latestEdvrVideoFile,
                edvrStatus: latestEdvrStatus,
                edvrStatusClass: 'finished',
                edvrDisplayTitle: event?.isEventVideoRatelimited
                  ? this.translate.instant('eventsTableVideoRequestFinished')
                  : this.translate.instant('eventsTableHDVideoFinished'),
                videoDetails: {
                  ...event.videoDetails,
                  videoHeight: edvrVideoHeight,
                },
                edvrMediaFiles: mediaFiles,
              };

            default:
              return {
                ...event,
                edvrStatus: 'NOT_REQUESTED',
                edvrDisplayTitle: event?.isEventVideoRatelimited? this.translate.instant('eventsTableRequestVideo') : this.translate.instant('eventsTableRequestHDVideo'),
              };
          }
        })
        .filter((event: any) => !event.reportBug);
      this.assignDataSource();
    }
  }

  public ngAfterViewInit() {
    this.assignDataSource();
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.tripDetailsTablePageChange(event);
    });
  }

  public assignDataSource() {
    this.tripEventsList.data = this.eventsList;
    this.tripEventsList.paginator = this.paginator;
  }

  public showMedia(positionIndex?: any) {
    // modifying data for show only viewable pages
    const start = this.paginator.pageIndex * TRIP_DETAILS_EVENT_LIST_PAGE_SIZE;
    const end = start + TRIP_DETAILS_EVENT_LIST_PAGE_SIZE;
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(
      this.eventsList.slice(start, end),
      positionIndex,
      TRIP_DETAILS_EVENT_LIST_PAGE_SIZE
    );
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(positionIndex, TRIP_DETAILS_EVENT_LIST_PAGE_SIZE);

    this.incidentButtonClick.emit({
      allEvents: filteredDataForPagination,
      currentIndex: filteredDataPaginationIndex,
      isTripDetails: true,
    });
  }

  public requestEDVR(event, index?: any) {
    if (event.edvrStatus !== 'NOT_REQUESTED') {
      return;
    }
    event.showLoader = true;
    this.requestEdvrClick.emit({
      ...event,
      currentIndex: index,
    });
  }

  public filterEventsTables(severityType: string) {
    this.selectedSeverity = severityType;
    this.changeSeverityCategory.emit(severityType);
  }

  public toggleTable() {
    const newViewType = this.viewType === TripDetailsViewType.map ? TripDetailsViewType.table : TripDetailsViewType.map;
    this.viewType = newViewType;
    this.toggleButtonTitle =
      this.viewType === 'table' ? this.translate.instant('eventsTableCollapseTable') : this.translate.instant('eventsTableExpandTable');
    this.translateVal = this.viewType === 'table' ? 0 : 400;
    this.accessService.tripDetailsViewType = newViewType;
    this.gtmService.toggleEventsTable(newViewType === TripDetailsViewType.table ? ToggleState.show : ToggleState.hide);
  }
}
