import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, OnChanges } from '@angular/core';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EVENTS_CONFIG, MEDIA_SOURCES_ENUM } from '@app-core/constants/constants';
import { FormControl } from '@angular/forms';
import { DriverManagementService } from '@app-driver-management/services/driver-management.service';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';

@Component({
  selector: 'app-coachable-incidents',
  templateUrl: './coachable-incidents.component.html',
  styleUrls: ['./coachable-incidents.component.scss'],
})
export class CoachableIncidentsComponent implements OnInit, OnChanges {
  @Input()
  public isSideNavOpen: any;
  @Input() driverDetails;
  @Input()
  private stepper;
  @Output()
  public clickPrevious = new EventEmitter<any>();
  @Output()
  public clickNext = new EventEmitter<any>();
  public loader = false;
  public driverSevereViolations: any;
  public loadingDriverHighlights = false;
  public currentTimeZone: string;
  public currentDateFormat: string;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public mediaType = 'VIDEO';
  public videoRef: HTMLVideoElement;
  public videoRef2: HTMLVideoElement;
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
  public incidentDetails: any;
  public isTouchDevice = false;
  public eventsConfig;
  public validVoilations = [];
  public data;
  public coachedDetails;
  public currentIncidentDetails;
  public allVoilationIncidentList = [];
  public incidentIndex = 0;
  public diableSkipButton = false;
  public diableSkipAllButton = false;
  public disableCoachButton = false;
  public firstKey;
  public myFormControl;
  public skipAllLabel;
  public isAutoPlayOn = false;

  eventList: any[] = [
    { event: 'Harsh acceleration', count: 4 },
    { event: 'Cornering', count: 5 },
    { event: 'DIstracted Driving', count: 2 },
  ];
  isAudioSupported: any;
  presentIndex: number;
  autoTags: any;
  isVolumeEnabled: boolean;
  incidentMarker: any[];
  videoResolution: any;
  selectedVideoUrl: string = '';

  constructor(
    public dataService: DataService,
    private driverManagementService: DriverManagementService,
    private gtmService: GoogleTagManagerService,
    private translateService: TranslateService,
    private snackbarService: SnackBarService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };

