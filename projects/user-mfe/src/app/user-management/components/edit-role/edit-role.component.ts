import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { RoleHierarchyComponent } from '../role-hierarchy/role-hierarchy.component';
import { MatDialog } from '@angular/material/dialog';
import { RoleTemplateComponent } from '../role-template/role-template.component';
import { UserRoleManageService } from '@app-user-management/service/user-role-manage.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  CreateRoleReqBody,
  EditUserRoleDetailsReqBody,
  UserRole,
  UserRoleStatus,
  UserRoleTemplate,
} from '@app-user-management/models/user-roles.model';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { MainPermission, SubPermission, Permission, LoginFleetInfo } from '@app-core/models/core.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ManageRoleAction } from '../manage-roles/manage-roles.component';
import { AccessService } from '@app-core/services/access/access.service';

interface QueryParams {
  action: ManageRoleAction;
  roleId?: string;
}

@Component({
  selector: 'app-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
})
export class EditRoleComponent implements OnInit, OnDestroy {
  public loader = false;
  public permissionLoader = false;
  public getRoleDetailsLoader = false;
  public permissionList: MainPermission[] = [];
  public templateList: UserRoleTemplate[] = [];
  public configurationsList: MainPermission[] = [];
  public form: FormGroup;
  public actionName: ManageRoleAction;
  public levelList: number[] = [];
  public ActionEnum = ManageRoleAction;
  public currentFleetInfo: LoginFleetInfo;
  public manageRoleActionEnum = ManageRoleAction;
  public roleDetails: UserRole;
  public selectedAttrIds = [];

