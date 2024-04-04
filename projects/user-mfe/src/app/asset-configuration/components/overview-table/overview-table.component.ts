import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ENTITIES } from '@app-core/constants/constants';
import { TagsOnboardingComponent } from '../tags-onboarding/tags-onboarding.component';
import { OVERVIEW_TABLE_COLUMN } from '@app-asset-config/constants/tagging.constants';

@Component({
  selector: 'app-overview-table',
  templateUrl: './overview-table.component.html',
  styleUrls: ['./overview-table.component.scss'],
})
export class OverviewTableComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() attributeList: any;
  @Input() loader = true;
  @Input() totalCount: any;
  @Input() noOverviewDetailsFound: any;

  // @Output() public editOverview = new EventEmitter<any>();
  @Output() private pageChange = new EventEmitter<PageEvent>();

  public attributeListDataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = OVERVIEW_TABLE_COLUMN;
  public tablePageSize = 10;
  public smEntities = ENTITIES;

  constructor(private dialog: MatDialog, public dataService: DataService) {}

  ngOnInit() {
    if (this.loader) {
      this.attributeListDataSource.data = new Array(10).fill(undefined);
    }
  }

  ngAfterViewInit() {
    this.paginator?.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.pageChange.emit(event);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.loader) {
      this.attributeListDataSource.data = new Array(10).fill(undefined);
    } else {
      this.attributeListDataSource.data = [];
    }
    if (changes.attributeList && changes.attributeList.currentValue) {
      this.attributeListDataSource.data = this.attributeList;
    }
  }

  public openTagsOnboarding() {
    this.dialog.open(TagsOnboardingComponent, {
      width: '720px',
      minHeight: '400px',
      position: {
        top: '24px',
      },
      disableClose: true,
      autoFocus: false,
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
