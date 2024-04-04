import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMAIL_PATTERN } from '@app-core/constants/constants';
import { DRIVERID_INPUT_PATTERN } from '@app-driver-management/common/driver-management.constants';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DriverEnrollmentComponent } from '../driver-enrollment/driver-enrollment.component';
import { CLIENT_CONFIG } from '@config/config';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}

interface AddDriverComponentData {
  driverId?: string;
  infoMessage?: string;
}

@Component({
  selector: 'app-add-driver',
  templateUrl: './add-driver.component.html',
  styleUrls: ['./add-driver.component.scss'],
})
export class AddDriverComponent implements OnInit, OnDestroy {
  public loader = false;
  public errorMessage: string;
  public isAddDriverSuccessful = false;
  public matcher = new MyErrorStateMatcher();
  public addDriverForm = new FormGroup({
    userType: new FormControl('DRIVER', Validators.required),
    driverEmail: new FormControl('', [Validators.pattern(EMAIL_PATTERN)]),
    driverId: new FormControl('', [
      Validators.required,
      Validators.maxLength(48),
      Validators.pattern(DRIVERID_INPUT_PATTERN),
    ]),
    driverName: new FormControl('', [Validators.required, Validators.pattern(`^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$`)]),
  });

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public clientConfig = CLIENT_CONFIG;

  constructor(
    private driverManagementService: DriverManagementService,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<AddDriverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddDriverComponentData = {},
    private dialog: MatDialog,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit() {
    if (this.data.driverId) {
      this.addDriverForm.patchValue({ driverId: this.data.driverId });
      this.addDriverForm.get('driverId').disable();
      this.addDriverForm.get('userType').disable();
    }

    this.addDriverForm.get('userType').valueChanges.subscribe((val: string) => {
      if (val === 'INSTALLER') {
        this.addDriverForm.get('driverEmail').addValidators(Validators.required);
        this.addDriverForm.get('driverEmail').updateValueAndValidity();
      } else {
        this.addDriverForm.get('driverEmail').removeValidators(Validators.required);
        this.addDriverForm.get('driverEmail').updateValueAndValidity();
      }
    });
  }

  public onSubmit() {
    this.loader = true;
    this.isAddDriverSuccessful = false;
    this.errorMessage = null;
    const { driverId, driverEmail: email, driverName, userType } = this.addDriverForm.getRawValue();
    const params = {
      driverId,
      driverName,
      userType,
      ...(email !== '' ? { email } : {}),
    };
    this.driverManagementService
      .driverSignup(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        () => {
          this.isAddDriverSuccessful = true;
          this.gtmService.addDriver(driverId);
        },
        (err) => {
          this.isAddDriverSuccessful = false;
          if (err.status === 400) {
            this.errorMessage = this.translate.instant('driverManagementEmailExists');
          } else if (err.status === 409) {
            this.errorMessage = this.translate.instant('driverManagementDriverIdExists');
          } else {
            this.errorMessage = this.translate.instant('driverManagementSignUpFailed');
          }
        }
      );
  }

  public openDriverEnrollmentDialog() {
    const { driverId, driverName, driverEmail } = this.addDriverForm.value;
    this.onClose();
    this.dialog.open(DriverEnrollmentComponent, {
      width: '720px',
      height: '640px',
      autoFocus: false,
      position: { top: '24px' },
      data: {
        source: 'addDriver',
        driverId,
        driverName,
        email: driverEmail,
      },
    });
  }

  public onClose() {
    this.dialogRef.close({
      isAddDriverSuccessful: this.isAddDriverSuccessful,
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
