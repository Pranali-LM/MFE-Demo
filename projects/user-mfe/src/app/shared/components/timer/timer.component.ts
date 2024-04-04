import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { interval, merge, NEVER, Subject } from 'rxjs';
import { mapTo, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

export interface TimerState {
  count: boolean;
  countup: boolean;
  value: number;
  speed: number;
  increase: number;
  pauseAt?: number;
  format?: boolean;
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input()
  public state: TimerState;
  @Output()
  private paused = new EventEmitter();

  private pause$ = new Subject<void>();
  private start$ = new Subject<void>();
  private reset$ = new Subject<void>();
  private ngUnsubscribe = new Subject<void>();
  private defaultState: TimerState = {
    count: false,
    countup: true,
    value: 0,
    speed: 1000,
    increase: 0,
  };

  public counter: number;

  constructor() {}

  public ngOnInit() {
    const startState: TimerState = { ...this.defaultState, ...this.state };
    const events$ = merge(
      this.start$.pipe(mapTo({ count: true })),
      this.pause$.pipe(mapTo({ count: false })),
      this.reset$.pipe(mapTo({ value: 0 }))
    );
    const timer$ = events$.pipe(
      startWith(startState),
      scan((state: TimerState, curr: TimerState): TimerState => ({ ...state, ...curr })),
      tap((state: TimerState) => this.setValue(state.value)),
      switchMap((state: TimerState) =>
        state.count
          ? interval(state.speed).pipe(
              tap((_) => (state.value += state.countup ? state.increase : -state.increase)),
              tap((_) => {
                this.setValue(state.value);
                if (state.pauseAt !== null && state.pauseAt !== undefined && state.pauseAt === state.value) {
                  this.pause();
                  this.paused.emit();
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
    this.counter = val;
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
