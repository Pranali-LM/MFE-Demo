import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  LIVESTREAM_DEFAULT_PIP_MAIN_FRAME,
  LIVESTREAM_DEFAULT_VIDEO_RESOLUTION,
  LIVESTREAM_DEFAULT_VIDEO_TYPE,
  LIVESTREAM_VIDEO_RESOLUTIONS,
  VIDEO_FORMATS,
} from '@app-core/constants/constants';
import { dirtyCheck, DirtyComponent } from '@app-core/models/dirty-check';
import {
  LivestreamUnitSystem,
  RequestLivestreamBody,
  RequestLivestreamConflict,
  RequestLivestreamResp,
  ReviewLivestreamBody,
  StopLivestreamBody,
} from '@app-core/models/livestream';
import { AccessService } from '@app-core/services/access/access.service';
import { LivestreamService } from '@app-core/services/livestream/livestream.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { LivestreamTimerComponent } from '../livestream-timer/livestream-timer.component';
import { TimerState } from '../timer/timer.component';
import { DataService } from '@app-core/services/data/data.service';
import { MDVR_AVAILBLE_VIEWS } from '@app-assets/constants/assets.constants';
import { MatSelectChange } from '@angular/material/select';
import { MDVR_COLLAGE_CONFIG, MDVR_COLLAGE_SORTING_ARR } from '@app-request-video/constants/request-video.constants';

interface LivestreamModalData {
  assetId?: string;
  deviceId?: string;
  tripId: string;
  asset: any;
  recordedInfo: any[];
}

interface LiveStreamRequestFg {
  videoResolution: FormControl<string>;
  videoFormat: FormControl<string>;
  pipVideoFormat: FormControl<string>;
  mdvrViews?: FormControl<string | string[]>;
}

@Component({
  selector: 'app-livestream-modal',
  templateUrl: './livestream-modal.component.html',
  styleUrls: ['./livestream-modal.component.scss'],
})
export class LivestreamModalComponent implements OnInit, OnDestroy, DirtyComponent {
  @ViewChild('livestreamTimer', { static: true })
  private livestreamTimer: LivestreamTimerComponent;

  public isDirty$ = of(false);
  public livestreamResolutions = LIVESTREAM_VIDEO_RESOLUTIONS;
  public livestreamVideoFormats = VIDEO_FORMATS.filter((v) => v.value !== 'separate');
  public livestreamForm = this.fb.group<LiveStreamRequestFg>({
    videoResolution: this.fb.control(LIVESTREAM_DEFAULT_VIDEO_RESOLUTION, [Validators.required]),
    videoFormat: this.fb.control(LIVESTREAM_DEFAULT_VIDEO_TYPE, [Validators.required]),
    pipVideoFormat: this.fb.control({ value: LIVESTREAM_DEFAULT_PIP_MAIN_FRAME, disabled: true }),
  });
  public livestreamDetails: RequestLivestreamResp;
  public conflictStreamId: string;
  public errorMessage: string;
  public isRequestingLivestream = false;
  public sessionExpired = false;
  public verifySessionInterval = 5 * 60;
  public verifySession = false;
  public showReviewActionDialog = false;
  public enabledRetryOnFailure = true;
  public fleetId: string;
  public noActionTimerState: TimerState = {
    count: true,
    countup: false,
    value: 30,
    speed: 1000,
    increase: 1,
    pauseAt: 0,
  };
  public availableMdvrViews = [];
  public isEvoCamera: boolean;

