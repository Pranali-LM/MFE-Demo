import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserRoleTemplate } from '@app-user-management/models/user-roles.model';

import { UserRoleManageService } from '@app-user-management/service/user-role-manage.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ManageRoleAction } from '../manage-roles/manage-roles.component';
@Component({
  selector: 'app-role-template',
  templateUrl: './role-template.component.html',
  styleUrls: ['./role-template.component.scss'],
})
export class RoleTemplateComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public templateControl: FormControl;
  public templateList: UserRoleTemplate[] = [];
  public actionName: ManageRoleAction;
  public getRoleTemplateLoader = false;

  constructor(
    private userRoleService: UserRoleManageService,
    public dialogRef: MatDialogRef<RoleTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private location: Location
  ) {
    debugger;
    if (this.data?.actionName === ManageRoleAction.Add) {
      this.templateControl = new FormControl(1, [Validators.required]);
    } else {
      this.templateControl = new FormControl(this.data?.template, [Validators.required]);
    }
  }

  ngOnInit(): void {
    this.getRoleTemplate();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getRoleTemplate() {
    this.getRoleTemplateLoader = true;
    this.templateList = new Array(4).fill({});
    this.userRoleService
      .getRoleTemplates()
      .pipe(
        finalize(() => {
          this.getRoleTemplateLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.templateList = res?.data;
        },
        () => {
          this.templateList = [];
        }
      );
  }

  public selectTemplate() {
    this.dialogRef.close({
      templateList: this.templateList,
      selectedTemplateId: this.templateControl.value,
    });
  }

  public closeTemplate() {
    this.location.back();
  }
}
