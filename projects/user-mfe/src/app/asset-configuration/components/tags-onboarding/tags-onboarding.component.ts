import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ENTITIES } from '@app-core/constants/constants';
import { MatStepper } from '@angular/material/stepper';
import { MatDialogRef } from '@angular/material/dialog';
import { AccessService } from '@app-core/services/access/access.service';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { TAGGING_CONTROL_TYPES, ENTITY_TYPES } from '@app-asset-config/constants/tagging.constants';
@Component({
  selector: 'app-tags-onboarding',
  templateUrl: './tags-onboarding.component.html',
  styleUrls: ['./tags-onboarding.component.scss'],
})
export class TagsOnboardingComponent implements OnInit {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public dataSource = new MatTableDataSource<any>();
  public displayedColumns = ['attribute', 'type', 'tag', 'entity'];
  public startTaggingOnboarding = false;
  public attributeFormControl = new FormControl('', [Validators.required]);
  public tagNameFormControl = new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*[^\s]$/)]);
  public entityControl = new FormControl(<any | null>null, Validators.required);
  public addAttributeLoader = false;
  public fleetId: string;
  public smEntities = [];
  public isSuccess;
  public isError;
  public errorMessage = 'Something went wrong!! Please try again.';
  public userInfo;
  public form: FormGroup;
  public allowedTypes = TAGGING_CONTROL_TYPES;
  public enityList = ENTITY_TYPES;
  public backDisabled = false;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<TagsOnboardingComponent>,
    private accessService: AccessService,
    private taggingService: TaggingService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.dataSource.data = [{}];
    this.smEntities = [
      ...Object.entries(ENTITIES)
        .map(([key, value]) => ({ key, label: value.label }))
        .sort((a, b) => (a.label > b.label ? 1 : -1)),
    ];
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.userInfo = this.accessService.getLoginInfo();
    this.generateform();
  }

  private generateform() {
    this.form = this.fb.group({
      attributeType: new FormControl('', Validators.required),
      attributeName: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*[^\s]$/)]),
    });
  }

  public onStartOnboarding() {
    this.startTaggingOnboarding = true;
  }

  public attributeNext(stepper: MatStepper) {
    if (this.form.valid) {
      const type = this.form.value.attributeType;
      if (type === 'ACCESS') {
        this.enityList = ENTITY_TYPES.filter((entity) => entity.entityType === 'ACCESS');
      } else {
        this.enityList = ENTITY_TYPES;
      }
      stepper.next();
    }
  }

  public tagNext(stepper: MatStepper) {
    if (this.tagNameFormControl.valid) {
      stepper.next();
    }
  }

  public entityNext(stepper: MatStepper) {
    if (this.entityControl.valid) {
      this.dataSource.data = [
        {
          attributeType: this.form.value.attributeType,
          attributeName: this.form.value.attributeName,
          userTag: this.tagNameFormControl.value,
          entityName: this.entityControl.value,
        },
      ];
      stepper.next();
    }
  }

  public onClickDone() {
    if (this.entityControl.valid && this.tagNameFormControl.valid && this.form.valid) {
      this.onAddAttribute();
    }
  }

  public onAddAttribute() {
    this.addAttributeLoader = true;
    const { attributeName, attributeType } = this.form.value;
    const body = {
      attributeName: attributeName,
      attributeType: attributeType,
      status: 'ACTIVE',
      entityNames: [this.entityControl.value],
    };

    this.taggingService
      .addAttributes(body)
      .pipe(
        finalize(() => {
          this.addAttributeLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.assignTagToAttribute(res.data);
        },
        (err) => {
          this.isError = true;
          this.isSuccess = false;
          if (err.status === 409) {
            this.errorMessage = 'AddAttributeNameExist';
          } else {
            this.errorMessage = 'AddAttributeDialogFailed';
          }
        }
      );
  }

  public assignTagToAttribute(attributeDetails) {
    this.addAttributeLoader = true;
    const body = {
      attributeId: attributeDetails?.attributeId,
      tagNames: [this.tagNameFormControl?.value],
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
          this.isError = false;
          this.isSuccess = true;
          this.backDisabled = true;
        },
        (err) => {
          this.isError = true;
          this.isSuccess = false;
          if (err.status === 409) {
            this.errorMessage = 'AddtagsPageTagExists';
          } else {
            this.errorMessage = 'AddtagsPageFailed';
          }
        }
      );
  }
}
