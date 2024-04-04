import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-assign-attribute',
  templateUrl: './assign-attribute.component.html',
  styleUrls: ['./assign-attribute.component.scss'],
})
export class AssignAttributeComponent implements OnInit {
  public selectedAttributeIds = [];
  public loader = false;
  public actionName;
  public entityName;
  public entityDetails;
  public entityDetailsLoader = false;
  public attributeList = [];
  public linkUnlinkLoader = false;
  public isAccess;
  public attributeType;
  private assignedAttributeIds = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private selectedTagsControl = new FormControl();

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private taggingService: TaggingService,
    private snackBarService: SnackBarService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const { action, entityName, isAccess } = params || {};
      this.actionName = action;
      this.entityName = entityName;
      this.isAccess = isAccess;
      this.attributeType = isAccess == 'true' ? '' : 'DATA';
      this.entityDetails = this.taggingService.entityDetails || {};
    });
  }

  public navigateBack() {
    this.location.back();
  }

  public selectedAttributes(values) {
    this.selectedAttributeIds = values;
    this.selectedTagsControl.patchValue(values);
    this.selectedTagsControl.markAsDirty();
  }

  public onSubmit() {
    this.editLinkedAttribute();
  }

  public editLinkedAttribute() {
    let attrToAdd = [];
    let attrToRemove = [];
    let oldAttributeIds = this.assignedAttributeIds;

    attrToAdd = this.selectedAttributeIds.filter((a) => !oldAttributeIds.includes(a));
    attrToRemove = oldAttributeIds.filter((a) => !this.selectedAttributeIds.includes(a));

    this.linkUnlinkLoader = true;

    const body = {
      entityName: this.entityName,
      addAttributeIds: attrToAdd,
      removeAttributeIds: attrToRemove,
    };

    this.taggingService
      .linkAtrributeToEntity(body)
      .pipe(
        finalize(() => {
          this.linkUnlinkLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('EntityComponentUpdateTagSuccess'));
          this.navigateBack();
        },
        () => {
          this.snackBarService.failure(this.translate.instant('EntityTableComponentUpdateTagFailed'));
        }
      ),
      () => {
        this.snackBarService.failure(this.translate.instant('EntityTableComponentUpdateTagFailed'));
        this.navigateBack();
      };
  }

  public assignedAttribute(attributeIds) {
    this.assignedAttributeIds = attributeIds;
  }
}
