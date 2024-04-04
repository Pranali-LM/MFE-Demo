import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DataService } from '@app-core/services/data/data.service';
import { ATTRIBUTE_TABLE_COLUMN } from '@app-asset-config/constants/tagging.constants';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { TagConfirmationModalComponent } from '../tag-confirmation-modal/tag-confirmation-modal.component';
import { getCurrentAccessDetailsState } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { State } from '@app-shared/reducers';

@Component({
  selector: 'app-attribute-table',
  templateUrl: './attribute-table.component.html',
  styleUrls: ['./attribute-table.component.scss'],
})
export class AttributeTableComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('paginator', { static: true }) public paginator: MatPaginator;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() attributeList;
  @Input() loader = true;
  @Input() totalCount;

  @Output() public editAttributeName = new EventEmitter<any>();
  @Output() public deleteAttribute = new EventEmitter<any>();
  @Output() public deactivateAttribute = new EventEmitter<any>();
  @Output() private pageChange = new EventEmitter<PageEvent>();
  @Output() private getAttributes = new EventEmitter();

  public attributeListDataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ATTRIBUTE_TABLE_COLUMN;
  public tablePageSize = 10;
  public deactivateAttributeLoader = false;
  public deleteAttributeLoader = false;
  public hasUpdatePermission: boolean = false;

  constructor(
    public dataService: DataService,
    private taggingService: TaggingService,
    private snackbarService: SnackBarService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private store: Store<State>
  ) {}

  ngOnInit() {
    if (this.loader) {
      this.attributeListDataSource.data = new Array(10).fill(undefined);
    }
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

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public editAttribute(attribute) {
    this.editAttributeName.emit(attribute);
  }

  public delete(attribute) {
    this.taggingService
      .deleteAttributes(attribute?.attributeId)
      .pipe(
        finalize(() => {
          this.deleteAttributeLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('AttributeTableComponentDeleteSuccess'));
          this.getAttributes.emit();
        },
        () => {
          this.snackbarService.failure(this.translate.instant('AttributeTableComponentDeleteFailed'));
        }
      );
  }

  public deactivateAttr1(attribute, status) {
    const details = {
      attribute: attribute,
      status: status,
    };
    this.deactivateAttribute.emit(details);
  }

  public deactivateAttr(attribute, status) {
    this.deactivateAttributeLoader = true;
    const body = {
      status: status,
    };

    this.taggingService
      .deactivateAttributes(body, attribute?.attributeId)
      .pipe(
        finalize(() => {
          this.deactivateAttributeLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('AttributeTableComponentUpdateSuccess'));
          this.getAttributes.emit();
        },
        () => {
          this.snackbarService.failure(this.translate.instant('AttributeTableComponentUpdateFailed'));
        }
      );
  }

  public openConfirmationDialog(attribute, action: string) {
    this.dialog.closeAll();
    let disableDelete = false;
    if (action === 'DELETE') {
      disableDelete = attribute.tags?.length || attribute.roles?.length ? true : false;
    }
    const dialogRef = this.dialog.open(TagConfirmationModalComponent, {
      width: '480px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
      data: {
        type: 'ATTRIBUTE',
        action,
        isDisable: disableDelete,
      },
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value === true && action === 'DELETE') {
        this.delete(attribute);
      }
      if (value === true && (action === 'INACTIVE' || action === 'ACTIVE')) {
        this.deactivateAttr(attribute, action);
      }
    });
  }
}
