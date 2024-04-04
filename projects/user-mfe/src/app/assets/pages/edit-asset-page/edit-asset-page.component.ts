import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MdvrConfigComponent } from '@app-assets/components/mdvr-config/mdvr-config.component';
import {
  ASSETID_ALLOWED_CHARACTERS,
  DEFAULT_DUTY_TYPE,
  AVAILABLE_DUTY_TYPES,
  ASSETNAME_ALLOWED_CHARACTERS,
  ASSETNAME_ALLOWED_MAX_LENGTH,
} from '@app-assets/constants/assets.constants';
import { AssetDetails, AssetPlans, DeviceModelConfig, PatchAssetParam, UpdateMdvrConfigReqBody } from '@app-assets/models/assets.model';
import { AssetsService } from '@app-assets/services/assets.service';
import { MyErrorStateMatcher } from '@app-core/models/core.model';
import { dirtyCheck } from '@app-core/models/dirty-check';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { CLIENT_CONFIG } from '@config/config';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, delay, finalize, map, switchMap, takeUntil } from 'rxjs/operators';

interface QueryParams {
  assetId: string;
}

@Component({
  selector: 'app-edit-asset-page',
  templateUrl: './edit-asset-page.component.html',
  styleUrls: ['./edit-asset-page.component.scss'],
})
export class EditAssetPageComponent implements OnInit, OnDestroy {
  @ViewChild(MdvrConfigComponent)
  private mdvrConfigComp: MdvrConfigComponent;

  public matcher = new MyErrorStateMatcher();
  public actionName = 'Edit';
  public assetDetails: AssetDetails;
  public fleetDriverList: any[];
  public assetForm: FormGroup;
  public isDirty$: Observable<boolean> = of(false);
  public availableDutyTypes = AVAILABLE_DUTY_TYPES;
  public clientConfig = CLIENT_CONFIG;
  public customOptions = {
    showAdditionalDisplayProp: true,
    additionalDisplayPropKey: 'driverName',
    appearance: 'outline',
    showLabel: true,
  };
  public loader = false;
  public assetPlans: AssetPlans;
  public mdvrSupported: boolean;
  public mdvrConfigured: boolean;
  public deviceModelConfig: DeviceModelConfig;
  public getAssetTagsLoader = false;

