import { Component, OnDestroy, OnInit } from '@angular/core';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.css'],
})
export class NetworkStatusComponent implements OnInit, OnDestroy {
  public onlineEvent: Observable<Event>;
  public offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];

  constructor(private snackbarService: SnackBarService, public translate: TranslateService) {}

  public ngOnInit() {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(
      this.onlineEvent.subscribe(() => {
        this.snackbarService.success(this.translate.instant('networkStatusOnline'));
      })
    );

    this.subscriptions.push(
      this.offlineEvent.subscribe(() => {
        // eslint-disable-next-line @typescript-eslint/quotes
        this.snackbarService.failure(this.translate.instant('networkStatusOffline'), { duration: 30000 });
      })
    );
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
