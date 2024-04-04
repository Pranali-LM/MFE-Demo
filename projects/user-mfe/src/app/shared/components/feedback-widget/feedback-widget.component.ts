import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feedback-widget',
  templateUrl: './feedback-widget.component.html',
  styleUrls: ['./feedback-widget.component.scss'],
})
export class FeedbackwidgetComponent implements OnInit, OnDestroy {
  public showFeedbackForm = false;
  public textCount = 0;
  public feedbackType = 'feature';
  public form: FormGroup;
  public isSuccess = false;
  public loader = false;
  public fleetId: string;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(public dataService: DataService, private gtmService: GoogleTagManagerService) {}

  public ngOnInit() {
    this.form = new FormGroup({
      subject: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(48),
        this.sentenceLengthValidator(3, 48),
      ]),
      message: new FormControl('', [
        Validators.required,
        Validators.minLength(48),
        Validators.maxLength(280),
        this.sentenceLengthValidator(48, 280),
      ]),
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.fleetId = value;
    });
  }
  public sentenceLengthValidator(minLength: number, maxLength: number) {
    return (control) => {
      const value = control.value;
      if (value) {
        const sentenceLength = value.trim().replace(/\s+/g, ' ').length;
        if (sentenceLength < minLength || sentenceLength > maxLength) {
          return { fullSentenceLength: true };
        }
      }
      return null;
    };
  }

  public getFeedbackType(feedbackType: string) {
    this.showFeedbackForm = true;
    this.feedbackType = feedbackType;
  }
  public onSubmit() {
    this.isSuccess = false;
    const { subject = '', message = '' } = this.form.value;
    const body = {
      subject: subject.toString(),
      message: message.toString(),
      portalType: 'fleet_portal',
      type: this.feedbackType,
    };

    this.gtmService.feedbackWidgetsRequest(this.feedbackType, this.fleetId);

    this.dataService
      .submitFeedback(body)
      .pipe(
        finalize(() => {
          this.loader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.isSuccess = true;
          this.showFeedbackForm = false;
          this.form.reset();
        },
        () => {
          this.isSuccess = false;
        }
      );
  }

  public closeForm() {
    this.showFeedbackForm = false;
    this.form.reset();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
