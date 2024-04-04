import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-driver-auto-complete',
  templateUrl: './driver-auto-complete.component.html',
  styleUrls: ['./driver-auto-complete.component.scss'],
})
export class DriverAutoCompleteComponent implements OnInit {
  @Input() public hideAllDrivers: boolean = false;
  @Input()
  public placeholder = 'Search';
  @Input()
  public enableAutocomplete = false;
  @Input()
  public hint = '';
  @Input()
  public inputValue = '';
  @Input()
  public isRequired = false;
  @Input()
  public requiredErrorMessage = '';

  @Output()
  private driverSelection = new EventEmitter<string>();
  public inputControl = new FormControl('');
  public filteredDrivers = null;
  public showSpinner = false;
  public disabled = false;

  private selectedDriverId = '';
  private ngUnSubscribe: Subject<void> = new Subject();

  constructor(private dataService: DataService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        takeUntil(this.ngUnSubscribe),
        debounceTime(500),
        map((val) => val.trim().toLowerCase()),
        distinctUntilChanged(),
        switchMap((searchString) => this.autoCompleteDrivers(searchString)),
        catchError(() => of([]))
      )
      .subscribe((drivers: string[]) => {
        this.filteredDrivers = drivers;
        this.addAllDriversOption();
      });
  }

  public ngOnChanges() {
    this.inputControl.setValue(this.inputValue);
  }

  public ngOnDestroy() {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }

  private autoCompleteDrivers(driverId = ''): Observable<string[]> {
    const selecteddriverIdInLowerCase = this.selectedDriverId && this.selectedDriverId.toLowerCase();
    if (!driverId || selecteddriverIdInLowerCase === driverId) {
      this.showSpinner = false;
      return of([]);
    }
    const params = {
      search: driverId,
    };
    this.showSpinner = true;
    return this.dataService.driversAutocomplete(params).pipe(
      tap(() => (this.showSpinner = false)),
      map((res: any) => {
        const { drivers = [] } = res.data || {};
        return drivers;
      }),
      catchError(() => {
        this.showSpinner = false;
        return of([]);
      })
    );
  }

  public autoCompleteOptionSelected(event: any) {
    const value = event.option.value;
    if (value && typeof value === 'string') {
      this.selectedDriverId = value;
      this.driverSelection.emit(value);
    }
  }

  public clearInput() {
    this.inputControl.patchValue('');
    this.driverSelection.emit('');
    this.addAllDriversOption();
  }

  public addAllDriversOption() {
    if (!this.filteredDrivers?.length && this.inputControl.value === '' && !this.hideAllDrivers) {
      this.translate.get('All Drivers').subscribe((translatedText: string) => {
        this.filteredDrivers = [
          {
            driverId: translatedText,
            driverName: translatedText,
          },
        ];
      });
    }
  }
}
