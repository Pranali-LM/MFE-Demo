import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CHALLENEGE_LIST_PAGE_SIZE, EVENT_TAG_LIST } from '@app-core/constants/constants';
import { CHALLENGE_INCIDENTS_TABLE_COLUMNS } from '@app-driver-management/common/driver-management.constants';
import { Subject } from 'rxjs';
import { IncidentModalComponent } from '../incident-modal/incident-modal.component';
import { DataService } from '@app-core/services/data/data.service';
import { takeUntil } from 'rxjs/operators';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-challenged-incidents',
  templateUrl: './challenged-incidents.component.html',
  styleUrls: ['./challenged-incidents.component.scss'],
})
export class ChallengedIncidentsComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input()
  public timezone: string;
  @Input()
  public dateFormat: string;
  @Input()
  public showDriverColumn = false;
  @Input()
  public challengeList: any[];
  @Input()
  public loader: boolean;
  @ViewChild('paginator')
  public paginator: MatPaginator;
  @Input()
  public videoType: string;

  public eventTagList = [
    {
      value: '',
      text: 'All tags',
    },
    ...EVENT_TAG_LIST,
  ];
  public tableColumns = CHALLENGE_INCIDENTS_TABLE_COLUMNS;
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
    this.tableColumns = CHALLENGE_INCIDENTS_TABLE_COLUMNS;
    this.tableColumns = this.showDriverColumn ? this.tableColumns : this.tableColumns.filter((x) => x !== 'driverName');

    if (changes.loader && this.loader) {
      this.tableSource.data = new Array(5).fill(undefined);
      this.tableSource.paginator = this.paginator;
    } else if (this.challengeList.length) {
      this.tableSource.data = this.challengeList;
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
    // modifying data for show only viewable pages
    const filteredDataForPagination = this.dataService.modifyDataBasedOnPageSize(
      this.challengeList,
      positionIndex,
      CHALLENEGE_LIST_PAGE_SIZE
    );
    const filteredDataPaginationIndex = this.dataService.modifyPageIndexBasedOnPageSize(positionIndex, CHALLENEGE_LIST_PAGE_SIZE);

    this.gtmService.viewRequestedVideoFromChallangeTable(eventTypeLabel);

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: 'Challenge',
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
    this.gtmService.gotoTripDetailsFromChallangeTable(event?.eventTypeLabel);
  }
  public ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.challangeDriverTablePageChange(event);
    });
  }
}