  private roleId: string;
  private selectedTemplateId: number;
  private writeOperations = ['create', 'update', 'delete'];
  private selectedTemplate: UserRoleTemplate;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private dataService: DataService,
    private dialog: MatDialog,
    private userRoleService: UserRoleManageService,
    private route: ActivatedRoute,
    private snackBarService: SnackBarService,
    private gtmService: GoogleTagManagerService,
    private accessService: AccessService,
    private router: Router
  ) {
    // opening the dialog ijn ngOnInit before NavigationEnd will destroy the dialog component immediately
    this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe((e) => {
      if (e instanceof NavigationEnd && this.actionName === ManageRoleAction.Add) {
        this.initialFormSetup();
        this.openRoleTemplate();
      }
    });
  }

  public ngOnInit(): void {
    const userInfo = this.accessService.getLoginInfo();
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentFleetInfo = userInfo.fleets.filter((fl) => fl.fleetId === value)[0];
      }
    });
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: QueryParams) => {
      const { action, roleId } = params || {};
      this.actionName = action;
      this.roleId = roleId;
      this.roleDetails = this.userRoleService.roleDeatils;
      const attrList: any = [...this.roleDetails?.attributeIds];
      this.selectedAttrIds = attrList.map((attr) => attr.attributeId);
    });

    if (this.actionName === ManageRoleAction.Duplicate) {
      if (this.roleDetails) {
        const { roleName } = this.roleDetails;
        this.roleDetails.roleName = `${roleName} (Copy)`;
        this.roleDetails.description = '';
        this.roleDetails.level = this.roleDetails.level === 1 ? 2 : this.roleDetails.level;
        this.roleDetails.isAdmin = false;
      }
      this.getRoleDetails();
    } else if ([ManageRoleAction.View, ManageRoleAction.Edit].includes(this.actionName)) {
      this.getRoleDetails();
    }

    this.getHierarchyLevels();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private initialFormSetup() {
    this.formGenerator();
    this.subscribeForTemplateChange();
    this.getPermissionList();
  }

  private subscribeForTemplateChange() {
    this.form
      .get('template')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedTemplateId) => {
        if (this.templateList.length) {
          this.selectedTemplateId = selectedTemplateId;
          this.selectedTemplate = this.templateList.find((r) => r.id === selectedTemplateId);
          this.updatePermissionsForm(this.selectedTemplate.permissions);
          this.updateUiConfigsForm(this.selectedTemplate.uiPermissions);
        }
      });
  }

  private getRoleDetails() {
    if (this.roleDetails) {
      this.initialFormSetup();
      return;
    }
    this.getRoleDetailsLoader = true;
    this.userRoleService
      .getRoleDetails(this.roleId)
      .pipe(
        finalize(() => {
          this.getRoleDetailsLoader = false;
          this.initialFormSetup();
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.roleDetails = {
            ...res.data,
            ...(this.actionName === ManageRoleAction.Duplicate
              ? {
                  roleName: `${res.data.roleName} (Copy)`,
                  description: '',
                  level: res.data.level === 1 ? 2 : res.data.level,
                  isAdmin: false,
                }
              : {}),
          };
          const attrList: any = [...this.roleDetails?.attributeIds];
          this.selectedAttrIds = attrList.map((attr) => attr.attributeId);
        },
        () => {
          this.roleDetails = {} as UserRole;
        }
      );
  }

  private getHierarchyLevels() {
    this.userRoleService
      .getRoleHierarchy()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          const levels = (res.data || []).map((r) => r.level);
          const maxLevel = Math.max(...levels, 1);
          const allPossibleLevels = [...Array(maxLevel).keys()]
            .map((l) => l + 1)
            .filter((l) => (this.actionName === ManageRoleAction.View ? Boolean(l) : l > 1));
          this.levelList = [...allPossibleLevels, maxLevel + 1];
        },
        () => {
          this.levelList = [];
        }
      );
  }

  private openRoleTemplate() {
    const dialogRef = this.dialog.open(RoleTemplateComponent, {
      position: { top: '24px' },
      width: '640px',
      // height: '700px',
      autoFocus: false,
      disableClose: true,
      data: {
        template: this.roleDetails?.templateUsed || this.selectedTemplateId,
        actionName: this.actionName,
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      this.templateList = data?.templateList || [];
      this.form.controls['template'].setValue(data?.selectedTemplateId);
      this.gtmService.selectTemplateDialogAddRole(data?.selectedTemplateId);
    });
  }

  public viewHierarchy() {
    if (this.actionName === ManageRoleAction.Add) {
      this.gtmService.viewHierarchy('Add Roles');
    }
    if (this.actionName === ManageRoleAction.Add) {
      this.gtmService.viewHierarchy('Edit Roles');
    }
    if (this.actionName === ManageRoleAction.Duplicate) {
      this.gtmService.viewHierarchy('Duplicate Roles');
    }
    this.dialog.open(RoleHierarchyComponent, {
      position: { top: '24px' },
      width: '640px',
      minHeight: '480px',
      autoFocus: false,
    });
  }

  private getPermissionList() {
    this.permissionList = [];
    this.configurationsList = [];
    this.permissionLoader = true;
    const params = {
      portalId: 3,
    };
    this.dataService
      .getAllowedPermissionList(params)
      .pipe(
        finalize(() => {
          this.permissionLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          const permissions = res?.data?.find((r) => r.isPermission)?.permissions || [];
          const uiConfigurations = res?.data?.find((r) => !r.isPermission)?.permissions || [];
          this.permissionList = JSON.parse(JSON.stringify(permissions));
          this.configurationsList = JSON.parse(JSON.stringify(uiConfigurations));
          this.generatePermisionForm();
          this.generateConfigForm();
          if (this.actionName !== ManageRoleAction.Add) {
            this.updatePermissionsForm(this.roleDetails.permissions);
            this.updateUiConfigsForm(this.roleDetails.uiPermissions);
          }
        },
        () => {}
      );
  }

  private toggleAllChildrenControls(event: MatCheckboxChange, childrenFormArrayControls: AbstractControl[], childrenPerNames: string[]) {
    childrenFormArrayControls.map((x, idx) => {
      x.patchValue({
        [childrenPerNames[idx]]: event.checked || false,
      });
      x.enable();
    });
  }

  private toggleParentNSiblingControls(
    modifiedChildPerIndex: number,
    parentPerName: string,
    parentControl: AbstractControl,
    siblingFormArrayControls: AbstractControl[]
  ) {
    const modifiedChildControl = siblingFormArrayControls[modifiedChildPerIndex];
    const [modifiedPerName] = Object.entries(modifiedChildControl.value)[0];
    const [modifiedPerOperation] = modifiedPerName.split(':');

    let readSubPerFg: AbstractControl;
    let readSubPerName: string;
    let writeOperationValues: boolean[] = [];
    let allChildrenValues: boolean[] = [];
    siblingFormArrayControls.forEach((subPerFg) => {
      const [permissionName, permissionValue] = Object.entries(subPerFg.value)[0];
      const [operation] = permissionName.split(':');
      if (operation === 'read') {
        readSubPerFg = subPerFg;
        readSubPerName = permissionName;
      } else if (this.writeOperations.includes(operation)) {
        writeOperationValues.push(Boolean(permissionValue));
      }
      allChildrenValues.push(Boolean(permissionValue));
    });

    const parentPermissionValue = allChildrenValues.some(Boolean);
    parentControl.patchValue({
      ...parentControl.value,
      [parentPerName]: parentPermissionValue,
    });

    if (this.writeOperations.includes(modifiedPerOperation) && readSubPerFg) {
      if (writeOperationValues.some(Boolean)) {
        readSubPerFg.patchValue({ [readSubPerName]: true });
        readSubPerFg.disable();
      } else {
        readSubPerFg.enable();
      }
    }
  }

  public onPermissionChange(event: MatCheckboxChange, idx: number, subPerIndex?: number) {
    const level2Change = !(subPerIndex === null || subPerIndex === undefined);
    const level1Change = !level2Change && !(idx === null || idx === undefined);
    if (level1Change) {
      const { subPermissions = [] } = this.permissionList[idx] || {};
      const subPermissionFormArrayControls = this.subPermissions(idx).controls;
      this.toggleAllChildrenControls(
        event,
        subPermissionFormArrayControls,
        subPermissions.map((s) => s.permission)
      );
    } else {
      const { permission: parentPermissionName } = this.permissionList[idx] || {};
      const parentPermissionControl = this.permissions().at(idx);
      const subPermissionFormArrayControls = this.subPermissions(idx).controls;
      this.toggleParentNSiblingControls(subPerIndex, parentPermissionName, parentPermissionControl, subPermissionFormArrayControls);
    }
  }

  public onUiConfigChange(event: MatCheckboxChange, idx: number, subConfigIndex?: number, childConfigIndex?: number) {
    const level3Change = !(childConfigIndex === null || childConfigIndex == undefined);
    const level2Change = !level3Change && !(subConfigIndex === null || subConfigIndex == undefined);
    const level1Change = !level3Change && !level2Change && !(idx === null || idx === undefined);
    if (level1Change) {
      const { subPermissions = [] } = this.configurationsList[idx] || {};
      const subConfigurationsFormArrayControls = this.subUiConfigs(idx).controls;
      this.toggleAllChildrenControls(
        event,
        subConfigurationsFormArrayControls,
        subPermissions.map((s) => s.permission)
      );

      subPermissions.forEach((_, idx2) => {
        this.onUiConfigChange(event, idx, idx2);
      });
    } else if (level2Change) {
      const { permission: parentUiConfigName, subPermissions = [] } = this.configurationsList[idx] || {};
      const { childPermissions = [] } = subPermissions[subConfigIndex] || {};
      const childUiConfigFormArrayControls = this.childConfig(idx, subConfigIndex).controls;
      this.toggleAllChildrenControls(
        event,
        childUiConfigFormArrayControls,
        childPermissions.map((c) => c.permission)
      );

      const parentUiConfigControl = this.configurations().at(idx);
      const subUiConfigFormArrayControls = this.subUiConfigs(idx).controls;
      this.toggleParentNSiblingControls(subConfigIndex, parentUiConfigName, parentUiConfigControl, subUiConfigFormArrayControls);
    } else {
      const { subPermissions = [] } = this.configurationsList[idx] || {};
      const { permission: subUiConfigName } = subPermissions[subConfigIndex];

      const subUiConfigControl = this.subUiConfigs(idx).controls[subConfigIndex];
      const childUiConfigFormArrayControls = this.childConfig(idx, subConfigIndex).controls;
      this.toggleParentNSiblingControls(childConfigIndex, subUiConfigName, subUiConfigControl, childUiConfigFormArrayControls);
    }
  }

  private formGenerator() {
    this.form = this.fb.group({
      template: new FormControl(this.selectedTemplateId || this.roleDetails?.templateUsed),
      roleName: new FormControl(this.roleDetails?.roleName, [Validators.required, this.roleNameValidator]),
      level: new FormControl(this.roleDetails?.level, Validators.required),
      status: new FormControl(
        this.actionName === ManageRoleAction.Edit ? this.roleDetails?.status : UserRoleStatus.Active,
        Validators.required
      ),
      description: new FormControl(this.roleDetails?.description || ''),
      permissions: new FormArray([]),
      uiConfig: new FormArray([]),
    });
  }

  public roleNameValidator(control: FormControl) {
    const value = control.value;
    if (!value) {
      return null;
    }

    const pattern =
      /^[A-Za-z0-9_\-!@#$%^&*()[\]{};:'"<>,.?/+|=\\-][A-Za-z0-9_\- \s!@#$%^&*()[\]{};:'"<>,.?/+|=\\-]*[A-Za-z0-9_\-!@#$%^&*()[\]{};:'"<>,.?/+|=\\-]$/;
    return pattern.test(value) ? null : { invalidRoleName: true };
  }

  private generatePermisionForm() {
    this.permissionList.map((per, index: number) => {
      this.addPermissions(per);
      if (per.subPermissions && per.subPermissions.length) {
        const writeOperationValues = (per.subPermissions || [])
          .filter((mSp) => {
            const [operation] = mSp.permission.split(':');
            return this.writeOperations.includes(operation);
          })
          .map((mSp) => Boolean(mSp.isChecked));

        per.subPermissions.map((subPer) => {
          const [operation] = subPer.permission.split(':');
          const disabled = per.isChecked || (operation === 'read' && writeOperationValues.some(Boolean));
          this.addSubPermissions(subPer, index, disabled);
        });
      }
    });
  }

  private updatePermissionsForm(rolePermissions: string[]) {
    const mappedPermissions = this.mapPermissions(rolePermissions);
    mappedPermissions.forEach((per, idx) => {
      this.permissions()
        .at(idx)
        .patchValue({
          [per.permission]: per.isChecked,
        });
      this.onPermissionChange({ checked: per.isChecked } as MatCheckboxChange, idx);

      (per.subPermissions || []).forEach((subPer, idx2) => {
        this.subPermissions(idx)
          .at(idx2)
          .patchValue({
            [subPer.permission]: subPer.isChecked,
          });
        this.onPermissionChange({ checked: subPer.isChecked } as MatCheckboxChange, idx, idx2);
      });
    });
  }

  private updateUiConfigsForm(roleUiConfigs: string[]) {
    const mappedUiConfigs = this.mapUiConfigs(roleUiConfigs);
    mappedUiConfigs.forEach((conf, idx) => {
      this.configurations()
        .at(idx)
        .patchValue({
          [conf.permission]: conf.isChecked,
        });
      this.onUiConfigChange({ checked: conf.isChecked } as MatCheckboxChange, idx);

      (conf.subPermissions || []).forEach((subConf, idx2) => {
        this.subUiConfigs(idx)
          .at(idx2)
          .patchValue({
            [subConf.permission]: subConf.isChecked,
          });
        this.onUiConfigChange({ checked: subConf.isChecked } as MatCheckboxChange, idx, idx2);

        (subConf.childPermissions || []).forEach((childConf, idx3) => {
          this.childConfig(idx, idx2)
            .at(idx3)
            .patchValue({
              [childConf.permission]: childConf.isChecked,
            });
          this.onUiConfigChange({ checked: childConf.isChecked } as MatCheckboxChange, idx, idx2, idx3);
        });
      });
    });
  }

  private generateConfigForm() {
    this.configurationsList.map((conf, index: number) => {
      this.addConfigurations(conf);

      if (conf.subPermissions && conf.subPermissions.length) {
        conf.subPermissions.map((subConf, subIndex: number) => {
          this.addSubConfig(subConf, index);
          // for child
          if (subConf.childPermissions && subConf.childPermissions.length) {
            subConf.childPermissions.map((childConf) => {
              this.addChildConfig(childConf, index, subIndex);
            });
          }
        });
      }
    });
  }

  private addPermissions(per: MainPermission) {
    this.permissions().push(this.newPermission(per));
  }

  private newPermission(per: MainPermission): FormGroup {
    const px = per.permission.toString();
    return this.fb.group({
      [px]: new FormControl(per.isChecked || false),
      subPermissions: this.fb.array([]),
    });
  }

  private addConfigurations(conf: MainPermission) {
    this.configurations().push(this.newConfig(conf));
  }

  public permissions(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  public configurations(): FormArray {
    return this.form.get('uiConfig') as FormArray;
  }

  private newConfig(conf: MainPermission): FormGroup {
    const px = conf.permission;
    return this.fb.group({
      [px]: new FormControl(),
      subUiConfigs: this.fb.array([]),
    });
  }

  public subPermissions(perIndex: number): FormArray {
    return this.permissions().at(perIndex).get('subPermissions') as FormArray;
  }

  public subUiConfigs(perIndex: number): FormArray {
    return this.configurations().at(perIndex).get('subUiConfigs') as FormArray;
  }

  private newSubPermission(subPer: SubPermission, disabled: boolean): FormGroup {
    const spx = subPer.permission.toString();
    return this.fb.group({
      [spx]: new FormControl({ value: subPer.isChecked || false, disabled }),
    });
  }

  private newSubConfig(subConf: SubPermission): FormGroup {
    const spx = subConf.permission.toString();
    return this.fb.group({
      [spx]: new FormControl(),
      childUiConfigs: this.fb.array([]),
    });
  }

  private addSubPermissions(subPer: SubPermission, index: number, disabled: boolean) {
    this.subPermissions(index).push(this.newSubPermission(subPer, disabled));
  }

  private addSubConfig(subConf: SubPermission, index: number) {
    this.subUiConfigs(index).push(this.newSubConfig(subConf));
  }

  private addChildConfig(childConf: Permission, index: number, subIndex: number) {
    const parent = this.form.get('uiConfig') as FormArray;
    const sub = parent.at(index).get('subUiConfigs') as FormArray;
    const child = sub.at(subIndex).get('childUiConfigs') as FormArray;
    const node = child.push(this.newChildConfig(childConf));
    return node;
  }

  public childConfig(index: number, subIndex: number) {
    const childNode = this.subUiConfigs(index).at(subIndex).get('childUiConfigs') as FormArray;
    return childNode;
  }

  private newChildConfig(childConfig: Permission): FormGroup {
    const spx = childConfig.permission;
    return this.fb.group({
      [spx]: new FormControl(),
    });
  }

  private mapPermissions(rolePermissions: string[] = []): MainPermission[] {
    const permissionList: MainPermission[] = JSON.parse(JSON.stringify(this.permissionList));
    // eslint-disable-next-line
    for (let i = 0; i <= rolePermissions.length; i++) {
      // eslint-disable-next-line
      for (let j = 0; j <= permissionList.length; j++) {
        if (permissionList[j] !== undefined && rolePermissions.includes(permissionList[j].permission)) {
          permissionList[j].isChecked = true;
        }

        if (permissionList[j] && permissionList[j].subPermissions && permissionList[j].subPermissions.length) {
          // eslint-disable-next-line
          for (let k = 0; k < permissionList[j].subPermissions.length; k++) {
            if (
              permissionList[j].subPermissions !== undefined &&
              rolePermissions.includes(permissionList[j].subPermissions[k].permission)
            ) {
              permissionList[j].subPermissions[k].isChecked = true;
            }
          }
        }
      }
    }
    return permissionList;
  }

  private mapUiConfigs(roleUiConfigs: string[] = []): MainPermission[] {
    const UiConfigList: MainPermission[] = JSON.parse(JSON.stringify(this.configurationsList));
    // eslint-disable-next-line
    for (let i = 0; i <= roleUiConfigs.length; i++) {
      // eslint-disable-next-line
      for (let j = 0; j <= UiConfigList.length; j++) {
        if (UiConfigList[j] !== undefined && roleUiConfigs.includes(UiConfigList[j].permission)) {
          UiConfigList[j].isChecked = true;
        }

        if (UiConfigList[j] && UiConfigList[j].subPermissions && UiConfigList[j].subPermissions.length) {
          // eslint-disable-next-line
          for (let k = 0; k < UiConfigList[j].subPermissions.length; k++) {
            if (UiConfigList[j].subPermissions !== undefined && roleUiConfigs.includes(UiConfigList[j].subPermissions[k].permission)) {
              UiConfigList[j].subPermissions[k].isChecked = true;
            }
          }
        }
      }
    }
    return UiConfigList;
  }

  public navigateBack() {
    this.location.back();
  }

  public onSubmit() {
    if (this.actionName === ManageRoleAction.Add) {
      this.gtmService.saveRole('Add Roles');
    }
    if (this.actionName === ManageRoleAction.Edit) {
      this.gtmService.saveRole('Edit Roles');
    }
    if (this.actionName === ManageRoleAction.Duplicate) {
      this.gtmService.saveRole('Duplicate Roles');
    }

    this.loader = true;
    let apiCall: Observable<any>;
    let body: CreateRoleReqBody | EditUserRoleDetailsReqBody;
    if (this.actionName === ManageRoleAction.Edit) {
      body = new EditUserRoleDetailsReqBody(this.form.getRawValue(), this.selectedAttrIds);
      apiCall = this.userRoleService.updateRole(this.roleDetails.roleId, body);
    } else {
      body = new CreateRoleReqBody(this.form.getRawValue(), this.selectedAttrIds);
      apiCall = this.userRoleService.addRole(body);
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
          if (this.actionName === ManageRoleAction.Edit) {
            this.snackBarService.success('Successfully updated user role details');
          } else {
            this.snackBarService.success('Successfully created new role');
          }
          this.navigateBack();
        },
        (err) => {
          const { status } = err || {};
          if (status === 409) {
            this.snackBarService.failure('Role already exists');
          } else if (this.actionName === ManageRoleAction.Add && status) {
            this.snackBarService.failure('Failed to add role');
          } else {
            this.snackBarService.failure('Something went wrong. Please try again');
          }
        }
      );
  }

  public selectedAttributes(attributedIds) {
    this.selectedAttrIds = attributedIds;
  }
}
