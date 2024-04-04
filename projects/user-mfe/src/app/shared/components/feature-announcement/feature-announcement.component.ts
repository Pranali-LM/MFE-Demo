import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FEATURE_ANNOUNCEMENT_LIST, PORTAL_RELEASE_VERSION } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feature-announcement',
  templateUrl: './feature-announcement.component.html',
  styleUrls: ['./feature-announcement.component.scss'],
})
export class FeatureAnnouncementComponent implements OnInit, AfterViewInit {
  @ViewChild('featureAnnouncement')
  public featureAnnouncement: ElementRef;
  public carouselContainerWidth = 0;
  public totalCardsInDisplay = 1;
  public showCarouselControls = true;
  public startPoint = 1;
  public endPoint = 1;
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;
  public featureListObservable: Observable<any>;
  public portalReleaseVersion = PORTAL_RELEASE_VERSION;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef, public dataService: DataService, private gtmService: GoogleTagManagerService) {}

  public ngOnInit() {
    const featureListDataSource = new MatTableDataSource<any>(FEATURE_ANNOUNCEMENT_LIST);
    // connect datasource and pagination
    featureListDataSource.paginator = this.paginator;
    this.featureListObservable = featureListDataSource.connect();
    this.paginator.pageIndex = 0;
  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.changeFeatureAnnouncementPageChange(event);
    });
  }
}
