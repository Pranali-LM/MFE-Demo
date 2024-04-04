import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { ActivatedRoute } from '@angular/router';
import { MEDIA_SOURCES_ENUM } from '@app-core/constants/constants';
import { MapService } from '@app-core/services/map/map.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
// import { IncidentDetailsService } from '@app-incident-details/services/incident-details/incident-details.service';
// import { DiscardIncidentComponent } from '@app-shared/components/discard-incident/discard-incident.component';
// import { IncidentFeedbackComponent } from '@app-shared/components/incident-feedback/incident-feedback.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DataService } from '@app-core/services/data/data.service';
import { EVENTS_CONFIG } from '@app-core/constants/constants';
import { FormControl } from '@angular/forms';
import { IncidentDetailsService } from '../../services/incident-stats.service';

@Component({
  selector: 'app-incident-details',
  templateUrl: './incident-details.component.html',
  styleUrls: ['./incident-details.component.scss'],
})
export class IncidentDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  public mediaType = 'VIDEO';
  public videoRef: HTMLVideoElement;
  public videoRef2: HTMLVideoElement;
  public incidentMarker = [];
  public mapInitialCoordinates: any = {};
  public mapIcon: any = {};
  public videoSeekerTranslateVal = 0;
  public incidentMedia1: string;
  public incidentMedia1Label: string;
  public incidentMedia2: string;
  public incidentMedia2Label: string;
  public videoLoader = true;
  public isMediaStream1 = false;
  public isFullscreen = false;
  public isVideoPlaying = false;
  public isMediaAvailable = false;
  public loader = true;
  public incidentDetails: any;
  public accelerationDetails: any;
  public isTouchDevice = false;
  public commentList = [];
  public eventsConfig;
  public tripId: string;
  public driverId: string;
  public eventIndex: number;
  public driverName: string;
  public incidentType: string;
  public eventTagList = [];
  public workflowTags = [];
  public tagListLoader = true;
  public workflowTagLoader = true;
  public fleetId: string;
  public mapTypeFormCntrl = new FormControl('map');
  public customMapOptions = {
    recenterButton: {
      display: 'inline-block',
      top: '84px',
      left: '10px',
      color: '#000000',
    },
    fullscreenButton: {
      top: '128px',
      left: '10px',
      display: 'inline-block',
    },
  };
  public accelLoader = true;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cdRef: ChangeDetectorRef,
    private mapService: MapService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private snackbarService: SnackBarService,
    // private dialog: MatDialog,
    private incidentDetailsService: IncidentDetailsService,
    public dataService: DataService
  ) {
    this.mapIcon.eventIcon = this.mapService.getIcon();
  }

  public ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      const { tripId = '', driverId = '', eventIndex = '', driverName = '', incidentType = '', workflowTags = '' } = params || {};
      this.tripId = tripId;
      this.driverId = driverId;
      this.eventIndex = eventIndex;
      this.driverName = driverName;
      this.incidentType = incidentType;
      this.workflowTags = workflowTags;
      this.getIncidentDetails(params);
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.fleetId = value;
      }
    });

    this.mapTypeFormCntrl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      if (value === 'accel') {
        this.getAccelMeterData();
      } else if (value === 'map') {
        this.setData();
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public ngAfterViewInit() {
    this.videoRef = document.getElementById('incidentVideo') as HTMLVideoElement;

    this.videoLoader = true;
    setTimeout(() => {
      if (this.videoRef) {
        this.videoRef.onended = () => {
          this.isVideoPlaying = false;
        };
      }
      if (this.videoRef2) {
        this.videoRef2.onended = () => {
          this.isVideoPlaying = false;
        };
      }
      this.videoLoader = false;
    }, 1000);

    this.cdRef.detectChanges();
  }

  public getIncidentDetails(params: any) {
    const { tripId, driverId, eventIndex } = params || {};
    this.loader = true;
    return new Promise(() => {
      const params = {
        tripId,
        driverId,
        eventIndex,
      };
      this.incidentDetailsService
        .getIncidentDetails(params)
        .pipe(
          finalize(() => {
            this.loader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res) => {
            this.incidentDetails = res;
            if (this.incidentDetails) {
              this.setData();
              this.getTagListForEvent();
            }
          },
          () => {}
        );
    });
  }

  public getTagListForEvent(): Promise<void> {
    this.tagListLoader = true;
    return new Promise((resolve) => {
      const params = {
        fleetId: this.fleetId,
      };
      this.incidentDetailsService
        .getTagListForEvent(params, this.incidentDetails.tripId)
        .pipe(
          finalize(() => {
            resolve();
            this.tagListLoader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res: any = {}) => {
            if (res) {
              this.eventTagList = res || [];
            }
          },
          (error) => {
            console.log(error);
          }
        );
    });
  }

  public setData() {
    const {
      mediaFiles = [],
      eventVideoFilename = '',
      eventVideoFile = '',
      latitude = 0,
      longitude = 0,
      eventType = '',
      speedSign = {},
      stopSign = {},
      firstLocation = {},
      commentsV2 = [],
    } = this.incidentDetails;

    const { latitude: timelapseLat = 0, longitude: timelapseLong = 0 } = firstLocation;

    const { latitude: speedSignLat = 0, longitude: speedSignLong = 0 } = speedSign;
    const { latitude: stopSignLat = 0, longitude: stopSignLong = 0 } = stopSign;
    let lat = null;
    let long = null;

    this.commentList = commentsV2;

    switch (eventType) {
      case 'Traffic-Speed-Violated': {
        lat = speedSignLat || latitude;
        long = speedSignLong || longitude;
        break;
      }
      case 'Traffic-STOP-Sign-Violated': {
        lat = stopSignLat || latitude;
        long = stopSignLong || longitude;
        break;
      }
      default: {
        lat = latitude || timelapseLat;
        long = longitude || timelapseLong;
      }
    }

    // media files
    if (mediaFiles && mediaFiles.length) {
      if (mediaFiles.length === 1) {
        this.incidentMedia1 = mediaFiles[0].mediaFile;
      } else {
        this.incidentMedia1 = mediaFiles[0].mediaFile;
        this.incidentMedia1Label = MEDIA_SOURCES_ENUM[mediaFiles[0].source];
        this.incidentMedia2 = mediaFiles[1].mediaFile;
        this.incidentMedia2Label = MEDIA_SOURCES_ENUM[mediaFiles[1].source];
      }
    } else {
      this.incidentMedia1 = eventVideoFilename || eventVideoFile;
    }

    this.assignMediaType();
    this.isMediaAvailable = true;

    setTimeout(() => {
      // incident marker
      const marker = this.createMarker(lat, long);
      this.incidentMarker = [];
      if (marker) {
        this.incidentMarker.push(marker);
      }
    }, 100);

    this.playVideo();

    setTimeout(() => {
      this.playVideo();
    }, 100);
  }

  public assignMediaType() {
    if (this.incidentMedia1.indexOf('.jpg') > -1 || this.incidentMedia1.indexOf('.jpeg') > -1 || this.incidentMedia1.indexOf('.png') > -1) {
      this.mediaType = 'IMAGE';
      return;
    }
    if (this.incidentMedia1.indexOf('.mp4') > -1) {
      this.mediaType = 'VIDEO';
      return;
    }
  }

  public resetData() {
    this.isVideoPlaying = false;
    this.incidentMarker = [];
    this.incidentMedia1 = null;
    this.incidentMedia2 = null;
    this.videoSeekerTranslateVal = 0;
    if (this.videoRef) {
      this.videoRef.currentTime = 0;
    }
    if (this.videoRef2) {
      this.videoRef2.currentTime = 0;
    }
  }

  private createMarker(latitude: any, longitude: any): L.Marker {
    if (latitude && longitude) {
      this.mapInitialCoordinates = { latitude, longitude };
      const marker = this.mapService.getMarker(+latitude, +longitude, this.mapIcon.eventIcon);
      return marker;
    }
  }

  public switchMedia() {
    this.isMediaStream1 = !this.isMediaStream1;
  }

  public setVideoPlayTime(currentSliderVal: number) {
    const { duration = 1 } = this.videoRef || {};
    this.videoRef.currentTime = (currentSliderVal / 100) * duration;
    if (this.videoRef2) {
      this.videoRef2.currentTime = (currentSliderVal / 100) * duration;
    }
    if (currentSliderVal > 0 && currentSliderVal < 100) {
      this.pauseVideo();
    }
  }

  public onSliderChange(event: MatSliderChange) {
    this.setVideoPlayTime(event.value);
  }

  public checkFullscreen() {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
      this.resetVideo();
    });
    document.addEventListener('mozfullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
      this.resetVideo();
    });
    document.addEventListener('webkitfullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
      this.resetVideo();
    });
    document.addEventListener('msfullscreenchange', () => {
      this.isFullscreen = document['fullscreenElement'] ? true : false;
      this.resetVideo();
    });
  }

  public resetVideo() {
    if (this.videoRef && !this.isFullscreen) {
      this.videoRef.currentTime = 0;
      this.playVideo();
      this.isVideoPlaying = true;
    }
  }

  public playAction() {
    if (this.incidentMedia1 && this.incidentMedia2) {
      this.videoRef.play();
      this.videoRef2.play();
      this.videoRef.ontimeupdate = () => {
        this.updateSeeker();
      };
      this.videoRef2.play();
      this.videoRef2.currentTime = this.videoRef.currentTime;
    } else {
      if (this.videoRef) {
        this.videoRef.play();
        this.videoRef.ontimeupdate = () => {
          this.updateSeeker();
        };
      }
    }
    this.isVideoPlaying = true;
  }

  public playVideo() {
    this.videoLoader = true;
    this.isVideoPlaying = false;
    // video1
    this.videoRef = document.getElementById('incidentVideo') as HTMLVideoElement;
    if (this.videoRef && !this.incidentMedia2) {
      this.videoLoader = false;
      this.isVideoPlaying = true;
      this.videoRef.play();

      // update video seeker
      this.videoRef.ontimeupdate = () => {
        this.updateSeeker();
      };
    }

    // video2
    this.videoRef2 = document.getElementById('incidentVideo2') as HTMLVideoElement;
    if (this.videoRef && this.videoRef2) {
      let isVideo2Playing = false;
      this.videoRef2.oncanplay = () => {
        if (isVideo2Playing) {
          return;
        }
        isVideo2Playing = true;
        this.videoLoader = false;
        this.isVideoPlaying = true;

        if (this.videoRef && this.videoRef2) {
          this.videoRef.play();
          // update video seeker
          this.videoRef.ontimeupdate = () => {
            this.updateSeeker();
          };

          this.videoRef2.play();
          this.videoRef2.currentTime = this.videoRef.currentTime;
          this.isVideoPlaying = true;
        }
      };
    }
  }

  public pauseVideo() {
    this.isVideoPlaying = false;
    // video1
    const video1PlayPromise = this.videoRef.play();
    if (video1PlayPromise !== undefined) {
      video1PlayPromise
        .then(() => {
          this.videoRef.pause();
        })
        .catch(() => {
          this.videoRef.pause();
        });
    }
    // update video seeker
    this.videoRef.ontimeupdate = () => {
      this.updateSeeker();
    };

    // video2
    const videoRef2 = document.getElementById('incidentVideo2') as HTMLVideoElement;
    if (videoRef2) {
      videoRef2.currentTime = this.videoRef && this.videoRef.currentTime;
      const video2PlayPromise = videoRef2.play();
      if (video2PlayPromise !== undefined) {
        video2PlayPromise
          .then(() => {
            videoRef2.pause();
          })
          .catch(() => {
            videoRef2.pause();
          });
      }
    }
  }

  public updateSeeker() {
    const { duration: totalVideoDuration = 1, currentTime = 0 } = this.videoRef || {};
    this.videoSeekerTranslateVal = Number(((currentTime / totalVideoDuration) * 100).toFixed(0));

    if (this.videoSeekerTranslateVal === 100) {
      this.isVideoPlaying = false;
    }
  }

  public onPlaybackError() {
    this.pauseVideo();
    this.isMediaAvailable = false;
  }

  public toggleFullscreen(videoId: string) {
    this.isFullscreen = !this.isFullscreen;
    const videoRef = document.getElementById(videoId) as HTMLVideoElement;
    if (this.isFullscreen) {
      this.enterFullscreen(videoRef);
    } else {
      this.exitFullscreen();
    }
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document['webkitExitFullscreen']) {
      document['webkitExitFullscreen']();
    } else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    } else if (document['msExitFullscreen']) {
      document['msExitFullscreen']();
    } else {
      this.snackbarService.failure(this.translate.instant('incidentModalFullScreenNotSupported'));
    }
    this.resetVideo();
  }

  private enterFullscreen(ele) {
    if (ele.requestFullscreen) {
      ele.requestFullscreen();
    } else if (ele.webkitRequestFullscreen) {
      ele.webkitRequestFullscreen();
    } else if (ele.mozRequestFullScreen) {
      ele.mozRequestFullScreen();
    } else if (ele.msRequestFullscreen) {
      ele.msRequestFullscreen();
    } else {
      this.snackbarService.failure(this.translate.instant('incidentModalFullScreenNotSupported'));
    }
  }

  public openDiscardIncidentDialog() {
    // this.dialog.open(DiscardIncidentComponent, {
    //   position: { top: '24px' },
    //   width: '480px',
    //   height: '248px',
    //   autoFocus: false,
    // });
  }

  public openIncidentFeedbackDialog() {
    // this.dialog.open(IncidentFeedbackComponent, {
    //   position: { top: '24px' },
    //   width: '480px',
    //   height: '480px',
    //   autoFocus: false,
    // });
  }

  public navigateBack() {
    this.dataService.back();
  }

  public getAccelMeterData() {
    this.accelLoader = true;
    return new Promise(() => {
      const params = {
        tripId: this.tripId,
        driverId: this.driverId,
        eventIndex: this.eventIndex,
        includeInertialSensorData: true,
      };
      this.incidentDetailsService
        .getIncidentDetails(params)
        .pipe(
          finalize(() => {
            this.accelLoader = false;
          }),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          (res) => {
            this.accelerationDetails = res;
          },
          () => {}
        );
    });
  }
}
