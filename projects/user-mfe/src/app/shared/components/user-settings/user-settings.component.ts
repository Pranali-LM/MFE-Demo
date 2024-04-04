import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SUPPORTED_DATE_FORMATS, SUPPORTED_LANGUAGES, SUPPORTED_METRIC_UNITS, SUPPORTED_TIMEZONES } from '@app-core/constants/constants';
import { dirtyCheck } from '@app-core/models/dirty-check';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Observable, of, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  public supportedTimeZones = SUPPORTED_TIMEZONES;
  public supportedMetricUnits = SUPPORTED_METRIC_UNITS;
  public supportedDateFormats = SUPPORTED_DATE_FORMATS;
  public supportedLanguages = SUPPORTED_LANGUAGES;
  public userSettingsForm: FormGroup;
  public isDirty$: Observable<boolean> = of(false);
  public selectedTimezone: string = '';
  private ngUnsubscribe = new Subject<void>();
  filteredTimezones: Observable<any[]>;
  public customOptions = {
    showLabel: true,
  };
  constructor(
    public dialogRef: MatDialogRef<UserSettingsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private fb: FormBuilder,
    private gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit(): void {
    this.createForm();
  }

  private createForm() {
    const { currentTimeZone = '', currentMetricUnit = '', currentDateFormat = '', currentLanguage = '' } = this.data || {};
    this.selectedTimezone = currentTimeZone;
    this.userSettingsForm = this.fb.group({
      timezone: this.fb.control(currentTimeZone, Validators.required),
      metricUnit: this.fb.control(currentMetricUnit, Validators.required),
      dateFormat: this.fb.control(currentDateFormat, Validators.required),
      language: this.fb.control(currentLanguage, Validators.required),
    });

    this.formValueChanges(this.userSettingsForm.getRawValue());
    this.filteredTimezones = this.userSettingsForm.get('timezone').valueChanges.pipe(
      startWith(''),
      map((value) => this._filterTimezones(value))
    );
  }

  private formValueChanges(source: any) {
    if (this.userSettingsForm) {
      this.isDirty$ = this.userSettingsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe), dirtyCheck(of(source)));
      this.isDirty$.subscribe();
    }
  }

  public onSubmit() {
    if (this.userSettingsForm.invalid) {
      return;
    }
    const oldTimeZone = this.data.currentTimeZone;
    const oldMetricUnit = this.data.currentMetricUnit;
    const oldDateFormat = this.data.currentDateFormat;
    const oldLanguage = this.data.currentLanguage;

    const { timezone, metricUnit, dateFormat, language } = this.userSettingsForm.getRawValue();

    const newTimeZone = timezone;
    const newMetricUnit = metricUnit;
    const newDateFormat = dateFormat;
    const newLanguage = language;

    if (oldDateFormat !== newDateFormat) {
      this.gtmService.userPrefrenceChangeDateFormat(newDateFormat);
    }
    if (oldLanguage !== newLanguage) {
      this.gtmService.userPrefrenceChangeLanguageChange(newLanguage);
    }
    if (oldMetricUnit !== newMetricUnit) {
      this.gtmService.userPrefrenceChangeMetricUnitChange(newMetricUnit);
    }
    if (oldTimeZone !== newTimeZone) {
      this.gtmService.userPrefrenceChangeTimeZoneChange(newTimeZone);
    }

    this.onClose({
      timezone,
      metricUnit,
      dateFormat,
      language,
    });
  }

  private _filterTimezones(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.supportedTimeZones.filter((timezone) => timezone.key.toLowerCase().includes(filterValue));
  }

  clearTimezone() {
    this.userSettingsForm.get('timezone').setValue('');
  }

  public onClose(data: any) {
    this.dialogRef.close(data);
  }
  public onTimezoneSelect(selectedTimezone = '') {
    this.userSettingsForm.get('timezone').setValue(selectedTimezone);
    if (this.data) {
      this.data.currentTimeZone = selectedTimezone;
    }
  }

  public timezoneDisplayFn(timezoneValue: string): string {
    const timezoneOption = SUPPORTED_TIMEZONES.find((t) => t.value === timezoneValue);
    return timezoneOption?.customLabel || timezoneValue;
  }
}
