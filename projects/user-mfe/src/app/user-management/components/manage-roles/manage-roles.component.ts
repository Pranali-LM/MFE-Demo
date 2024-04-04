import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MANAGE_ROLES_TABLE_COLUMNS } from '@app-core/constants/constants';
import { Subject } from 'rxjs';
import { RoleHierarchyComponent } from '../role-hierarchy/role-hierarchy.component';
import { UserRoleManageService } from '@app-user-management/service/user-role-manage.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { DataService } from '@app-core/services/data/data.service';
import { ListUserRolesParams, UpdateUserRoleStatusReqBody, UserRole, UserRoleStatus } from '@app-user-management/models/user-roles.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { AccessService } from '@app-core/services/access/access.service';
import { LoginFleetInfo } from '@app-core/models/core.model';

export enum ManageRoleAction {
  View = 'view',
  Add = 'add',
  Edit = 'edit',
  Duplicate = 'duplicate',
}

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss'],
})
export class ManageRolesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('paginator', { static: false })
  public paginator: MatPaginator;

  public loader = false;
  public tableColumns = MANAGE_ROLES_TABLE_COLUMNS;
  public dataSource = new MatTableDataSource<UserRole>([]);
  public searchInput = new FormControl('');
  public totalRoles = 0;
  public pageSize = 10;
  public userRoleStatusEnum = UserRoleStatus;
  public ManageRoleAction = ManageRoleAction;
  public currentFleetInfo: LoginFleetInfo;

  private attributeIds = [];
  private skip = 0;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private userRoleService: UserRoleManageService,
    public dataService: DataService,
    private gtmService: GoogleTagManagerService,
    private accessService: AccessService
  ) {}

  ngOnInit(): void {
    const userInfo = this.accessService.getLoginInfo();
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.getData();
        this.currentFleetInfo = userInfo.fleets.filter((fl) => fl.fleetId === value)[0];
      }
    });
  }

  ngAfterViewInit(): void {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.skip = event.pageIndex * this.pageSize;
      this.getRolesList();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getData() {
    this.getRolesList();
  }

  private getRolesList() {
    this.loader = true;
    this.dataSource.data = new Array(this.pageSize).fill(undefined);
    const params = new ListUserRolesParams({
      limit: this.pageSize,
      offset: this.skip,
      search: this.searchInput.value,
      attributeIds: this.attributeIds,
    });
    this.userRoleService
      .getRolesList(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.dataSource.data = res?.data || [];
          this.totalRoles = res?.totalRoles;
        },
        () => {
          this.dataSource.data = [];
          this.totalRoles = 0;
        }
      );
  }

  public navigateToEditRole(action: ManageRoleAction, role?: UserRole) {
    if (action === ManageRoleAction.Add) {
      this.gtmService.gotoAddRoleFromManageRoles();
    }
    if (action === ManageRoleAction.Edit) {
      this.gtmService.gotoEditRoleFromManageRoles();
    }
    if (action === ManageRoleAction.Duplicate) {
      this.gtmService.gotoDuplicateRoleFromManageRoles();
    }
    this.userRoleService.roleDeatils = role;
    this.router.navigate(['/user-management/edit-role'], {
      queryParams: {
        action: action,
        roleId: role?.roleId,
      },
    });
  }

  public viewHierarchy() {
    this.gtmService.viewHierarchy('Manage Roles');
    this.dialog.open(RoleHierarchyComponent, {
      position: { top: '24px' },
      width: '640px',
      minHeight: '480px',
      autoFocus: false,
    });
  }

  public clearInput() {
    this.skip = 0;
    this.searchInput.setValue('');
    this.getRolesList();
  }

  public onSearch() {
    this.gtmService.searchRoles(this.searchInput.value);
    this.skip = 0;
    this.paginator.pageIndex = 0;
    this.getRolesList();
  }

  public doRefresh() {
    this.skip = 0;
    this.paginator.pageIndex = 0;
    this.searchInput.setValue('');
    this.userRoleService.isRefresh = true;
    this.getData();
  }

  public onUpdateStatus(role: UserRole) {
    const newStatus = role.status === UserRoleStatus.Active ? UserRoleStatus.Inactive : UserRoleStatus.Active;
    const body = new UpdateUserRoleStatusReqBody(newStatus);
    return () => {
      return this.userRoleService.updateRole(role.roleId, body);
    };
  }

  private deleteUser(role: UserRole) {
    return () => {
      return this.userRoleService.deleteRole(role.roleId);
    };
  }

  public openConfirmationDialog(role: UserRole, action: string) {
    this.dialog.closeAll();
    let apiMethod;
    if (action === 'DELETE') {
      apiMethod = this.deleteUser(role);
    }
    if (action === 'DEACTIVATE' || action === 'ACTIVATE') {
      apiMethod = this.onUpdateStatus(role);
    }
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '480px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
      data: {
        type: 'ROLE',
        action,
        apiMethod,
        userCount: role.userCount,
      },
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value && ['DELETE', 'DEACTIVATE', 'ACTIVATE'].includes(action)) {
        this.getRolesList();
      }
    });
  }
}
