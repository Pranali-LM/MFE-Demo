import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appRefreshDatepicker]',
})
export class RefreshDatepickerDirective implements OnInit, OnDestroy {
  @Input('appRefreshDatepicker')
  private formControl: FormControl;

  private ngUnsubscribe = new Subject<void>();

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.refresh());
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private refresh() {
    if (this.formControl) {
      const currentValue = this.formControl.value;
      this.formControl.setValue(currentValue, { emitEvent: false });
    }
  }
}
