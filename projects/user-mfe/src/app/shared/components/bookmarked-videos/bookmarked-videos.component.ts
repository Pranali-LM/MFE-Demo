import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
// import { BOOKMARKED_DVR_REQUEST_LIST_TABLE_COLUMNS } from '@app-home/constants/home.constants';
import { BOOKMARKED_DVR_REQUEST_LIST_TABLE_COLUMNS } from '@app-home/constants/home.constants';
import { COACHING_PANEL_PAGE_SIZE, EVENT_TAG_LIST } from '@app-core/constants/constants';
import {
  BOOKMARKED_PANIC_BUTTON_TABLE_COLUMNS,
  BOOKMARKED_VIDEOS_TABLE_COLUMNS,
} from '@app-driver-management/common/driver-management.constants';
import { Subject } from 'rxjs';
import { IncidentModalComponent } from '../incident-modal/incident-modal.component';
import { DataService } from '@app-core/services/data/data.service';
import { takeUntil } from 'rxjs/operators';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-bookmarked-videos',
  templateUrl: './bookmarked-videos.component.html',
  styleUrls: ['./bookmarked-videos.component.scss'],
})
export class BookmarkedVideosComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input()
  public timezone: string;
  @Input()
  public source: string;
  @Input()
  public dateFormat: string;
  @Input()
  public showDriverColumn = false;
  @Input()
  public bookmarkList: any[];
  @Input()
  public loader: boolean;
  @Input()
  public videoType: string;
  @ViewChild('paginator')
  public paginator: MatPaginator;

  public eventTagList = [
    {
      value: '',
      text: 'All tags',
    },
    ...EVENT_TAG_LIST,
  ];
  public tableColumns = BOOKMARKED_VIDEOS_TABLE_COLUMNS;
  public tableSource: MatTableDataSource<any> = new MatTableDataSource([]);
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public selectedTagType = new FormControl('');

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    public dataService: DataService,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (this.videoType === 'dvr') {
      this.tableColumns = BOOKMARKED_DVR_REQUEST_LIST_TABLE_COLUMNS;
    } else if (this.videoType === 'externalEvents') {
      this.tableColumns = BOOKMARKED_PANIC_BUTTON_TABLE_COLUMNS;
    } else {
      this.tableColumns = BOOKMARKED_VIDEOS_TABLE_COLUMNS;
    }
    this.tableColumns = this.showDriverColumn ? this.tableColumns : this.tableColumns.filter((x) => x !== 'driverName');

    if (changes.loader && this.loader) {
      this.tableSource.data = new Array(5).fill(undefined);
      this.tableSource.paginator = this.paginator;
    } else if (this.bookmarkList.length) {
      this.tableSource.data = this.bookmarkList;
      this.cdRef.detectChanges();
      this.tableSource.paginator = this.paginator;
    } else {
      this.tableSource.data = [];
      this.tableSource.paginator = this.paginator;
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public showMedia(positionIndex?: any, eventTypeLabel?: any) {
    if (this.videoType === 'dvr') {
      this.bookmarkList = this.bookmarkList.map((x, index) => {
        return {
          ...x,
          isDvrEvent: true,
          eventVideoFilename: x.response.link,
          positionIndex: index,
          videoDetails: {
            videoResolution: x.videoResolution,
          },
          eventTypeLabel: x.timelaspeEnabled ? 'Time-lapse Video Request' : 'Video Request',
        };
      });
    }
    if (this.source === 'Driver_Coaching') {
      this.gtmService.viewRequestedVideoFromDriverCoachingPanelTable(eventTypeLabel);
    }
    if (this.source === 'Coaching') {
      this.gtmService.viewRequestedVideoFromCoachingPanelTable(eventTypeLabel);
    }

    // modifying data for show only viewable pages
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(
      this.bookmarkList,
      positionIndex,
      COACHING_PANEL_PAGE_SIZE
    );
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(positionIndex, COACHING_PANEL_PAGE_SIZE);

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: this.source,
        allEvents: filteredDataForPagination,
        currentIndex: filteredDataPaginationIndex,
        showCoachingTab: true,
      },
    });
  }

  public navigateTo(event: any) {
    this.router.navigate(['/trip-details'], {
      queryParams: {
        tripId: event.tripId,
        driverId: event.driverId,
      },
    });
    if (this.source === 'Driver_Coaching') {
      this.gtmService.gotoTripDetailsFromDriverCoachingPannelTable(event?.eventTypeLabel);
    }
    if (this.source === 'Coaching') {
      this.gtmService.gotoTripDetailsFromCoachingTable(event?.eventTypeLabel);
    }
  }
  public ngAfterViewInit() {
    if (this.source === 'Driver_Coaching') {
      this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
        this.gtmService.coachingDriverTablePageChange(event);
      });
    }
    if (this.source === 'Coaching') {
      this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
        this.gtmService.changeCoachingTablePage(event);
      });
    }
  }
}