    this.dataService._currentTimeZone.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.currentTimeZone = value;
      }
    });

    this.dataService._currentDateFormat.subscribe((value: string) => {
      if (value) {
        this.currentDateFormat = value;
      }
    });
    this.translateService.get('skipAllLabel').subscribe((translation: string) => {
      this.skipAllLabel = translation;
    });

    this.checkFullscreen();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.driverDetails.currentValue.eventCount) {
      this.getViolations();
    }
  }

  listClick(event) {
    this.myFormControl = new FormControl([event]);
    this.driverSevereViolations = {};
    const violations = this.allVoilationIncidentList[event];
    this.driverSevereViolations[event] = violations;
    this.incidentIndex = 0;
    this.data = {
      source: 'IncidentView',
      allEvents: violations,
      currentIndex: this.incidentIndex,
      showCoachingTab: false,
    };
    const { currentIndex = 0 } = this.data || {};
    // setting modal data
    this.driverManagementService.setData(currentIndex);
    this.resetData();
    this.setData(currentIndex);
  }

  public getViolations() {
    this.driverSevereViolations = {};
    for (let key in this.driverDetails.eventCount) {
      let value = this.driverDetails.eventCount[key];
      if (value > 0 && key !== 'total') {
        this.validVoilations.push({ eventType: key, value: value });
        let violations = this.driverDetails?.violations?.filter((e) => {
          return e.eventType === key;
        });

        for (let v in violations) {
          violations[v]['status'] = 'SKIPPED';
        }
        this.allVoilationIncidentList[key] = violations.slice(0, 5);
      }
    }
    this.firstKey = this.validVoilations[0]?.eventType;

    this.myFormControl = new FormControl([this.firstKey]);
    this.driverManagementService.setData(0);
    const violations = this.allVoilationIncidentList[this.firstKey];

    this.driverSevereViolations[this.firstKey] = violations;

    this.data = {
      source: 'IncidentView',
      allEvents: violations,
      currentIndex: this.incidentIndex,
      showCoachingTab: true,
    };
    const { currentIndex = 0 } = this.data || {};
    // setting modal data

    this.resetData();
    this.setData(currentIndex);
  }

  private resetData() {
    this.isVideoPlaying = false;
    this.incidentMarker = [];
    this.incidentMedia1 = null;
    this.incidentMedia2 = null;
    this.videoSeekerTranslateVal = 0;
    this.isVolumeEnabled = false;
    if (this.videoRef) {
      this.videoRef.currentTime = 0;
    }
    if (this.videoRef2) {
      this.videoRef2.currentTime = 0;
    }
  }

  public toggleFullscreen(videoId: string) {
    this.isFullscreen = !this.isFullscreen;
    const videoRef = document.getElementById(videoId) as HTMLVideoElement;
    if (this.isFullscreen) {
      this.enterFullscreen(videoRef);
      this.gtmService.toggleFullScreenIncidentDialog('Enabled');
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

  public resetVideo() {
    if (this.videoRef && !this.isFullscreen) {
      this.videoRef.currentTime = 0;
      this.playVideo();
      this.isVideoPlaying = true;
    }
    if (!this.isFullscreen) {
      this.gtmService.toggleFullScreenIncidentDialog('Disbled');
    }
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

  private setData(pageIndex: number) {
    const { allEvents = [] } = this.data || {};
    const {
      mediaFiles = [],
      eventVideoFilename = '',
      eventVideoFile = '',
      isDvrEvent = false,
      videoDetails = {},
      videoResolution = '',
      imageDetails = {},
    } = allEvents[pageIndex] || {};
    this.currentIncidentDetails = allEvents[pageIndex];
    const { audioEnabled = false } = videoDetails || {};
    this.isAudioSupported = audioEnabled;

    this.presentIndex = pageIndex;

    this.isVolumeEnabled = false;

    if (isDvrEvent && videoResolution) {
      this.videoResolution = videoResolution.split('x')[1] || undefined;
    } else {
      this.videoResolution = videoDetails.videoHeight || undefined;
    }

    this.videoResolution = imageDetails.imageHeight || undefined;

    // media files
    if (mediaFiles) {
      // TODO: This condition will always be false since mediafiles is an object
      if (mediaFiles.length) {
        if (mediaFiles.length === 1) {
          this.incidentMedia1 = mediaFiles[0].mediaFile;
        } else {
          this.incidentMedia1 = mediaFiles[0].mediaFile;
          this.incidentMedia1Label = MEDIA_SOURCES_ENUM[mediaFiles[0].source];
          this.incidentMedia2 = mediaFiles[1].mediaFile;
          this.incidentMedia2Label = MEDIA_SOURCES_ENUM[mediaFiles[1].source];
        }
      }
    } else {
      this.incidentMedia1 = eventVideoFilename || eventVideoFile;
    }

    this.assignMediaType();

    this.isMediaAvailable = true;
    this.playVideo();
    setTimeout(() => {
      this.playVideo();
    }, 100);
  }

  public assignMediaType() {
    if (
      this.incidentMedia1?.indexOf('.jpg') > -1 ||
      this.incidentMedia1?.indexOf('.jpeg') > -1 ||
      this.incidentMedia1?.indexOf('.png') > -1
    ) {
      this.mediaType = 'IMAGE';
      return;
    }
    if (this.incidentMedia1?.indexOf('.mp4') > -1) {
      this.mediaType = 'VIDEO';
      return;
    }
  }

  public playVideo() {
    this.videoLoader = true;
    this.isVideoPlaying = false;
    // video1
    this.videoRef = document.getElementById('incidentVideo') as HTMLVideoElement;
    if (this.videoRef && !this.incidentMedia2) {
      this.videoLoader = false;
      this.isVideoPlaying = true;
      this.videoRef.volume = this.isVolumeEnabled ? 1 : 0;
      this.videoRef?.load();
      this.videoRef?.play();

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
          this.videoRef2.volume = this.isVolumeEnabled ? 1 : 0;
          this.videoRef?.load();
          this.videoRef?.play();
          // update video seeker
          this.videoRef.ontimeupdate = () => {
            this.updateSeeker();
          };

          this.videoRef2.load();
          this.videoRef2.play();
          this.videoRef2.currentTime = this.videoRef.currentTime;
          this.isVideoPlaying = true;
        }
      };
    }
  }

  public updateSeeker() {
    const { duration: totalVideoDuration = 1, currentTime = 0 } = this.videoRef || {};
    this.videoSeekerTranslateVal = Number(((currentTime / totalVideoDuration) * 100).toFixed(0));

    if (this.videoSeekerTranslateVal === 100) {
      this.isVideoPlaying = false;
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

  public playIncident(event) {
    if (this.isVideoPlaying) {
      this.pauseVideo();
    }
    this.resetData();
    this.setData(event.index);
  }

  public skip() {
    this.gtmService.coachingSessionSkip();
    const type = this.currentIncidentDetails.eventType;
    this.allVoilationIncidentList[type][this.presentIndex]['status'] = 'SKIPPED';
    this.allVoilationIncidentList[type][this.presentIndex]['skipButtonClicked'] = true;
    if (this.presentIndex + 1 < this.allVoilationIncidentList[type].length) {
      this.driverManagementService.setData(this.presentIndex + 1);
      this.setData(this.presentIndex + 1);
    } else {
      const index = this.validVoilations?.findIndex((obj) => obj?.eventType === type);
      if (index < this.validVoilations.length - 1) {
        this.listClick(this.validVoilations[index + 1].eventType);
      } else {
        this.diableSkipAllButton = true;
      }
    }
  }

  public markCoached() {
    this.gtmService.coachingSessionMarkedAsCoached();
    const type = this.currentIncidentDetails.eventType;
    this.allVoilationIncidentList[type][this.presentIndex]['status'] = 'COACHED';
    this.allVoilationIncidentList[type][this.presentIndex]['markCoachButtonClicked'] = true;
    if (this.presentIndex + 1 < this.allVoilationIncidentList[type].length) {
      this.driverManagementService.setData(this.presentIndex + 1);
      this.setData(this.presentIndex + 1);
    } else {
      const index = this.validVoilations?.findIndex((obj) => obj?.eventType === type);
      if (index < this.validVoilations.length - 1) {
        this.listClick(this.validVoilations[index + 1].eventType);
      } else {
        this.diableSkipAllButton = true;
      }
    }
    this.skipAllLabel = 'SKIP REST';
  }

  public skipAll() {
    this.gtmService.coachingSessionSkipAll();
    const type = this.currentIncidentDetails.eventType;
    for (let i = this.presentIndex; i < this.allVoilationIncidentList[type].length; i++) {
      this.allVoilationIncidentList[type][i]['status'] = 'SKIPPED';
    }
    const index = this.validVoilations.findIndex((obj) => obj.eventType === type);
    if (index < this.validVoilations.length - 1) {
      this.listClick(this.validVoilations[index + 1].eventType);
    } else {
      this.diableSkipAllButton = true;
    }
  }

  public onPrevious() {
    this.clickPrevious.emit(this.stepper);
  }

  public onNext() {
    const data = {
      stepper: this.stepper,
      coachDetails: this.allVoilationIncidentList,
    };
    this.clickNext.emit(data);
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

  public autoPlayEnable(event) {
    if (event?.checked) {
      this.isAutoPlayOn = true;
      this.playVideo();
    } else {
      this.isAutoPlayOn = false;
    }
  }
}
