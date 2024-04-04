import { Component, ViewChild, AfterViewInit, OnDestroy, Input, SimpleChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ManageAction } from '../tagging/tagging.component';
import { DataService } from '@app-core/services/data/data.service';
import { getCurrentAccessDetailsState } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { State } from '@app-shared/reducers';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss'],
})
export class EntityTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() public attributeList;
  @Input() private fleetId;

  public entityListDataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['entityName', 'attributeNames', 'actions'];
  public tablePageSize = 10;
  public loader = true;
  public entityDetailsList = [];
  public totalCount = 0;
  public skip = 0;
  public ManageAction = ManageAction;

  private perPagelimit = 10;
  public hasUpdatePermission: boolean = false;

  constructor(
    public dialog: MatDialog,
    public taggingService: TaggingService,
    private router: Router,
    public dataService: DataService,
    private store: Store<State>
  ) {}

  ngOnInit() {
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
      this.onEntityListPageChange(event);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.fleetId && changes.fleetId.currentValue) {
      this.getEntityDetailsList();
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getEntityDetailsList() {
    this.loader = true;
    this.entityListDataSource.data = new Array(10).fill(undefined);
    const params = {
      fleetId: this.fleetId,
      limit: this.perPagelimit,
      offset: this.skip,
    };
    this.taggingService
      .getEntityDetails(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.entityDetailsList = res?.data;
          this.entityListDataSource.data = this.entityDetailsList;
          this.totalCount = res?.totalEntities;
        },
        () => {
          this.entityListDataSource.data = [];
        }
      ),
      () => {
        this.entityListDataSource.data = [];
      };
  }

  public onEntityListPageChange(event: PageEvent) {
    this.skip = event.pageIndex * this.perPagelimit;
    this.getEntityDetailsList();
  }

  public onRefreshEntity() {
    this.getEntityDetailsList();
  }

  public assignAttributes(event, action: string) {
    this.taggingService.entityDetails = event || '';
    this.router.navigate(['/configurations/assign-attributes'], {
      queryParams: {
        action: action,
        entityName: event.entityName,
        isAccess: event.isAccess,
      },
    });
  }
}
