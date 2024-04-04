import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { USER_MANAGEMENT_TABLE_COLUMNS } from '@app-core/constants/constants';
import { DataService } from '@app-core/services/data/data.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { UserSecurityComponent } from '@app-shared/components/user-security/user-security.component';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { ListUsersParams, UpdateUserStatusReqBody, User, UserStatus } from '@app-user-management/models/users.model';
import { UserManageService } from '@app-user-management/services/user-manage/user-manage.service';
import { LoginFleetInfo, LoginInfo } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';

export enum ManageUserAction {
  Add = 'add',
  Edit = 'edit',
}

@Component({
  selector: 'app-user-list-v2',
  templateUrl: './user-list-v2.component.html',
  styleUrls: ['./user-list-v2.component.scss'],
})
export class UserListV2Component implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('paginator', { static: false })
  public paginator: MatPaginator;

  public userTableColumns = USER_MANAGEMENT_TABLE_COLUMNS;
  public userDataSource = new MatTableDataSource<User>([]);
  public loader = false;
  public totalUsers = 0;
  public searchInput = new FormControl('');
  public pageSize = 10;
  public fleetId: string;
  public sameFleet = '';
  public API: Observable<any>;
  public ManageUserAction = ManageUserAction;
  public UserStatus = UserStatus;
  public userInfo: LoginInfo;
  public currentFleetInfo: LoginFleetInfo;

  private offset = 0;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    public dataService: DataService,
    private snackbarService: SnackBarService,
    public translate: TranslateService,
    private router: Router,
    private gtmService: GoogleTagManagerService,
    private userManageService: UserManageService,
    private accessService: AccessService
  ) {}

  ngOnInit() {
    this.userInfo = this.accessService.getLoginInfo();
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        this.currentFleetInfo = this.userInfo.fleets.filter((fl) => fl.fleetId === value)[0];
        if (this.userInfo.loginType !== 'fleetmanager') {
          this.currentFleetInfo.role.level = 1;
        }
        this.getUsers(true);
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.offset = event.pageIndex * this.pageSize;
      this.getUsers();
    });
  }

  public navigateToEditUser(action: ManageUserAction, user?: User) {
    this.gtmService.gotoEditUserPageFromManageUser();
    this.userManageService.userDeatils = user;
    this.router.navigate(['/user-management/edit-user'], {
      queryParams: {
        action: action,
        userId: user?.userId,
      },
    });
  }

  private getUsers(isRefresh?: boolean) {
    this.loader = true;
    this.userDataSource.data = new Array(this.pageSize).fill({});
    const params = new ListUsersParams({ limit: this.pageSize, offset: this.offset, search: encodeURI(this.searchInput.value) });
    this.userManageService
      .getUserList(params, isRefresh)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          const { totalUsers = 0, data = [] } = res || {};
          this.totalUsers = totalUsers;
          this.userDataSource.data = data;
        },
        () => {
          this.userDataSource.data = [];
        }
      );
  }

  public deleteUser(user: User) {
    this.userManageService
      .deleteUser(user.userId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('userMangementDeleteUserSuccess'));
          this.getUsers(true);
        },
        () => {
          this.snackbarService.failure(this.translate.instant('userMangementFailedToDeleteUser'));
        }
      );
  }

  private deleteUserV2(user: User) {
    return () => {
      return this.userManageService.deleteUser(user.userId);
    };
  }

  public updateUserStatus(user: User) {
    const newStatus = user.status === UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
    const body = new UpdateUserStatusReqBody(newStatus);
    const { userType = '' } = this.accessService.getLoginInfo();
    return () => {
      return this.userManageService.updateUser(user.userId, body, userType);
    };
  }

  public resendTempPassword(user: any) {
    user.resendEmailLoader = true;
    const params = {
      userType: 'fleetmanager',
    };
    this.dataService
      .resendTempPassword(params, user.email)
      .pipe(
        finalize(() => {
          user.resendEmailLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackbarService.success(this.translate.instant('userMangementEmailSentSuccess'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('userMangementFaliedToSendEmail'));
        }
      );
  }

  public onSearch() {
    if (!this.searchInput.value.length) {
      return;
    }
    this.offset = 0;
    this.paginator.pageIndex = 0;
    this.getUsers(true);
  }

  public clearInput() {
    this.offset = 0;
    this.paginator.pageIndex = 0;
    this.searchInput.setValue('');
    this.getUsers(true);
  }

  public openManageSecurity(userDetails: any) {
    this.dialog.closeAll();
    this.dialog.open(UserSecurityComponent, {
      width: '480px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      autoFocus: false,
      disableClose: true,
      data: userDetails,
    });
  }

  public openConfirmationDialog(user: User, action: string) {
    this.dialog.closeAll();
    let apiMethod;
    if (action === 'DELETE') {
      apiMethod = this.deleteUserV2(user);
    }
    if (action === 'DEACTIVATE' || action === 'ACTIVATE') {
      apiMethod = this.updateUserStatus(user);
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
        type: 'USER',
        action,
        apiMethod,
      },
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value && ['DELETE', 'DEACTIVATE', 'ACTIVATE'].includes(action)) {
        this.getUsers(true);
      }
    });
  }

  public doRefresh() {
    this.offset = 0;
    this.paginator.pageIndex = 0;
    this.searchInput.setValue('');
    this.getUsers(true);
  }
}
