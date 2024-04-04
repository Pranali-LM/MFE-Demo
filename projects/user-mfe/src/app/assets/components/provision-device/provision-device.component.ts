import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ASSETID_ALLOWED_CHARACTERS,
  ASSETNAME_ALLOWED_CHARACTERS,
  ASSETNAME_ALLOWED_MAX_LENGTH,
  AVAILABLE_DUTY_TYPES,
  DEFAULT_DUTY_TYPE,
} from '@app-assets/constants/assets.constants';
import { EditProvisionDeviceInfo, PatchAssetParam } from '@app-assets/models/assets.model';
import { AssetsService } from '@app-assets/services/assets.service';
import { MyErrorStateMatcher } from '@app-core/constants/constants';
import { dirtyCheck } from '@app-core/models/dirty-check';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { delay, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-provision-device',
  templateUrl: './provision-device.component.html',
  styleUrls: ['./provision-device.component.scss'],
})
export class ProvisionDeviceComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public matcher = new MyErrorStateMatcher();
  public loader = false;
  public deviceForm: FormGroup;
  public availableDutyTypes = AVAILABLE_DUTY_TYPES;
  public isDirty$: Observable<boolean> = of(false);
  public errorMessage = '';
  public isSuccess = false;
  public customOptions = {
    showAdditionalDisplayProp: true,
    additionalDisplayPropKey: 'driverName',
  };
  public showLoader = false;

  constructor(
    public dialogRef: MatDialogRef<ProvisionDeviceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private assetsService: AssetsService,
    private fb: FormBuilder,
    private snackbarService: SnackBarService,
    private translate: TranslateService
  ) {}

  public ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.deviceForm = this.fb.group({
      assetId: this.fb.control('', [Validators.maxLength(48), Validators.pattern(ASSETID_ALLOWED_CHARACTERS)]),
      assetName: this.fb.control('', [
        Validators.maxLength(ASSETNAME_ALLOWED_MAX_LENGTH),
        Validators.pattern(ASSETNAME_ALLOWED_CHARACTERS),
      ]),
      dutyType: this.fb.control(DEFAULT_DUTY_TYPE, Validators.required),
      defaultDriverId: this.fb.control(''),
    });

    this.formValueChanges(this.deviceForm.getRawValue());
  }

  private formValueChanges(source: any) {
    if (this.deviceForm) {
      this.isDirty$ = this.deviceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe), dirtyCheck(of(source)));
      this.isDirty$.subscribe();
    }
  }

  public driverChanged(defaultDriverId = '') {
    this.deviceForm.patchValue({ defaultDriverId });
  }

  public onProvisionDevice() {
    this.showLoader = true;
    const { dutyType } = this.deviceForm.getRawValue();
    const { deviceMetadata } = this.data.device;
    const { dutyType: metadataDutyType, recurringLivestreamExtraMinutes, ridecamPlusPlan } = deviceMetadata;
    const { assetName } = this.deviceForm.getRawValue();
    const body = {
      ...this.deviceForm.getRawValue(),
      assetName: assetName.trim(),
      vendorId: this.data.device.vendorId,
      deviceId: this.data.device.deviceId,
      fleetId: this.data.device.fleetId,
      dutyType: dutyType || metadataDutyType,
      recurringLivestreamExtraMinutes,
      ridecamPlusPlan,
    };
    this.assetsService
      .provisionDevice(body)
      .pipe(
        finalize(() => {}),
        takeUntil(this.ngUnsubscribe),
        delay(2000)
      )
      .subscribe(
        (res = {}) => {
          const { status = 200, body: { message = this.translate.instant('deviceListProvisionSuccess') } = {} } = res;
          if (status === 200) {
            this.patchAsset();
            this.snackbarService.success(this.translate.instant('deviceListDeviceDetailsUpdateSuccess'));
          } else {
            this.errorMessage = message;
          }
        },
        (err) => {
          const { error: { message = this.translate.instant('deviceListProviosionFailed') } = {} } = err || {};
          this.showLoader = false;
          this.errorMessage = message;
        }
      );
  }

  private patchAsset() {
    const { defaultDriverId, assetId, dutyType } = this.deviceForm.getRawValue();
    const param = new PatchAssetParam(this.data.device.fleetId);
    const body = {
      assets: [{ assetId, ...(!!dutyType ? { dutyType } : {}), ...(!!defaultDriverId ? { defaultDriverId } : {}) }],
    };
    this.showLoader = true;
    this.assetsService
      .patchAsset(body, param)
      .pipe(finalize(() => (this.showLoader = false)))
      .subscribe(
        () => {
          this.closeDialog({ ...this.deviceForm.getRawValue(), newProvision: false });
          this.snackbarService.success(this.translate.instant('deviceListAssetUpdateSuccess'));
        },
        () => {
          this.errorMessage = this.translate.instant('deviceListAssetUpdateFailure');
        }
      );
  }

  public onSubmit(): void {
    if (this.deviceForm.invalid) {
      return;
    }
    this.isSuccess = false;
    this.onProvisionDevice();
  }

  public closeDialog(data?: EditProvisionDeviceInfo): void {
    this.dialogRef.close(data);
  }

  public onClose() {}

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
