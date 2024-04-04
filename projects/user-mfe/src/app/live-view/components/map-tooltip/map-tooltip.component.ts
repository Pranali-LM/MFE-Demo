import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { DeviceState } from '@app-live-view/models/live-view.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-map-tooltip',
  templateUrl: './map-tooltip.component.html',
  styleUrls: ['./map-tooltip.component.scss'],
})
export class MapTooltipComponent implements OnInit, OnDestroy {
  @Input()
  public data: any;

  public currentTimeZone: string;
  public currentDateFormat: string;
  public DeviceState = DeviceState;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private _dataService: DataService) {}

  public ngOnInit() {
    this._dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
      }
    });

    this._dataService._currentDateFormat.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
