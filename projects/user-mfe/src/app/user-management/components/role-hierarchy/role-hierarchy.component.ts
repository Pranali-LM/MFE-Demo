import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserRoleHierarchy } from '@app-user-management/models/user-roles.model';
import { UserRoleManageService } from '@app-user-management/service/user-role-manage.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-role-hierarchy',
  templateUrl: './role-hierarchy.component.html',
  styleUrls: ['./role-hierarchy.component.scss'],
})
export class RoleHierarchyComponent implements OnInit, AfterViewInit {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('paginator', { static: false })
  private paginator: MatPaginator;

  public loader = false;
  public tableColumns = ['level', 'roles'];
  public dataSource = new MatTableDataSource<UserRoleHierarchy>([]);
  public totalCount = 0;
  public pageSize = 5;

  constructor(private userRoleService: UserRoleManageService) {}

  ngOnInit(): void {
    this.getRoleHierarchy();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private getRoleHierarchy() {
    this.loader = true;
    this.dataSource.data = new Array(this.pageSize).fill(undefined);

    this.userRoleService
      .getRoleHierarchy()
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.dataSource.data = res.data;
          this.totalCount = res.totalRoles;
        },
        () => {
          this.dataSource.data = [];
          this.totalCount = 0;
        }
      );
  }
}
