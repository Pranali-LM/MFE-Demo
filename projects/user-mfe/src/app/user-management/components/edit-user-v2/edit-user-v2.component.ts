import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EMAIL_REGEX, NAME_REGEX } from '@app-core/constants/constants';
import { LoginInfo, MyErrorStateMatcher, UserTag } from '@app-core/models/core.model';
import { Observable, Subject } from 'rxjs';
import { UserRoleManageService } from '@app-user-management/service/user-role-manage.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ListUserRolesParams, UserRole } from '@app-user-management/models/user-roles.model';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { ManageUserAction } from '../user-list-v2/user-list-v2.component';
import { CreateUserReqBody, EditUserReqBody, User } from '@app-user-management/models/users.model';
import { UserManageService } from '@app-user-management/services/user-manage/user-manage.service';

interface QueryParams {
  action: ManageUserAction;
  userId?: string;
}

@Component({
  selector: 'app-edit-user-v2',
  templateUrl: './edit-user-v2.component.html',
  styleUrls: ['./edit-user-v2.component.scss'],
})
export class EditUserV2Component implements OnInit, OnDestroy {
  public matcher = new MyErrorStateMatcher();
  public form: FormGroup;
  public loader = false;
  public actionName: ManageUserAction;
  public allowedRoles: UserRole[] = [];
  public getRolesListLoader = false;
  public ManageUserAction = ManageUserAction;
  public attributeIds = [];
  public userTags: UserTag[] = [];

  private allRoles: UserRole[] = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private userDetails: User | any;
  private fleetId: string;
  private userId: string;
  private userInfo: LoginInfo | any;
  private loggedInUserLevel: number;
  private tagIds: number[];

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private userRoleService: UserRoleManageService,
    private route: ActivatedRoute,
    private accessService: AccessService,
    private dataService: DataService,
    private snackBarService: SnackBarService,
    public translate: TranslateService,
    public gtmService: GoogleTagManagerService,
    private userManageService: UserManageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userInfo = this.accessService.getLoginInfo();

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
        const currentUserFleet = this.userInfo.fleets.filter((fl: any) => fl.fleetId === this.fleetId)[0];
        this.loggedInUserLevel = this.userInfo.loginType === 'fleetmanager' ? currentUserFleet.role.level : 1;
        this.resetSelectedRole();
        this.getData();
      }
    });

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: QueryParams) => {
      const { action, userId } = params || {};
      this.actionName = action;
      this.userId = userId;
      this.userDetails = this.userManageService.userDeatils;
      const tagList = this.userDetails?.fleets[0]?.userTags || [];
      if (tagList.length > 0) {
        this.tagIds = tagList.map((tag) => tag.tagId);
      }
    });
    if (this.actionName === ManageUserAction.Edit) {
      this.getUserDetails();
    } else {
      this.generateform();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private generateform() {
    if (
      this.userDetails === undefined ||
      this.userInfo?.userId === this.userDetails?.userId ||
      this.userDetails?.fleets[0]?.level < this.loggedInUserLevel
    ) {
      if (this.actionName === ManageUserAction.Edit) {
        this.router.navigate(['user-management']);
      }
    }

    const { role, userTags = [] } = this?.userDetails?.fleets.find((f) => f.fleetId === this.fleetId) || {};
    this.userTags = userTags;
    this.form = this.fb.group({
      email: new FormControl({ value: this?.userDetails?.email, disabled: this.actionName === ManageUserAction.Edit }, [
        Validators.required,
        Validators.email,
        Validators.pattern(EMAIL_REGEX),
      ]),
      name: new FormControl(this?.userDetails?.name, [Validators.required, Validators.pattern(NAME_REGEX)]),
      roleId: new FormControl(role?.roleId, Validators.required),
      roleName: new FormControl(role?.roleName, Validators.required),
    });
    this.subscribeFormRoleChange();
  }

  private getData() {
    this.getRolesList();
  }

  private getUserDetails() {
    if (this.userDetails) {
      this.generateform();
      return;
    }
    this.userManageService
      .getUserDetails(this.userId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.userDetails = res.data;
          const tagList = this.userDetails?.fleets[0]?.userTags || [];
          if (tagList.length > 0) {
            this.tagIds = tagList.map((tag) => tag.tagId);
          }
          this.generateform();
        },
        () => {
          this.userDetails = {} as User;
        }
      );
  }

  private getRolesList() {
    this.getRolesListLoader = true;
    const params = new ListUserRolesParams({});
    this.userRoleService
      .getRolesList(params)
      .pipe(
        finalize(() => {
          this.getRolesListLoader = false;
          this.updatedAllowedRolesList();
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.allRoles = res.data;
        },
        () => {
          this.allRoles = [];
        }
      );
  }

  private subscribeFormRoleChange() {
    this.form
      .get('roleId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((roleId) => {
        const { roleName, attributeIds } = this.allowedRoles.find((r) => r.roleId === roleId) || {};
        this.attributeIds = attributeIds;
        this.form.patchValue({ roleName });
        this.tagIds = [];
      });
  }

  private updatedAllowedRolesList() {
    this.allowedRoles = this.allRoles.filter((r) => r.level >= this.loggedInUserLevel);
    const roleId = this.form.get('roleId').value;
    if (roleId) {
      const { attributeIds } = this.allowedRoles.find((r) => r.roleId === roleId) || {};
      this.attributeIds = attributeIds;
    }
  }

  private resetSelectedRole() {
    if (this.form) {
      this.form.patchValue({ roleId: undefined });
    }
  }

  public onSubmit() {
    this.gtmService.saveEditUser();
    this.loader = true;
    let apiCall: Observable<any>;
    let body: CreateUserReqBody | EditUserReqBody;
    const { userType = '' } = this.accessService.getLoginInfo();
    if (this.actionName === ManageUserAction.Edit) {
      body = new EditUserReqBody(this.form.getRawValue(), this.tagIds);
      apiCall = this.userManageService.updateUser(this.userDetails.userId, body, userType);
    } else {
      body = new CreateUserReqBody(this.form.getRawValue(), this.tagIds);
      apiCall = this.userManageService.addUser(body);
    }
    apiCall
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          if (this.actionName === ManageUserAction.Edit) {
            this.snackBarService.success(this.translate.instant('userMangementUpdatedSuccess'));
          } else {
            this.snackBarService.failure(this.translate.instant('userMangementAddeddSuccess'));
          }
          this.navigateBack();
        },
        (err) => {
          const { status } = err || {};
          if (this.actionName === ManageUserAction.Edit) {
            this.snackBarService.success(this.translate.instant('userMangementUserUpdationFailed'));
          } else {
            if (status === 409) {
              this.snackBarService.failure(this.translate.instant('userMangementUserAdditionConflict'));
            } else {
              this.snackBarService.failure(this.translate.instant('userMangementUserAdditionFailed'));
            }
          }
        }
      );
  }

  public navigateBack() {
    this.location.back();
  }

  public selectedTags(tags) {
    this.tagIds = tags;
  }
}
