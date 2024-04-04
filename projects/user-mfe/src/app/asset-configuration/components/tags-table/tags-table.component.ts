import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';
import { TAGS_TABLE_COLUMN } from '@app-asset-config/constants/tagging.constants';
import { DataService } from '@app-core/services/data/data.service';
import { TagConfirmationModalComponent } from '../tag-confirmation-modal/tag-confirmation-modal.component';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { getCurrentAccessDetailsState } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { State } from '@app-shared/reducers';

export enum ManageTagAction {
  Add = 'add',
  Edit = 'edit',
}

export enum TagStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

@Component({
  selector: 'app-tags-table',
  templateUrl: './tags-table.component.html',
  styleUrls: ['./tags-table.component.scss'],
})
export class TagsTableComponent implements OnInit {
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() private fleetId: string;

  public attributeListDataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = TAGS_TABLE_COLUMN;
  tagSearchCtrl = new FormControl();
  public tablePageSize = 10;
  public tagList = [];
  public totalTagCount = 0;
  public loader = false;
  private perPagelimit = 10;
  private skip = 0;
  public showSpinner = false;
  public ManageTagAction = ManageTagAction;
  public hasUpdatePermission: boolean = false;

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,

    private taggingService: TaggingService,
    private gtmService: GoogleTagManagerService,
    private router: Router,
    private snackbarService: SnackBarService,
    private translate: TranslateService,
    private store: Store<State>
  ) {}

  ngOnInit() {
    this.getTagList();
    this.tagSearchCtrl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        debounceTime(500),
        map((val) => val.trim().toLowerCase()),
        distinctUntilChanged(),
        switchMap((searchString) => this.tagSearch(searchString))
      )
      .subscribe((tagList) => {
        this.tagList = tagList?.value?.userTags;
        this.attributeListDataSource.data = this.tagList;
        this.totalTagCount = tagList?.value?.totalCount;
      });
    this.store
      .select(getCurrentAccessDetailsState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ permissions = [] }) => {
        const updateFleetConfigPermission = 'update:fleet_config';
        this.hasUpdatePermission = permissions.includes(updateFleetConfigPermission);
      });
  }

  ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.skip = event.pageIndex * this.perPagelimit;
      this.getTagList();
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.fleetId && changes.fleetId.currentValue) {
      this.skip = 0;
      this.getTagList();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getTagList() {
    this.loader = true;
    this.attributeListDataSource.data = new Array(10).fill(undefined);
    const params = {
      fleetId: this.fleetId,
      limit: this.perPagelimit,
      offset: this.skip,
    };
    this.taggingService
      .getAllTagList(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.tagList = res?.data;
          this.attributeListDataSource.data = this.tagList;
          this.totalTagCount = res?.totalTags;
        },
        () => {
          this.attributeListDataSource.data = [];
          this.totalTagCount = 0;
        }
      ),
      () => {
        this.attributeListDataSource.data = [];
        this.totalTagCount = 0;
      };
  }

  public addTags(action: string, event?) {
    this.taggingService.tagsDetails = event || '';
    this.router.navigate(['/configurations/add-tags'], {
      queryParams: {
        action: action,
        tagId: event?.rootTagId,
        attributeId: event?.attributeId,
      },
    });
  }

  private tagSearch(searchString): Observable<any> {
    this.gtmService.searchTags(searchString);
    const params = {
      fleetId: this.fleetId,
      limit: this.perPagelimit,
      skip: 0,
    };
    if (searchString) {
      params['search'] = searchString;
    }
    return this.taggingService.getAllTagList(params).pipe(
      tap(() => (this.showSpinner = false)),
      map((res) => {
        return res;
      }),
      catchError(() => {
        this.showSpinner = false;
        return of([]);
      })
    );
  }

  public onRefreshTags() {
    this.skip = 0;
    this.getTagList();
  }

  public openConfirmationDialog(tag, action: string) {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(TagConfirmationModalComponent, {
      width: '480px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
      data: {
        type: 'TAG',
        action,
      },
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value === true && action === 'DELETE') {
        this.deleteTag(tag);
      }
      if (value === true && (action === 'INACTIVE' || action === 'ACTIVE')) {
        this.updateTag(tag);
      }
    });
  }

  private deleteTag(tag) {
    const params = {
      attributeId: tag.attributeId,
    };
    this.taggingService
      .deleteTag(tag.rootTagId, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('TagsTableComponentDeleteTagSuccess'));
          this.getTagList();
        },
        () => {
          this.snackbarService.failure(this.translate.instant('TagsTableComponentDeleteTagFailed'));
        }
      );
  }

  private updateTag(tag) {
    const newStatus = tag.status === TagStatus.Active ? TagStatus.Inactive : TagStatus.Active;
    const body = {
      status: newStatus,
    };
    const params = {
      attributeId: tag.attributeId,
    };

    this.taggingService
      .updateTag(tag.rootTagId, body, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('TagsTableComponentUpdateTagSuccess'));
          this.getTagList();
        },
        () => {
          this.snackbarService.failure(this.translate.instant('TagsTableComponentUpdateTagFailed'));
        }
      );
  }
}