  private ngUnsubscribe = new Subject<void>();
  private unsubscribeLivestreamReq = new Subject<void>();
  private ngUnsubscribeIsDirty = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<LivestreamModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LivestreamModalData,
    private fb: FormBuilder,
    private livestreamService: LivestreamService,
    private snackBarService: SnackBarService,
    public translate: TranslateService,
    private accessService: AccessService,
    private dataService: DataService
  ) {}

  public ngOnInit() {
    this.subscribeForVideoFormatChange();
    this.refreshIsDirty();
    this.requestLivestream();

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.checkAssetForMdvrSupport(this.data.asset);
  }

  public ngOnDestroy() {
    if (this.livestreamDetails && !this.conflictStreamId) {
      this.snackBarService.success(this.translate.instant('liveStreamModalStoppingLiveStream'));
      this.stopLivestream().subscribe(() => {
        this.snackBarService.success(this.translate.instant('liveStreamModalStoppedLiveStream'));
      });
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeLivestreamReq.next();
    this.unsubscribeLivestreamReq.complete();
    this.unsubscribeFromValueChanges();
  }

  private unsubscribeFromValueChanges() {
    this.ngUnsubscribeIsDirty.next();
    this.ngUnsubscribeIsDirty.complete();
  }

  private refreshIsDirty() {
    const sourceFormValue = this.livestreamForm.getRawValue();
    // Unsubscribe from previously subscribed valueChanges
    this.ngUnsubscribeIsDirty.next();
    this.isDirty$ = this.livestreamForm.valueChanges.pipe(takeUntil(this.ngUnsubscribeIsDirty), dirtyCheck(of(sourceFormValue)));
  }

  private subscribeForVideoFormatChange() {
    const videoFormatControl = this.livestreamForm.get('videoFormat');
    videoFormatControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((videoFormat) => {
      if (videoFormat === 'pictureInPictureRoadSide') {
        this.livestreamForm.patchValue({ pipVideoFormat: 'road' }, { emitEvent: false });
      } else if (videoFormat === 'pictureInPictureDriverSide') {
        this.livestreamForm.patchValue({ pipVideoFormat: 'driver' }, { emitEvent: false });
      }
    });
  }

  private resetState() {
    this.isRequestingLivestream = true;
    this.errorMessage = null;
    this.enabledRetryOnFailure = true;
    this.unsubscribeLivestreamReq.next();
  }

  private requestLivestream() {
    this.resetState();
    this.livestreamTimer.pause();
    let livestreamApiRequests: Observable<HttpResponse<RequestLivestreamResp>>;
    if (this.livestreamDetails) {
      livestreamApiRequests = this.stopLivestream().pipe(
        switchMap(() => this.startLivestream()),
        catchError(() => {
          this.livestreamDetails = null;
          this.errorMessage = 'Failed to request livestream. Please try again';
          return EMPTY;
        })
      );
    } else {
      livestreamApiRequests = this.startLivestream();
    }
    livestreamApiRequests
      .pipe(
        takeUntil(this.unsubscribeLivestreamReq),
        finalize(() => {
          this.isRequestingLivestream = false;
        })
      )
      .subscribe(
        (data) => {
          this.livestreamDetails = data.body;
          this.livestreamTimer.start();
        },
        (err: HttpErrorResponse) => {
          this.livestreamDetails = null;
          if (err.status === 409) {
            const conflicError = err.error as RequestLivestreamConflict;
            this.conflictStreamId = conflicError.conflictingRequestId;
            this.livestreamForm.disable();
            this.unsubscribeFromValueChanges();
            this.showReviewActionDialog = true;
          } else if (err.status === 406) {
            this.errorMessage = this.translate.instant('liveStreamModalMonthlyMinsExhausted');
            this.enabledRetryOnFailure = false;
          } else {
            this.errorMessage = 'Failed to request livestream. Please try again';
          }
        }
      );
  }

  private checkAssetForMdvrSupport(assetDetails: any) {
    const { plusPackages } = assetDetails || {};
    const { recordedInfo = [] } = this.data;
    this.isEvoCamera = recordedInfo.some((r) => r.source.startsWith('TVI') || r.source.startsWith('UVC'));
    recordedInfo.sort((a, b) => {
      const index1 = MDVR_COLLAGE_SORTING_ARR.findIndex((s) => s === a.source);
      const index2 = MDVR_COLLAGE_SORTING_ARR.findIndex((s) => s === b.source);
      return index1 - index2;
    });
    this.availableMdvrViews = recordedInfo.map((r) => {
      // TODO: remove || after sdk starts sending view in recordedInfo
      const view = r.view || r.source;
      const mdvrView = {
        source: r.source,
        view,
        viewLabel: this.getMdvrViewLabel(view),
      };
      return mdvrView;
    });

    if (plusPackages.includes('MDVR') && this.isEvoCamera) {
      this.livestreamVideoFormats = [
        ...VIDEO_FORMATS,
        {
          value: 'MDVR',
          text: 'Multi-View',
        },
      ];
    }
  }

  private startLivestream() {
    const { videoResolution, videoFormat, pipVideoFormat: videoTypeMainFrame, mdvrViews } = this.livestreamForm.getRawValue();
    const { deviceId, tripId } = this.data;
    let collage: string;
    let selectedMdvrSources: string[];

    const videoType =
      videoFormat === 'pictureInPictureRoadSide' || videoFormat === 'pictureInPictureDriverSide' ? 'pictureInPicture' : videoFormat;

    if (videoType === 'MDVR') {
      const mdvrViewsArr: string[] = this.isEvoCamera ? [...mdvrViews] : [mdvrViews as string];
      selectedMdvrSources = mdvrViewsArr.map((view) => this.availableMdvrViews.find((v2) => v2.view === view).source);
      selectedMdvrSources.sort((a, b) => MDVR_COLLAGE_SORTING_ARR.indexOf(a) - MDVR_COLLAGE_SORTING_ARR.indexOf(b));
      const collageConfig = MDVR_COLLAGE_CONFIG.find((c) => c.validSources === selectedMdvrSources.length);
      collage = collageConfig.collage;
    }

    const unitSystem = this.accessService.currentMetricUnit === 'Kilometers' ? LivestreamUnitSystem.Metric : LivestreamUnitSystem.Imperial;
    const body: RequestLivestreamBody = {
      ...(deviceId ? { deviceId } : { tripId }),
      videoType,
      ...(videoType === 'pictureInPicture' ? { videoTypeMainFrame } : {}),
      unitSystem,
      ...(collage ? { collage, sources: selectedMdvrSources, resolution: videoResolution } : { videoResolution }),
    };
    return this.livestreamService.requestLivestream(body);
  }

  private stopLivestream() {
    const body: StopLivestreamBody = {
      streamRequestId: this.livestreamDetails.streamRequestId,
    };
    return this.livestreamService.stopLivestream(body);
  }

  private reviewLivestream() {
    const body: ReviewLivestreamBody = {
      streamRequestId: this.conflictStreamId,
    };
    this.resetState();
    this.showReviewActionDialog = false;
    this.livestreamService
      .reviewLiveStream(body)
      .pipe(
        takeUntil(this.unsubscribeLivestreamReq),
        finalize(() => {
          this.isRequestingLivestream = false;
        })
      )
      .subscribe(
        (data) => {
          this.livestreamDetails = {
            streamRequestId: this.conflictStreamId,
            streamSessionURL: data.streamSessionURL,
          };
          this.livestreamTimer.start();
        },
        () => {
          this.livestreamDetails = null;
          this.errorMessage = 'Failed to request livestream. Please try again';
        }
      );
  }

  public onReRequestLivestreamAction() {
    this.refreshIsDirty();
    this.requestLivestream();
  }

  public hlsErrorHandler() {
    this.errorMessage = 'Something went wrong. Please try again';
    this.enabledRetryOnFailure = true;
  }

  public continueStreaming() {
    this.verifySession = false;
  }

  public verifySessionTimerAlert() {
    this.verifySession = true;
  }

  public onNoActionTimerPause() {
    this.onCloseAction();
  }

  public onRetryLivestreamAction() {
    if (this.conflictStreamId) {
      this.reviewLivestream();
    } else {
      this.requestLivestream();
    }
  }

  public onCloseAction() {
    this.dialogRef.close();
  }

  public onReviewLivestream() {
    const liveStreamDetailsParams = { streamRequestId: this.conflictStreamId };
    this.reviewLivestream();

    this.livestreamService
      .getLivestreamDetails(liveStreamDetailsParams)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((streamDetails) => {
        const { videoType, videoTypeMainFrame } = streamDetails;
        let videoFormat = videoType;
        if (videoType === 'pictureInPicture') {
          videoFormat = videoTypeMainFrame === 'road' ? 'pictureInPictureRoadSide' : 'pictureInPictureDriverSide';
        }

        this.livestreamForm.patchValue({
          videoResolution: streamDetails.videoResolution,
          videoFormat,
          pipVideoFormat: streamDetails.videoTypeMainFrame,
        });
      });
  }

  public onVideoFormatChange(event: MatSelectChange) {
    const videoFormat = event.value;
    const videoResolutionCtrl = this.livestreamForm.get('videoResolution');
    if (videoFormat === 'MDVR' && this.isEvoCamera) {
      this.livestreamForm.addControl('mdvrViews', this.fb.control('', [Validators.required]));
      videoResolutionCtrl.reset();
      videoResolutionCtrl.disable();
    } else {
      this.livestreamResolutions = LIVESTREAM_VIDEO_RESOLUTIONS;
      videoResolutionCtrl.enable();
      this.livestreamForm.removeControl('mdvrViews');
    }
  }

  public onMdvrViewsSelection(event: MatSelectChange) {
    const selectedViews = event.value;
    const videoResolutionCtrl = this.livestreamForm.get('videoResolution');
    if (this.isEvoCamera) {
      videoResolutionCtrl.reset();
      if (selectedViews.length) {
        videoResolutionCtrl.enable();
        const collageConfig = MDVR_COLLAGE_CONFIG.find((c) => c.validSources === selectedViews.length);
        this.livestreamResolutions = collageConfig.liveStreamResolution || collageConfig.resolution;
      } else {
        videoResolutionCtrl.disable();
      }
    }
  }

  public getMdvrViewLabel(view: string) {
    if (!view) {
      return '';
    }
    if (view === 'ROAD') {
      return 'Road';
    } else if (view === 'DRIVER') {
      return 'Driver';
    } else {
      return MDVR_AVAILBLE_VIEWS.find((v) => v.value === view)?.label || view;
    }
  }
}
