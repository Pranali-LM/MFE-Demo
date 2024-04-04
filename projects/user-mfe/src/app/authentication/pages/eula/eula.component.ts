import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { FormControl } from '@angular/forms';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AccessService } from '@app-core/services/access/access.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EulaConsentService } from '@app-auth/services/eula-consent/eula-consent.service';
@Component({
  selector: 'app-eula',
  templateUrl: './eula.component.html',
  styleUrls: ['./eula.component.scss'],
})
export class EulaComponent implements OnInit {
  public acceptAgreement = new FormControl(false);
  public step = 1;
  public consentForm: FormGroup;
  public loader = false;
  private ngUnsubscribe = new Subject<void>();
  private loginInfo = this.accessService.getLoginInfo();

  constructor(
    public dialogRef: MatDialogRef<EulaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fleetId?: string },
    public dataService: DataService,
    private fb: FormBuilder,
    private accessService: AccessService,
    private eulaConsentService: EulaConsentService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  public viewAgreement() {
    this.step = 1;
  }

  public reject() {
    this.step = 0;
  }

  public next() {
    this.step = 2;
  }

  public confirm() {
    if (this.consentForm.invalid) {
      return;
    }
    const body = {
      jobTitle: this.consentForm.value.jobTitle,
      organizationName: this.consentForm.value.organizationName,
    };

    this.loader = true;
    this.eulaConsentService
      .saveEULAConsent(body, this.data.fleetId)
      .pipe(
        finalize(() => (this.loader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          if (res?.data && res?.data?.EULAConsent === 'ACCEPTED') {
            this.dialogRef.close(true);
          } else {
            this.dialogRef.close(false);
          }
        },
        () => {
          this.dialogRef.close(false);
        }
      );
  }

  private createForm() {
    this.consentForm = this.fb.group({
      name: this.fb.control({ value: this.loginInfo['name'], disabled: true }),
      email: this.fb.control({ value: this.loginInfo['loginName'], disabled: true }),
      jobTitle: this.fb.control('', Validators.required),
      organizationName: this.fb.control('', Validators.required),
    });
  }
}
