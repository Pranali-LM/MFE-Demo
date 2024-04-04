import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, merge, NEVER, Subject } from 'rxjs';
import { mapTo, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

interface State {
  count: boolean;
  value: number;
}

@Component({
  selector: 'app-livestream-timer',
  templateUrl: './livestream-timer.component.html',
  styleUrls: ['./livestream-timer.component.scss'],
})
export class LivestreamTimerComponent implements OnInit, OnDestroy {
  @Input()
  private alertInterval: number;
  @Output()
  private intervalAlert = new EventEmitter<number>();

  public elapsedTime = 0;

  private pause$ = new Subject<void>();
  private start$ = new Subject<void>();
  private reset$ = new Subject<void>();
  private ngUnsubscribe = new Subject<void>();

  constructor() {}

  public ngOnInit() {
    const events$ = merge(
      this.start$.pipe(mapTo({ count: true })),
      this.pause$.pipe(mapTo({ count: false })),
      this.reset$.pipe(mapTo({ value: 0 }))
    );
    const timer$ = events$.pipe(
      startWith({ count: false, value: 0 }),
      scan((state: State, curr: State): State => ({ ...state, ...curr })),
      tap((state: State) => this.setValue(state.value)),
      switchMap((state: State) =>
        state.count
          ? interval(1000).pipe(
              tap((_) => (state.value += 1)),
              tap((_) => {
                this.setValue(state.value);
                if (this.alertInterval && state.value && state.value % this.alertInterval === 0) {
                  this.intervalAlert.emit(state.value);
                }
              })
            )
          : NEVER
      )
    );
    timer$.pipe(takeUntil(this.ngUnsubscribe)).subscribe();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private setValue(val: number) {
    this.elapsedTime = val;
  }

  public start() {
    this.start$.next();
  }

  public pause() {
    this.pause$.next();
  }

  public reset() {
    this.reset$.next();
  }
}
