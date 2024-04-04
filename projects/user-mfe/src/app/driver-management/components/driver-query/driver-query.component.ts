import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BREAKPOINTS_MEDIUM, BREAKPOINTS_SMALL, MAX_DATE_RANGE_IN_MONTHS } from '@app-core/constants/constants';
import { DateService } from '@app-core/services/date/date.service';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { getDriverQueryState } from '@app-driver-management/reducers';
import { State } from '@app-driver-management/reducers/driver-query.reducer';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';

@Component({
  selector: 'app-driver-query',
  templateUrl: './driver-query.component.html',
  styleUrls: ['./driver-query.component.scss'],
})
export class DriverQueryComponent implements OnInit, OnDestroy {
  public driverQueryState: any;
  @Input()
  public driverList = [];
  @Input()
  public isCoachingRequired = false;

  @Output()
  private search: EventEmitter<any> = new EventEmitter<any>();

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public maxStartDate: string;
  public maxEndDate: string;
  public minStartDate: string;
  public isTouchDevice = false;
  public customOptions = {
    showLargeInput: true,
    showAdditionalDisplayProp: true,
    additionalDisplayPropKey: 'driverName',
  };
  private driverDetails;

  public form = this.fb.group({
    driverId: ['', [Validators.required]],
    formStartDate: [<Date | null>null, [Validators.required]],
    formEndDate: [<Date | null>null, [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private dateService: DateService,
    private store: Store<State>,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private gtmService: GoogleTagManagerService,
    private driverManagementService: DriverManagementService
  ) {}

  public ngOnInit() {
    this.setMinMaxDateRanges();

    this.breakpointObserver.observe([...BREAKPOINTS_SMALL, ...BREAKPOINTS_MEDIUM]).subscribe((state: BreakpointState) => {
      this.isTouchDevice = state.matches;
    });

    this.driverManagementService.driverStats.pipe(takeUntil(this.ngUnsubscribe)).subscribe((driverStats) => {
      this.driverDetails = driverStats;
    });

    this.store
      .select(getDriverQueryState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((driverQueryState) => {
        this.driverQueryState = driverQueryState;
        this.form.patchValue({
          formStartDate: this.driverQueryState.displayStartDate,
          formEndDate: this.driverQueryState.displayEndDate,
          driverId: this.driverQueryState.driverId,
        });
      });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.unsubscribe();
  }

  private setMinMaxDateRanges() {
    this.maxStartDate = this.maxEndDate = new Date().toISOString();
    this.minStartDate = this.dateService.subtractMonths(this.maxStartDate, MAX_DATE_RANGE_IN_MONTHS);
  }

  /**
   * Function called on change of start Date
   *
   * Reset formEndDate if start Date is greater than formEndDate
   */
  public onStartDateChange() {
    const { formStartDate, formEndDate } = this.form.value;
    if (formStartDate && formEndDate && formStartDate.getTime() > formEndDate.getTime()) {
      this.form.patchValue({
        formEndDate: null,
      });
    }
  }

  public driverChanged(driverId = '') {
    this.form.patchValue({ driverId });
  }

  /**
   * Function called on click of search button
   *
   * Emit search event.
   */
  public onSearch() {
    const { driverId, formStartDate = '', formEndDate = '' } = this.form.value;

    if (driverId === '' || formStartDate === '' || formEndDate === '') {
      return;
    }

    const now = new Date(this.maxStartDate);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliSeconds = now.getMilliseconds();
    // Setting current Hours, minutes and seconds since datepicker only sets date part.
    const from = this.dateService.toDaysStartISO(new Date(formStartDate.setHours(hours, minutes, seconds, milliSeconds)));
    const to = this.dateService.toDaysEndISOPlusOne(new Date(formEndDate.setHours(hours, minutes, seconds, milliSeconds)));

    this.search.emit({
      driverId,
      displayStartDate: formStartDate,
      displayEndDate: formEndDate,
      paramStartDate: from,
      paramEndDate: to,
    });
  }

  public navigateToCoachingSession() {
    this.gtmService.gotoCoachingSessionFromDriversPage();
    this.router.navigate(['coaching-session'], {
      relativeTo: this.route,
      queryParams: {
        driverId: this.driverDetails?.driverId || '',
      },
    });
  }
}
