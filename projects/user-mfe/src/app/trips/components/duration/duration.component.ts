import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BREAKPOINTS_MEDIUM, BREAKPOINTS_SMALL, MAX_DATE_RANGE_IN_MONTHS } from '@app-core/constants/constants';
import { DateService } from '@app-core/services/date/date.service';
import { Durations } from '@app-trips/common/trips.constants';
import { getTripsFilter, State } from '@app-trips/reducers';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.scss'],
})
export class DurationComponent implements OnInit, OnDestroy {
  @Input()
  public currentTabIndex = 0;
  @Input()
  public entityType;

  @Output()
  public tripFilterChange = new EventEmitter<any>();

  private ALL_DRIVERS_ID = 'All Drivers';
  private ALL_ASSET_ID = '';

  public durations = Durations;
  public maxStartDate: string;
  public maxEndDate: string;
  public minStartDate: string;
  public form = null;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public isTouchDevice = false;
  public filterTypeList = [
    {
      label: 'Driver',
      value: 'driverFilter',
    },
    {
      label: 'Asset',
      value: 'assetFilter',
    },
  ];
  public customOptions = {
    showLargeInput: false,
    showAdditionalDisplayProp: true,
    additionalDisplayPropKey: 'driverName',
  };
  public tagIds = [];
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();
  public tripTags: any[];
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
      filterType: ['driverFilter', Validators.required],
      driverId: [this.ALL_DRIVERS_ID],
      assetId: [''],
      tagIds: [''],
      includeInsignificantTrips: [false],
    });
    this.setMinMaxDateRanges();

    this.store
      .select(getTripsFilter)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((tripsFilter) => {
        this.form.patchValue({
          startDate: tripsFilter.displayStartDate,
          endDate: tripsFilter.displayEndDate,
          filterType: tripsFilter.filterType,
          driverId: tripsFilter.driverId || this.ALL_DRIVERS_ID,
          assetId: tripsFilter.assetId || this.ALL_ASSET_ID,
          tagIds: tripsFilter.tagIds,
          includeInsignificantTrips: tripsFilter.includeInsignificantTrips,
        });
      });

    this.breakpointObserver.observe([...BREAKPOINTS_SMALL, ...BREAKPOINTS_MEDIUM]).subscribe((state: BreakpointState) => {
      this.isTouchDevice = state.matches;
    });

    this.store
      .select(getTripsFilter)
      .pipe(takeUntil(this.ngUnsubscribeOnChanges))
      .subscribe((tagFilter) => {
        const { tagIds } = tagFilter;
        this.tagIds = tagIds;
      });
    this.tripTags = this.tagIds.length ? this.tagIds.map((tagid) => ({ tagId: tagid })) : [];
  }

  private setMinMaxDateRanges() {
    this.maxStartDate = this.maxEndDate = new Date().toISOString();
    this.minStartDate = this.dateService.subtractMonths(this.maxStartDate, MAX_DATE_RANGE_IN_MONTHS);
  }

  public driverChanged(driverId = '') {
    this.form.patchValue({ driverId });
  }

  public assetChanged(assetId = '') {
    this.form.patchValue({ assetId });
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
   * Function called on click of search button
   *
   * Emit search event.
   */
  public onSearch() {
    const { startDate, endDate, driverId, assetId, filterType, tagIds, includeInsignificantTrips } = this.form.value;

    const now = new Date(this.maxStartDate);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliSeconds = now.getMilliseconds();

    // Setting current Hours, minutes and seconds since datepicker only sets date part.
    const from = this.dateService.toDaysStartISO(new Date(startDate.setHours(hours, minutes, seconds, milliSeconds)));
    const to = this.dateService.toDaysEndISOPlusOne(new Date(endDate.setHours(hours, minutes, seconds, milliSeconds)));

    let selectedDriverId = driverId !== this.ALL_DRIVERS_ID ? driverId : '';
    let selectedAssetId = assetId !== this.ALL_ASSET_ID ? assetId : undefined;
    if (filterType === 'assetFilter') {
      selectedDriverId = undefined;
    } else {
      selectedAssetId = undefined;
    }

    this.tripFilterChange.emit({
      displayStartDate: startDate,
      displayEndDate: endDate,
      paramStartDate: from,
      paramEndDate: to,
      filterType,
      driverId: selectedDriverId,
      assetId: selectedAssetId,
      tagIds: tagIds,
      includeInsignificantTrips,
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
  }

  public selectedTags(tags: any) {
    this.form.get('tagIds').patchValue(tags);
  }
}
