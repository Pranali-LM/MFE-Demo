import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { TimerComponent, TimerState } from '../../../shared/components/timer/timer.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { EndSessionConfirmationComponent } from '../end-session-confirmation/end-session-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { ActivatedRoute } from '@angular/router';
import { CoachingCompleteModalComponent } from '../coaching-complete-modal/coaching-complete-modal.component';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Store } from '@ngrx/store';
import { State } from '@app-home/reducers';
import { getSideNavigationConfigState } from '@app-shared/reducers';
@Component({
  selector: 'app-coaching-session',
  templateUrl: './coaching-session.component.html',
  styleUrls: ['./coaching-session.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class CoachingSessionComponent implements OnInit {
  @ViewChild(TimerComponent, { static: true }) private timerComponent: TimerComponent;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public isLinear = true;
  public interval;
  public timeLeft: number = 60;
  public driverStatsLoader = true;
  public driverId;
  public driverStatsResponse: any;
  public noActionTimerState: TimerState = {
    count: true,
    countup: true,
    value: 0,
    speed: 1000,
    increase: 1,
    pauseAt: 0,
    format: true,
  };
  public driverDetails = {};
  public coachingDetails;
  public completedCoacingSession = false;
  public time: number = 0;
  public timer: any;
  public startTime = new Date(Date.now());
  public coachedIncidentList = [];
  public coachingCompleteLoader = false;
  public getCoachableIncidentLoader = false;
  public isSideNavOpen = false;
  public fleetId: string;

  constructor(
    public dataService: DataService,
    private driverService: DriverManagementService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private gtmService: GoogleTagManagerService,
    private store: Store<State>
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      this.driverId = params.driverId;
      this.getCoachableIncidents();
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.store
      .select(getSideNavigationConfigState)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sideNavigationConfigState) => {
        const { currentWindowWidth, isSideNavOpen } = sideNavigationConfigState;
        if (currentWindowWidth > 1024 && isSideNavOpen === false) {
          this.isSideNavOpen = false;
        } else if (currentWindowWidth > 1024 && isSideNavOpen) {
          this.isSideNavOpen = true;
        }
      });
  }

  public endSession() {}

  public navigateBack() {
    this.dataService.back();
  }

  private getCoachableIncidents() {
    this.getCoachableIncidentLoader = true;
    const params = {
      fleetId: this.fleetId,
    };
    this.driverService
      .getCoachableIncidents(this.driverId, params)
      .pipe(
        finalize(() => {
          this.getCoachableIncidentLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          if (res) {
            this.driverDetails = res;
          }
        },
        () => {
          this.driverDetails = {};
        }
      );
  }

  public openEndSessionConfirmationDialog(source: string) {
    switch (source) {
      case 'ENDSESSION':
        this.gtmService.openEndSessionDialogCoachingSession('END SESSION');
        break;
      case 'BackSpace':
        this.gtmService.openEndSessionDialogCoachingSession('BACK SPACE');
        break;
    }
    if (this.completedCoacingSession) {
      this.navigateBack();
    } else {
      const dialogRef = this.dialog.open(EndSessionConfirmationComponent, {
        width: '480px',
        minHeight: '240px',
        disableClose: true,
        position: { top: '24px' },
        autoFocus: false,
      });

      dialogRef.afterClosed().subscribe((isEndingSession: boolean) => {
        if (isEndingSession) {
          this.gtmService.gotoCoachingPageFromEndSession();
          this.navigateBack();
        }
      });
    }
  }

  public clickPrevious(stepper: MatStepper) {
    this.gtmService.coachingSessionPreviousButton();
    stepper.previous();
  }

  public clickNext(stepper: MatStepper) {
    stepper.next();
  }

  public next() {
    this.gtmService.coachingSessionNextButton();
  }

  public onCoachingNext() {}

  public nextButton(event) {
    let totalCoachedIncidentCount = 0;
    let totalSkippedIncidentCount = 0;
    let coachingSummary = [];
    this.coachedIncidentList = [];
    for (let key in event.coachDetails) {
      let value = event.coachDetails[key];
      const coachedIncidentCount = value.filter((event) => event.status === 'COACHED').length || 0;
      totalCoachedIncidentCount = totalCoachedIncidentCount + coachedIncidentCount;
      const skippedIncidentCount = value.filter((event) => event.status === 'SKIPPED').length || 0;
      totalSkippedIncidentCount = totalSkippedIncidentCount + skippedIncidentCount;
      let count = {
        incidentName: key,
        coachedIncidentCount: coachedIncidentCount,
        skippedIncidentCount: skippedIncidentCount,
      };
      coachingSummary.push(count);

      value.map((e) => {
        const obj = {
          tripId: e.tripId,
          eventIndex: e.eventIndex,
          status: e.status,
        };
        this.coachedIncidentList.push(obj);
      });
    }

    this.coachingDetails = {
      incidentSummery: coachingSummary,
      totalCoachedIncidentCount: totalCoachedIncidentCount,
      totalSkippedIncidentCount: totalSkippedIncidentCount,
    };
    this.clickNext(event.stepper);
  }

  public coachingComplete(event) {
    this.timerComponent.pause();
    const body = {
      driverId: this.driverId,
      sessionNote: event?.coachingSummary,
      startTime: this.startTime,
      endTime: new Date(Date.now()),
      coachedBy: {
        name: event?.coachedByDetails?.name,
        email: event?.coachedByDetails?.loginName,
        userType: event?.coachedByDetails?.loginType,
      },
      events: this.coachedIncidentList,
    };
    const date1 = new Date(body.startTime);
    const date2 = new Date(body.endTime);
    const diff = date2.getTime() - date1.getTime();

    let msec = diff;
    const hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    const ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    this.gtmService.coachingSessionCompleteCoaching(hh + ':' + mm + ':' + ss);
    this.createCoachingSession(body);
  }

  public createCoachingSession(body) {
    this.coachingCompleteLoader = true;
    const params = {
      fleetId: this.fleetId,
    };
    this.driverService
      .createCoachingSession(params, body)
      .pipe(
        finalize(() => {
          this.coachingCompleteLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          if (res) {
            this.completedCoacingSession = true;
            this.openCoachingCompletedSuccessDialog();
          }
        },
        () => {
          this.completedCoacingSession = false;
        }
      );
  }

  public openCoachingCompletedSuccessDialog() {
    this.dialog.open(CoachingCompleteModalComponent, {
      width: '480px',
      minHeight: '240px',
      position: {
        top: '24px',
      },
      disableClose: true,
      autoFocus: false,
    });
  }
}