  private assetId: string;
  private ngUnsubscribe = new Subject<void>();
  // private selectedTagIds = [];
  public assetTags = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private assetsService: AssetsService,
    private gtmService: GoogleTagManagerService,
    private snackBarService: SnackBarService,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: QueryParams) => {
      this.assetId = params.assetId;
      this.assetDetails = this.assetsService.assetDetails;
      this.fleetDriverList = this.assetsService.fleetDriverList;
    });

    this.getData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private generateForm() {
    const {
      assetId = '',
      dutyType = DEFAULT_DUTY_TYPE,
      defaultDriverId = '',
      deviceId,
      serialNumber,
      assetName = '',
    } = this.assetDetails || {};
    this.assetForm = this.fb.group({
      deviceId: this.fb.control({ value: deviceId, disabled: true }),
      serialNumber: this.fb.control({ value: serialNumber, disabled: true }),
      assetId: this.fb.control({ value: assetId, disabled: !deviceId }, [
        Validators.maxLength(48),
        Validators.pattern(ASSETID_ALLOWED_CHARACTERS),
      ]),
      assetName: this.fb.control(assetName, [
        Validators.pattern(ASSETNAME_ALLOWED_CHARACTERS),
        Validators.maxLength(ASSETNAME_ALLOWED_MAX_LENGTH),
      ]),
      dutyType: this.fb.control(dutyType, Validators.required),
      defaultDriverId: this.fb.control(defaultDriverId),
      tagIds: this.fb.control(''),
      configureMdvr: this.fb.control(this.mdvrConfigured),
    });
    this.cdRef.detectChanges(); // To fix ExpressionChangedAfterItHasBeenCheckedError from this.loader
    this.formValueChanges(this.assetForm.getRawValue());
    this.getAssetTags();
  }

  private formValueChanges(source: any) {
    if (this.assetForm) {
      this.isDirty$ = this.assetForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe), dirtyCheck(of(source)));
      this.isDirty$.subscribe();
    }
  }

  private isMdvrSupported() {
    if (!this.assetPlans || !this.deviceModelConfig) {
      return false;
    }
    const { ridecamPlusPlan } = this.assetDetails;
    const { plans = {}, customPackages = {} } = this.assetPlans;
    return (plans[ridecamPlusPlan] || []).includes('MDVR') || (customPackages[ridecamPlusPlan] || []).includes('MDVR');
  }

  private isMdvrConfigured(): boolean {
    const { channelMappings = [] } = this.assetDetails?.mdvrConfig || {};
    return Boolean(channelMappings?.length);
  }

  private getData() {
    forkJoin([this.getAssetDetails(), this.getDriverList(), this.assetsService.getAssetPlans().pipe(catchError(() => of()))])
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((res) => {
          const { deviceId } = res[0];
          return this.assetsService.getDeviceModelConfig(deviceId).pipe(
            map((deviceModelConfigResp) => {
              return [...res, deviceModelConfigResp];
            }),
            catchError(() => {
              return of([...res]);
            })
          );
        }),
        finalize(() => {
          this.mdvrSupported = this.isMdvrSupported();
          this.mdvrConfigured = this.isMdvrConfigured();
          this.generateForm();
        })
      )
      .subscribe(
        (res: any) => {
          const [assetDetails, driverList, assetPlans, deviceModelConfig] = res;
          this.assetDetails = assetDetails;
          this.fleetDriverList = driverList;
          this.assetPlans = assetPlans;
          this.deviceModelConfig = deviceModelConfig;
        },
        () => {
          this.assetDetails = {} as AssetDetails;
          this.fleetDriverList = [];
        }
      );
  }

  private getAssetDetails() {
    if (this.assetDetails) {
      return of(this.assetDetails);
    }

    return this.assetsService.getAssetDetails({ assetId: this.assetId }).pipe(takeUntil(this.ngUnsubscribe));
  }

  private getDriverList() {
    if (this.fleetDriverList) {
      return of(this.fleetDriverList);
    }
    return this.assetsService.getDriverList().pipe(
      takeUntil(this.ngUnsubscribe),
      map((res) => res.data || []),
      catchError(() => of([]))
    );
  }

  private patchAsset() {
    this.loader = true;
    const { fleetId, deviceId } = this.assetDetails;
    const { assetId, dutyType, defaultDriverId, tagIds, assetName } = this.assetForm.getRawValue();
    const driver = this.fleetDriverList.filter((x: any) => x.driverId === defaultDriverId)[0];
    const param = new PatchAssetParam(fleetId);
    const body = {
      assets: [
        {
          assetId: assetId || deviceId,
          ...(assetName && assetName.trim() ? { assetName: assetName.trim() } : { assetName: null }),
          assetTags: tagIds,
          dutyType,
          ...(driver
            ? { defaultDriverId, defaultDriverName: driver.driverName }
            : {
                defaultDriverId: null,
                defaultDriverName: null,
              }),
        },
      ],
    };

    // NOTE: delay of 1000ms is added here as per BE recommendation to avoid some document update conflicts
    this.assetsService
      .patchAsset(body, param)
      .pipe(delay(1000), takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.updateMdvrConfig();
        },
        () => {
          this.loader = false;
          this.snackBarService.failure(this.translate.instant('editAssetComponentAssetFailed'));
        }
      );
  }

  private modifyDeviceMapping() {
    this.loader = true;
    const { deviceId, serialNumber } = this.assetDetails;
    const { assetId } = this.assetForm.getRawValue();
    const defaultAssetId = this.isDeviceIdPrimaryKey() ? deviceId : serialNumber;
    const body = {
      deviceId,
      assetId: assetId || defaultAssetId,
    };
    this.assetsService
      .modifyDeviceMapping(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.patchAsset();
        },
        (err: any) => {
          let errorMessage: string;
          const { status } = err || {};
          if (status === '409') {
            errorMessage = this.translate.instant('editAssetComponentAssetIdMapped');
          } else if (status === '404') {
            if (this.isDeviceIdPrimaryKey()) {
              errorMessage = this.translate.instant('editAssetComponentUnabletoMap');
            } else {
              errorMessage = this.translate.instant('editAssetComponentUnabletoMapSerialNumber');
            }
          } else {
            errorMessage = this.translate.instant('editAssetComponentAssetFailed');
          }
          this.snackBarService.failure(errorMessage);
          this.loader = false;
        }
      );
  }

  private updateMdvrConfig() {
    if (!this.mdvrConfigComp) {
      this.loader = false;
      this.snackBarService.success(this.translate.instant('editAssetComponentSuccess'));
      this.navigateBack();
      return;
    }

    this.loader = true;
    const { deviceId } = this.assetDetails;
    const { channelMappings, serialId } = this.mdvrConfigComp?.mdvrConfigForm?.getRawValue();
    const body: UpdateMdvrConfigReqBody = {
      channelMappings,
      serialId,
    };
    this.assetsService
      .updateMdvrConfig(deviceId, body)
      .pipe(
        finalize(() => (this.loader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.snackBarService.success(this.translate.instant('editAssetComponentSuccess'));
          this.navigateBack();
        },
        () => {
          this.snackBarService.failure(this.translate.instant('editAssetComponentAssetFailed'));
        }
      );
  }

  public navigateBack() {
    this.location.back();
  }

  public isDeviceIdPrimaryKey() {
    return this.assetsService.isDeviceIdPrimaryKey();
  }

  public driverChanged(defaultDriverId = '') {
    this.assetForm.patchValue({ defaultDriverId });
  }

  public onConfigureMdvrToggle() {
    // To fix ExpressionChangedAfterItHasBeenCheckedError from mdvrConfigComp?.mdvrConfigForm?.invalid
    this.cdRef.detectChanges();
  }

  public onSubmit(): void {
    if (this.assetForm.invalid || this.mdvrConfigComp?.mdvrConfigForm?.invalid) {
      return;
    }
    const { deviceId, assetId = '', dutyType = '', defaultDriverId = '' } = this.assetDetails;
    const { assetId: newAssetId, dutyType: newDutyType } = this.assetForm.getRawValue();
    this.gtmService.editAsset(deviceId, assetId, dutyType, newDutyType, defaultDriverId);
    if (deviceId && assetId !== newAssetId) {
      this.modifyDeviceMapping();
    } else {
      this.patchAsset();
    }
  }

  public selectedTags(tags) {
    this.assetForm.get('tagIds').patchValue(tags);
  }

  private getAssetTags() {
    this.getAssetTagsLoader = true;
    this.assetsService
      .getAssetTags(this.assetId)
      .pipe(
        finalize(() => {
          this.getAssetTagsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.assetTags = res?.assetTags;
        },
        () => {
          this.assetTags = [];
        }
      ),
      () => {
        this.assetTags = [];
      };
  }
}
