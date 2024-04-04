import { Component, OnInit } from '@angular/core';
import { ManageAction } from '../tagging/tagging.component';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { ENTITY_TYPES, TAGGING_CONTROL_TYPES } from '@app-asset-config/constants/tagging.constants';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
interface QueryParams {
  action: ManageAction;
  attributeId?: string;
}

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
})
export class AddAttributeComponent implements OnInit {
  public actionName: ManageAction;
  public form: FormGroup;
  public attributeType = 'Access Based';
  public description = '';
  public attributeName = '';
  public allowedTypes = TAGGING_CONTROL_TYPES;
  public enityList = ENTITY_TYPES;
  public ManageAction = ManageAction;
  public loader = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private attributeDetails;
  private attributeId;
  private defaultAttributeType = 'DATA';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private taggingService: TaggingService,
    private snackBarService: SnackBarService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: QueryParams) => {
      const { action, attributeId } = params || {};
      this.actionName = action;
      this.attributeId = attributeId;
      this.attributeDetails = this.taggingService.attributeDetails || {};
      if (this.actionName === ManageAction.Edit) {
        this.getAttributeDetails();
      } else {
        this.generateform();
      }
    });

    const attributeType = this.form?.get('attributeType');
    if (attributeType) {
      attributeType.valueChanges.subscribe((value) => {
        if (value === 'ACCESS') {
          this.enityList = ENTITY_TYPES.filter((entity) => entity.entityType === 'ACCESS');
        } else {
          this.enityList = ENTITY_TYPES;
        }
      });
    }
  }

  public navigateBack() {
    this.location.back();
  }

  private generateform() {
    this.form = this.fb.group({
      attributeType: new FormControl(
        { value: this.attributeDetails?.attributeType || this.defaultAttributeType, disabled: this.actionName === ManageAction.Edit },
        Validators.required
      ),
      entities: new FormControl(
        { value: this.attributeDetails?.entities, disabled: this.actionName === ManageAction.Edit },
        Validators.required
      ),
      attributeName: new FormControl(this.attributeDetails?.attributeName, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(48),
        Validators.pattern(/^[^\s].*[^\s]$/),
      ]),
      description: new FormControl(this.attributeDetails?.description),
    });
  }

  public onSubmit() {
    if (this.actionName === ManageAction.Edit) {
      this.updateAttribute();
    } else {
      this.addAttribute();
    }
  }

  private updateAttribute() {
    this.loader = true;
    const { attributeName, description } = this.form.value || {};
    const body = {
      attributeName: attributeName,
      description: description,
      status: this.attributeDetails?.status,
    };

    this.taggingService
      .deactivateAttributes(body, this.attributeId)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('AttributeTableComponentUpdateSuccess'));
          this.navigateBack();
        },
        (err) => {
          if (err.status === 409) {
            this.snackBarService.failure(this.translate.instant('AddAttributeNameExist'));
          } else {
            this.snackBarService.failure(this.translate.instant('AddAttributeDialogFailed'));
          }
        }
      );
  }

  private addAttribute() {
    this.loader = true;
    const { attributeName, attributeType, description, entities } = this.form.value;
    const body = {
      attributeName: attributeName,
      attributeType: attributeType,
      status: 'ACTIVE',
      entityNames: entities,
      description: description ? description : '',
    };

    this.taggingService
      .addAttributes(body)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('AddAttributeDialogSucess'));
          this.navigateBack();
        },
        (err) => {
          if (err.status === 409) {
            this.snackBarService.failure(this.translate.instant('AddAttributeNameExist'));
          } else {
            this.snackBarService.failure(this.translate.instant('AddAttributeDialogFailed'));
          }
        }
      );
  }

  private getAttributeDetails() {
    this.taggingService
      .getAttributeDetails(this.attributeId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.attributeDetails = res?.data[0];
          this.generateform();
        },
        () => {
          this.attributeDetails = {};
        }
      );
  }
}
