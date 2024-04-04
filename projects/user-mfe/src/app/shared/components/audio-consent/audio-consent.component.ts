import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-audio-consent',
  templateUrl: './audio-consent.component.html',
  styleUrls: ['./audio-consent.component.scss'],
})
export class AudioConsentComponent {
  public loader = false;
  public showError = false;
  public showSuccess = false;
  public consentInput = new FormControl(false, Validators.required);
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private fleetId: string;

  constructor(
    private dataService: DataService,
    public dialogRef: MatDialogRef<AudioConsentComponent>,
    private gtmService: GoogleTagManagerService
  ) {}

  public onSubmit() {
    this.loader = true;
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
    this.gtmService.agreeConsentDriverConfigurations(this.fleetId);
    this.dataService
      .saveDriverConfigConsent()
      .pipe(
        finalize(() => (this.loader = false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.showSuccess = true;
        },
        () => {
          this.showError = true;
        }
      );
  }

  public closeDialog() {
    this.dialogRef.close(this.showSuccess);
  }
}
