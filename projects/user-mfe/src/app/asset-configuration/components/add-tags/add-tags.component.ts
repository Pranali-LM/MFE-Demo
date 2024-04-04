import { Component, OnInit } from '@angular/core';
import { ManageAction } from '../tagging/tagging.component';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { TAGGING_CONTROL_TYPES } from '@app-asset-config/constants/tagging.constants';
interface QueryParams {
  action: ManageAction;
  tagId?: string;
  attributeId?: number;
}

@Component({
  selector: 'app-add-tags',
  templateUrl: './add-tags.component.html',
  styleUrls: ['./add-tags.component.scss'],
})
export class AddTagsComponent implements OnInit {
  public actionName: ManageAction;
  public attributeList = [];
  public form: FormGroup;
  public tags: any = [];
  public isError = false;
  public isSuccess = false;
  public addAttributeLoader = false;
  public ManageAction = ManageAction;
  public isListAltered: boolean;
  public allowedTypes = TAGGING_CONTROL_TYPES;
  public getAttributeListLoader = false;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private tagId: string;
  private tagsDetails;
  private attributeId;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private taggingService: TaggingService,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: QueryParams) => {
      const { action, tagId, attributeId } = params || {};
      this.actionName = action;
      this.tagId = tagId;
      this.attributeId = attributeId;
      this.tagsDetails = this.taggingService.tagsDetails;
      if (this.actionName === ManageAction.Edit && !this.tagsDetails) {
        this.getTagDetails();
      }
    });
    this.getAttributeList();
    this.generateform();
  }

  public navigateBack() {
    this.location.back();
  }

  private generateform() {
    this.form = this.fb.group({
      attribute: new FormControl({ value: this.tagsDetails?.attributeId, disabled: this.actionName === 'edit' }, Validators.required),
      // userTags: new FormControl(this.tagsDetails?.userTags),
      tagName: new FormControl(this.tagsDetails?.tagName, [Validators.required, Validators.minLength(3), Validators.maxLength(48)]),
    });
  }

  addTagFromInput(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const valueLower = value.toLowerCase();
    const allTagLower = JSON.parse(JSON.stringify(this.tags).toLowerCase());
    if (value && !allTagLower.includes(valueLower)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
    this.form.get('tagName').patchValue(null);
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  private getAttributeList() {
    this.getAttributeListLoader = true;
    const params = {
      limit: 100,
      offset: 0,
    };
    if (this.actionName === ManageAction.Add) {
      params['status'] = 'ACTIVE';
    }
    this.taggingService
      .getAttributes(params)
      .pipe(
        finalize(() => {
          this.getAttributeListLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.attributeList = res?.data;
        },
        () => {}
      );
  }

  public onSubmit() {
    if (this.actionName === ManageAction.Edit) {
      this.updateTag();
    } else {
      this.addTags();
    }
  }

  private updateTag() {
    if (this.form.invalid) {
      this.snackBarService.failure(this.translate.instant('AddtagsPageTagsValidation'));
      return;
    }
    this.addAttributeLoader = true;
    const { tagName } = this.form?.value;
    const { status } = this.tagsDetails;
    const body = {
      tagName: tagName,
      status: status,
    };
    const params = {
      attributeId: this.tagsDetails?.attributeId,
    };

    this.taggingService
      .updateTag(this.tagId, body, params)
      .pipe(
        finalize(() => {
          this.addAttributeLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('TagsTableComponentUpdateTagSuccess'));
          this.navigateBack();
        },
        (err) => {
          if (err.status === 409) {
            this.snackBarService.failure(this.translate.instant('AddtagsPageTagExists'));
          } else {
            this.snackBarService.failure(this.translate.instant('AddtagsPageFailed'));
          }
        }
      );
  }

  private addTags() {
    if (!this.form.value.attribute || !this.tags.length) {
      this.snackBarService.failure(this.translate.instant('AddtagsPageValidationFailed'));
      return;
    }
    this.addAttributeLoader = true;
    const body = {
      attributeId: this.form?.value?.attribute,
      tagNames: this.tags,
      status: 'ACTIVE',
    };

    this.taggingService
      .addTags(body)
      .pipe(
        finalize(() => {
          this.addAttributeLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('AddtagsPageSuccess'));
          this.navigateBack();
        },
        (err) => {
          if (err.status === 409) {
            this.snackBarService.failure(this.translate.instant('AddtagsPageTagExists'));
          } else {
            this.snackBarService.failure(this.translate.instant('AddtagsPageFailed'));
          }
        }
      );
  }

  public getTagDetails() {
    const params = {
      attributeId: this.attributeId,
    };

    this.taggingService
      .getTagDetails(params, this.tagId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.tagsDetails = res?.data;
          this.generateform();
        },
        () => {
          this.tagsDetails = [];
        }
      );
  }
}
