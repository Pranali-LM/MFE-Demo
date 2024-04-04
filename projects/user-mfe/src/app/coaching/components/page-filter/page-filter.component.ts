import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { getDurationFilterState, State } from '@app-coaching/reducers';
import { BREAKPOINTS_MEDIUM, BREAKPOINTS_SMALL, MAX_DATE_RANGE_IN_MONTHS } from '@app-core/constants/constants';
import { DateService } from '@app-core/services/date/date.service';
import { Durations } from '@app-trips/common/trips.constants';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-page-filter',
  templateUrl: './page-filter.component.html',
  styleUrls: ['./page-filter.component.scss'],
})
export class PageFilterComponent implements OnInit, OnDestroy {
  @Output()
  public changeDuration = new EventEmitter<any>();

  public durations = Durations;
  public maxStartDate: string;
  public maxEndDate: string;
  public minStartDate: string;
  public form = null;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public isTouchDevice = false;

  constructor(
    private store: Store<State>,
    private fb: FormBuilder,
    private dateService: DateService,
    private breakpointObserver: BreakpointObserver,
    public translate: TranslateService
  ) {}

  public ngOnInit() {
    const d = new Date();
    const defaultStartDate = new Date(d.setDate(d.getDate() - 30));

    this.form = this.fb.group({
      startDate: [defaultStartDate, [Validators.required]],
      endDate: [new Date(), [Validators.required]],
    });
    this.setMinMaxDateRanges();

    this.store
      .select(getDurationFilterState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((durationFilter) => {
        this.form.patchValue({
          startDate: durationFilter.displayStartDate,
          endDate: durationFilter.displayEndDate,
        });
      });

    this.breakpointObserver.observe([...BREAKPOINTS_SMALL, ...BREAKPOINTS_MEDIUM]).subscribe((state: BreakpointState) => {
      this.isTouchDevice = state.matches;
    });
  }

  private setMinMaxDateRanges() {
    this.maxStartDate = this.maxEndDate = new Date().toISOString();
    this.minStartDate = this.dateService.subtractMonths(this.maxStartDate, MAX_DATE_RANGE_IN_MONTHS);
  }
  /**
   * Function called on change of start Date
   *
   * Reset endDate if start Date is greater than endDate
   */
  public onStartDateChange() {
    const { startDate, endDate } = this.form.value;
    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      this.form.patchValue({
        endDate: null,
      });
    }
  }

  /**
   * Function called on when end date is selected
   *
   * Emit search event.
   */
  public onEndDateChange() {
    const { startDate, endDate } = this.form.value;

    if (!(startDate && endDate)) {
      return;
    }
    const now = new Date(this.maxStartDate);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliSeconds = now.getMilliseconds();

    // Setting current Hours, minutes and seconds since datepicker only sets date part.
    const from = this.dateService.toDaysStartISO(new Date(startDate?.setHours(hours, minutes, seconds, milliSeconds)));
    const to = this.dateService.toDaysEndISOPlusOne(new Date(endDate?.setHours(hours, minutes, seconds, milliSeconds)));

    this.changeDuration.emit({
      displayStartDate: startDate,
      displayEndDate: endDate,
      paramStartDate: from,
      paramEndDate: to,
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
