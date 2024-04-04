import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '@app-core/services/data/data.service';

@Component({
  selector: 'app-asset-configuration',
  templateUrl: './asset-configuration.component.html',
  styleUrls: ['./asset-configuration.component.scss'],
})
export class AssetConfigurationComponent implements OnInit, OnDestroy {
  public fleetId: string;
  public isDirty$: Observable<boolean> = of(false);
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private dataService: DataService) {}

  public ngOnInit() {
    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Function bound to formChanged Event emitted by duty-type-configuration component.
   *
   * Event emitted on each change of form values.
   * TODO: Find a better approach to access isDirty$ observable of child component.
   */
  public onFormChanged(e: boolean) {
    this.isDirty$ = of(e);
  }
}
