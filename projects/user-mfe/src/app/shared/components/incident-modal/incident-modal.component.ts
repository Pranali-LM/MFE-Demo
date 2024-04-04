import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSliderChange } from '@angular/material/slider';
import {
  BREAKPOINTS_MEDIUM,
  BREAKPOINTS_SMALL,
  EVENT_TAG_LIST,
  EVENTS_CONFIG,
  MEDIA_SOURCES_ENUM,
  AUTO_TAGS_LIST,
  EVENT_TAG_KEYS,
  FLEETMANAGER_MAX_COMMENT,
} from '@app-core/constants/constants';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { GetEventListParams } from '@app-trip-details/common/trip-details.model';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';
import { IncidentDetailsService } from '@app-incident-details/services/incident-stats.service';
import { MAPBOX_ACCESS_TOKEN } from '@app-request-video/constants/request-video.constants';
import { StorageService } from '@app-core/services/storage/storage.service';
import { asymmetricArrayDiff } from '@app-core/models/dirty-check';
import { CLIENT_CONFIG } from '@config/config';

@Component({
  selector: 'app-incident-modal',
  templateUrl: './incident-modal.component.html',
  styleUrls: ['./incident-modal.component.scss'],
})
export class IncidentModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('paginator', { static: true })
  public paginator: MatPaginator;
  public staticImageURL;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private formValueChangesUnsubscribe: Subject<void> = new Subject<void>();

  public isVideoPlaying = false;
  public eventTagList = EVENT_TAG_LIST;
  public clientConfig = CLIENT_CONFIG;
  public videoSeekerTranslateVal = 0;
  public videoRef: HTMLVideoElement;
  public videoRef2: HTMLVideoElement;
  public isMapMode = true;
  public isFullscreen = false;
  public incidentListDataSource = new MatTableDataSource<any>([]);
  public incidentListObservable: Observable<any>;
  public mapInitialCoordinates: any = {};
  public mapIcon: any = {};
  public commentList = [];
  public tagSelected: boolean = false;
  public eventsConfig;
  public incidentMedia1: string;
  public incidentMedia1Label: string;
  public incidentMedia2: string;
  public incidentMedia2Label: string;
  public videoLoader = true;
  public incidentType = 'INCIDENT';

  public formLoaders = {
    bookmarkLoader: false,
    tagsLoader: false,
    commentLoader: false,
    coachingLoader: false,
    challengeLoader: false,
  };

  public incidentTags = new FormControl([], [Validators.required, Validators.maxLength(3)]);
  public incidentComment = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(140)]);
  public isBookmarked = false;
  public timelineLoader = false;
  public eventIndicatorList = [];
  public mediaType = 'VIDEO';
  public isMediaAvailable = true;
  public fleetManagerCommentCount = 0;
  public isTouchDevice = false;
  public isMediaStream1 = true;
  public presentIndex = 0;
  public videoResolution: any;
  public imageResolution: any;
  public autoTags = [];
  public isCoachingCompleted = false;
  public isIncidentDiscarded = false;
  public isChallengeAccepted = false;
  public isChallengeResolved = false;
  public isEditMode = false;
  public eventTagKeys = EVENT_TAG_KEYS;
  public isTagsInputDirty = true;
  public isVolumeEnabled = false;
  public isAudioSupported = false;
  public enableSelectForCoaching = true;
  public getEventTagsLoader = false;
  public eventTags = [];
  public updateTagsLoader = false;
  public isEventVideoRequest = false;
  public showVideoRequested = false;
  public isVideoRequestLoader = false;
  public videoResolution1: any;
  public videoResolution2: any;

  public bearingSuffix: any;
  public fleetManagerMaxComment: number = FLEETMANAGER_MAX_COMMENT;

  constructor(
    public dialogRef: MatDialogRef<IncidentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbarService: SnackBarService,
    public dataService: DataService,
    private tripDetailsService: TripDetailsService,
    private cdRef: ChangeDetectorRef,
    private accessService: AccessService,
    private breakpointObserver: BreakpointObserver,
    public translate: TranslateService,
    private gtmService: GoogleTagManagerService,
    private router: Router,
    private incidentDetailsService: IncidentDetailsService,
    private storageService: StorageService
  ) {}

  public ngOnInit() {
    this.breakpointObserver.observe([...BREAKPOINTS_SMALL, ...BREAKPOINTS_MEDIUM]).subscribe((state: BreakpointState) => {
      this.isTouchDevice = state.matches;
    });

    // this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
    //   if (value) {
    //     this.fleetId = value;
    //   }
    // });
    const { allEvents = [], currentIndex = 0 } = this.data || {};
    const { tags = [] } = allEvents[currentIndex] || {};
    this.incidentListDataSource.data = allEvents;

    // connect datasource and pagination
    this.incidentListDataSource.paginator = this.paginator;
    this.incidentListObservable = this.incidentListDataSource.connect();
    this.paginator.pageIndex = currentIndex;

    // setting modal data
    this.resetData();
    this.setData(currentIndex);

    this.checkFullscreen();

    this.incidentTags.valueChanges.pipe(takeUntil(this.formValueChangesUnsubscribe)).subscribe((x: any[]) => {
      if ((x || []).sort().join(',') === tags.sort().join(',')) {
        this.isTagsInputDirty = true;
      } else {
        this.isTagsInputDirty = false;
      }
    });

    const combinedEventsList = this.dataService.modifyFleeEvents();
    const modifiedEventsConfig = this.dataService.transformObject(combinedEventsList);
    this.eventsConfig = { ...EVENTS_CONFIG, ...modifiedEventsConfig };
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
    if (!this.isFullscreen) {
      this.gtmService.toggleFullScreenIncidentDialog('Disbled');
    }
  }

  public toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.isEditMode ? this.gtmService.swtchTagsandVideoPanel('tagsComments') : this.gtmService.swtchTagsandVideoPanel('videoPanel');
  }

  public ngAfterViewInit() {
    this.videoRef = document.getElementById('incidentVideo') as HTMLVideoElement;

    this.paginator.page.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: PageEvent) => {
      this.gtmService.changeIncidentDialogPageChange(event);
    });

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
      this.videoRef.volume = this.isVolumeEnabled ? 1 : 0;
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
          this.videoRef2.volume = this.isVolumeEnabled ? 1 : 0;
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

  public toggleVolume() {
    this.isVolumeEnabled = !this.isVolumeEnabled;
    this.videoRef.volume = this.isVolumeEnabled ? 1 : 0;
    if (this.videoRef2) {
      this.videoRef2.volume = this.isVolumeEnabled ? 1 : 0;
    }
    this.isVolumeEnabled ? this.gtmService.toggleIncidentDialogVolume('Enabled') : this.gtmService.toggleIncidentDialogVolume('Disabled');
    setTimeout(() => {
      this.videoRef.volume = this.isVolumeEnabled ? 1 : 0;
      if (this.videoRef2) {
        this.videoRef2.volume = this.isVolumeEnabled ? 1 : 0;
      }
    }, 100);
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

  public toggleBookmark() {
    this.formLoaders = {
      ...this.formLoaders,
      bookmarkLoader: true,
    };
    this.isBookmarked = !this.isBookmarked;
    this.updateIncident(this.incidentType, 'BOOKMARK');
    this.incidentListObservable.subscribe((value) => {
      switch (this.data.source) {
        case 'Fleet':
          this.isBookmarked
            ? this.gtmService.coachinginFleetIncidentDialog(value[0].eventTypeLabel, value[0].asset.assetId)
            : this.gtmService.deselectIncidentFromFleetCoachingIncidentDialog(value[0].eventTypeLabel, value[0].asset.assetId);
          break;
        case 'Drivers':
          this.isBookmarked
            ? this.gtmService.coachinginDriversIncidentDialog(value[0].eventTypeLabel, value[0].asset.assetId)
            : this.gtmService.deselectIncidentFromDriversCoachingIncidentDialog(value[0].eventTypeLabel, value[0].asset.assetId);
          break;
        case 'IncidentView':
          this.isBookmarked
            ? this.gtmService.coachinginIncidentViewDialog(value[0].eventTypeLabel, value[0].asset.assetId)
            : this.gtmService.deselectIncidentFromCoachingIncidentViewDialog(value[0].eventTypeLabel, value[0].asset.assetId);
          break;
        case 'Driver_Coaching':
          this.gtmService.deselectIncidentFromDriverCoachingPannel(value[0].eventTypeLabel, value[0].asset.assetId);
          break;
        case 'Driver_PanicButton':
          this.gtmService.coachingInDriverPanicButtonDialog(value[0].eventTypeLabel, value[0].asset.assetId);
          break;
        case 'Coaching':
          this.gtmService.deselectIncidentfromCoachingPannelDialog(value[0].eventTypeLabel, value[0].asset.assetId);
          break;
        case 'DVR':
          this.isBookmarked
            ? this.gtmService.coachingInVideoRequestDialog(value[0].eventTypeLabel, value[0].assetId)
            : this.gtmService.deselectIncidentfromVideoRequestDialog(value[0].eventTypeLabel, value[0].assetId);
          break;
        case 'TripDetails':
          if (this.isBookmarked) {
            this.gtmService.coachingTripDetailsIncidentDialog(value[0].eventTypeLabel, value[0].assetId);
          }
          break;
        case 'RequestVideo':
          this.isBookmarked
            ? this.gtmService.coachingInRequestVideoDialog(value[0].eventTypeLabel, value[0].asset.assetId || value[0].assetId)
            : this.gtmService.deselectIncidentFromRequestVideoDialog(value[0].eventTypeLabel, value[0].asset.assetId || value[0].assetId);
          break;
      }
    });
  }

  public completeCoaching(incident: any) {
    this.formLoaders = {
      ...this.formLoaders,
      coachingLoader: true,
    };
    switch (this.data.source) {
      case 'Coaching':
        this.gtmService.completeCoachingCoachingPanelDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Driver_Coaching':
        this.gtmService.completeCoachingDriverCoachingPanelDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
    }
    this.isBookmarked = true;
    this.updateIncident(this.incidentType, 'COACHING');
  }

  public acceptChallenge(incident: any) {
    this.formLoaders = {
      ...this.formLoaders,
      challengeLoader: true,
    };
    this.gtmService.acceptChallengeInChallengeIncidentsDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
    this.updateIncident(this.incidentType, 'CHALLENGE_ACCEPTED');
  }

  public rejectChallenge(incident: any) {
    this.formLoaders = {
      ...this.formLoaders,
      challengeLoader: true,
    };
    this.gtmService.rejectChallengeInChallengeIncidentsDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
    this.updateIncident(this.incidentType, 'CHALLENGE_REJECTED');
  }

  public toggleAdvancedView() {
    this.isMapMode = !this.isMapMode;
    !this.isMapMode ? this.gtmService.viewAccelerometerProfile(!this.isMapMode) : this.gtmService.viewMapMode(this.isMapMode);
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

  public pageEvent(event: any) {
    const { pageIndex = 0 } = event;
    this.resetData();
    this.setData(pageIndex);
  }

  public switchMedia() {
    this.isMediaStream1 = !this.isMediaStream1;
  }

  public setData(pageIndex: number) {
    const { allEvents = [], supportViewedStatus = false } = this.data || {};
    const {
      mediaFiles = [],
      eventVideoFilename = '',
      eventVideoFile = '',
      bookmark = false,
      tags = [],
      isDvrEvent = false,
      timelapseEnabled = false,
      commentsV2 = [],
      latitude = 0,
      longitude = 0,
      videoDetails = {},
      videoResolution = '',
      imageDetails = {},
      autoTags = [],
      coachingCompleted = false,
      isViewed = false,
      eventType = '',
      speedSign = {},
      stopSign = {},
      reportBug = false,
      challengeResolved = false,
      challengeAccepted = false,
      firstLocation = {},
      tripId = '',
      eventIndex = '',
      isExternalEvent = false,
      isEventVideoRatelimited = false,
      edvrRequests = [],
    } = allEvents[pageIndex];

    if (!(isDvrEvent || isExternalEvent)) {
      this.getEventTags(tripId, eventIndex, allEvents[pageIndex]);
    }

    const { audioEnabled = false } = videoDetails || {};
    this.isAudioSupported = audioEnabled;

    this.presentIndex = pageIndex;
    this.autoTags = autoTags.map((x) => AUTO_TAGS_LIST[x]);

    this.isVolumeEnabled = false;

    const { latitude: timelapseLat = 0, longitude: timelapseLong = 0 } = firstLocation;

    const { latitude: speedSignLat = 0, longitude: speedSignLong = 0 } = speedSign;
    const { latitude: stopSignLat = 0, longitude: stopSignLong = 0 } = stopSign;
    let lat = null;
    let long = null;

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

    setTimeout(() => {
      if (lat && long) {
        this.mapInitialCoordinates = { latitude: lat, longitude: long };
        this.generateMap();
      }
    }, 100);

    if (isDvrEvent && videoResolution) {
      this.videoResolution = videoResolution.split('x')[1] || undefined;
    } else {
      this.videoResolution = videoDetails.videoHeight || undefined;
    }

    this.imageResolution = imageDetails.imageHeight || undefined;

    // media files
    if (mediaFiles && mediaFiles.length) {
      if (mediaFiles.length === 1) {
        this.incidentMedia1 = mediaFiles[0].mediaFile;
      } else {
        this.incidentMedia1 = mediaFiles[0].mediaFile;
        this.incidentMedia1Label = MEDIA_SOURCES_ENUM[mediaFiles[0].source];
        this.incidentMedia2 = mediaFiles[1].mediaFile;
        this.incidentMedia2Label = MEDIA_SOURCES_ENUM[mediaFiles[1].source];
        this.videoResolution1 = mediaFiles[0]?.videoDetails?.videoHeight;
        this.videoResolution2 = mediaFiles[1]?.videoDetails?.videoHeight;
      }
    } else {
      this.incidentMedia1 = eventVideoFilename || eventVideoFile;
    }

    this.assignMediaType();

    this.isBookmarked = bookmark;
    this.isCoachingCompleted = coachingCompleted;
    this.isIncidentDiscarded = reportBug;
    if (edvrRequests.length) {
      this.showVideoRequested = true;
    }
    this.isEventVideoRequest = isEventVideoRatelimited;
    this.incidentType = isDvrEvent ? 'DVR' : 'INCIDENT';
    this.isChallengeResolved = challengeResolved;
    this.isChallengeAccepted = challengeAccepted;

    this.incidentTags.patchValue(tags);
    this.incidentTags.markAsPristine();
    this.incidentTags.markAsUntouched();

    if (this.isCoachingCompleted || this.isIncidentDiscarded || this.isChallengeAccepted || this.isChallengeResolved) {
      this.incidentTags.disable();
    }

    this.commentList = commentsV2;
    this.fleetManagerCommentCount = this.commentList.filter((x: any) => x.userType === 'FLEET_MANAGER').length;

    this.isMapMode = timelapseEnabled ? false : true;
    this.isMediaAvailable = true;
    this.eventIndicatorList = [];
    if (timelapseEnabled) {
      this.getFilteredEventList();
    }

    if (supportViewedStatus && !isViewed) {
      if (this.incidentType === 'DVR') {
        this.updateIncident('DVR', 'VIEWED_STATUS');
      } else {
        this.updateIncident('INCIDENT', 'VIEWED_STATUS');
      }
    }

    this.playVideo();

    setTimeout(() => {
      this.playVideo();
    }, 100);
    const coachingConfig = this.storageService.getStorageValue('coachingConfig') || {};
    if (eventType === '') {
      this.enableSelectForCoaching =
        Object.keys(coachingConfig).length === 0
          ? false
          : coachingConfig?.eventTypes?.filter((event) => event === 'video-requests').length
          ? false
          : true;
    } else if (eventType === 'Custom-Triggered') {
      this.enableSelectForCoaching =
        Object.keys(coachingConfig).length === 0
          ? false
          : coachingConfig?.eventTypes?.filter((event) => event === 'panic-button').length
          ? false
          : true;
    } else {
      this.enableSelectForCoaching =
        Object.keys(coachingConfig).length === 0
          ? false
          : coachingConfig?.eventTypes?.filter((event) => event === eventType).length
          ? false
          : true;
    }
  }

  private generateMap() {
    const { longitude = -73, latitude = 45 } = this.mapInitialCoordinates;
    this.staticImageURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+005dbb(${longitude},${latitude})/${longitude},${latitude},17/520x220@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }

  public getBearingSuffix(bearing: any) {
    this.bearingSuffix = bearing === 0 ? this.translate.instant('mapComponentdegree') : this.translate.instant('mapComponentdegrees');
    if (bearing) {
      bearing = Number(bearing.toFixed(2));
    }
    return bearing + this.bearingSuffix;
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
    this.isMapMode = true;
    this.isVideoPlaying = false;
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

  public saveTags() {
    this.formLoaders = {
      ...this.formLoaders,
      tagsLoader: true,
    };
    this.updateIncident(this.incidentType, 'TAGS');
  }

  public saveComment() {
    this.formLoaders = {
      ...this.formLoaders,
      commentLoader: true,
    };
    this.updateIncident(this.incidentType, 'COMMENT');
  }

  public discardIncident(incident: any) {
    this.formLoaders = {
      ...this.formLoaders,
      challengeLoader: true,
    };
    switch (this.data.source) {
      case 'Fleet':
        this.gtmService.discardIncidentFleetIncidentDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'IncidentView':
        this.gtmService.discardEventIncidentViewDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Drivers':
        this.gtmService.discardIncidentDriverIncidentDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'TripDetails':
        this.gtmService.discardIncidentTripDetailsDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Coaching':
        this.gtmService.discardIncidentCoachingPanelDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'DVR':
        this.gtmService.discardIncidentVideoRequestPanicButtonDialog(
          incident.eventTypeLabel,
          incident?.asset?.assetId || incident?.assetId
        );
        break;
      case 'Driver_Coaching':
        this.gtmService.discardIncidentDriverCoachingPanelDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Driver_PanicButton':
        this.gtmService.discardIncidentDriverPanicButtonDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'RequestVideo':
        this.gtmService.discardIncidentFromRequestVideoDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
    }
    this.updateIncident(this.incidentType, 'REPORT_BUG');
  }

  public updateIncident(type: string, updateType: any) {
    const { allEvents = [] } = this.data || {};
    const { tripId = '', driverId = '', eventIndex, uploadRequestId } = allEvents[this.paginator.pageIndex];
    const { name = '', loginName = '' } = this.accessService.getLoginInfo();

    const commentV2 = {
      userType: 'FLEET_MANAGER',
      text: this.incidentComment.value,
      name: name || loginName,
      timestamp: new Date().toISOString(),
    };
    const tags = this.incidentTags.value;
    const { loginName: userEmail, name: userName } = this.accessService.getLoginInfo();
    const otherParams =
      type === 'DVR'
        ? {
            uploadRequests: [
              {
                uploadRequestId,
                ...(updateType === 'COMMENT' && { commentV2, bookmark: true }),
                ...(updateType === 'TAGS' && { tags, bookmark: tags.length ? true : false }),
                ...(updateType === 'BOOKMARK' && {
                  bookmark: this.isBookmarked,
                  ...(this.isBookmarked ? { coachingCompleted: false } : {}),
                }),
                ...(updateType === 'COACHING' && { bookmark: true, coachingCompleted: true }),
                ...(updateType === 'VIEWED_STATUS' && { isViewed: true }),
              },
            ],
          }
        : {
            events: [
              {
                eventIndex,
                ...(updateType === 'VIEWED_STATUS' && { isViewed: true }),
                ...(updateType === 'COMMENT' && {
                  commentV2,
                  bookmark: true,
                  coachingInitiatedMetadata: {
                    userType: 'FLEET_MANAGER',
                    email: userEmail,
                    name: userName,
                  },
                }),
                ...(updateType === 'TAGS' && {
                  tags,
                  bookmark: tags.length ? true : false,
                  coachingInitiatedMetadata: {
                    userType: 'FLEET_MANAGER',
                    email: userEmail,
                    name: userName,
                  },
                }),
                ...(updateType === 'BOOKMARK' && {
                  bookmark: this.isBookmarked,
                  ...(this.isBookmarked ? { coachingCompleted: false } : {}),
                }),
                ...(updateType === 'BOOKMARK' &&
                  this.isBookmarked && {
                    coachingInitiatedMetadata: {
                      userType: 'FLEET_MANAGER',
                      email: userEmail,
                      name: userName,
                    },
                  }),
                ...(updateType === 'COACHING' && {
                  bookmark: true,
                  coachingCompleted: true,
                  coachingCompletedMetadata: {
                    userType: 'FLEET_MANAGER',
                    email: userEmail,
                    name: userName,
                  },
                }),
                ...(updateType === 'CHALLENGE_ACCEPTED' && {
                  challengeRaised: true,
                  challengeAccepted: true,
                  challengeResolved: true,
                  challengeResolvedMetadata: {
                    userType: 'FLEET_MANAGER',
                    email: userEmail,
                    name: userName,
                  },
                }),
                ...(updateType === 'CHALLENGE_REJECTED' && {
                  challengeRaised: true,
                  challengeAccepted: false,
                  challengeResolved: true,
                  challengeResolvedMetadata: {
                    userType: 'FLEET_MANAGER',
                    email: userEmail,
                    name: userName,
                  },
                }),
                ...(updateType === 'REPORT_BUG' && {
                  reportBug: true,
                  challengeRaised: true,
                  challengeAccepted: true,
                  challengeResolved: true,
                }),
              },
            ],
          };

    const body = {
      tripId,
      driverId,
      ...otherParams,
    };

    const API = type === 'DVR' ? this.dataService.updateDvrMetadata(body) : this.dataService.updateEventMetadata(body);
    API.pipe(
      finalize(() => {
        this.formLoaders = {
          bookmarkLoader: false,
          tagsLoader: false,
          commentLoader: false,
          coachingLoader: false,
          challengeLoader: false,
        };
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(
      () => {
        if ((type === 'DVR' || type === 'INCIDENT') && updateType === 'VIEWED_STATUS') {
          this.updateLocalData(type, body);
        } else {
          this.snackbarService.success(this.translate.instant('incidentModalUpdatedDeatilSuccess'));
          this.dataService.refreshIncidentsList.next();
          this.incidentComment.patchValue('');
          this.updateLocalData(type, body);
        }
      },
      () => {
        this.snackbarService.failure(this.translate.instant('incidentModalUpdatedDeatilFailed'));
      }
    );
  }

  private updateLocalData(type: string, updatedData?: any) {
    const { allEvents = [], supportViewedStatus = false } = this.data || {};
    const updatedAllEvents = allEvents.map((event: any) => {
      if (updatedData.tripId === event.tripId) {
        const {
          bookmark,
          tags,
          commentV2,
          coachingCompleted,
          challengeAccepted,
          challengeResolved,
          reportBug,
          isEventVideoRatelimited,
          edvrRequests = [],
        } = type === 'DVR' ? updatedData.uploadRequests[0] : updatedData.events[0];
        if (tags) {
          this.incidentTags.patchValue(tags);
          this.incidentTags.markAsPristine();
        }
        if (commentV2) {
          this.commentList.push(commentV2);
          this.commentList = this.commentList.reduce((unique, o) => {
            if (!unique.some((obj) => obj.text === o.text && obj.userType === o.userType)) {
              unique.push(o);
            }
            return unique;
          }, []);
        }
        this.isBookmarked = bookmark;
        this.isCoachingCompleted = coachingCompleted;
        this.isIncidentDiscarded = reportBug;
        this.isEventVideoRequest = isEventVideoRatelimited;
        this.showVideoRequested = edvrRequests.length;
        this.isChallengeResolved = challengeResolved;
        this.isChallengeAccepted = challengeAccepted;

        if (this.isCoachingCompleted || this.isIncidentDiscarded || this.isChallengeAccepted || this.isChallengeResolved) {
          this.incidentTags.disable();
        }

        return {
          ...event,
          bookmark,
          tags,
          commentV2,
          coachingCompleted,
          challengeAccepted,
          challengeResolved,
          ...(supportViewedStatus ? { isViewed: true } : {}),
        };
      }
      return event;
    });

    this.incidentListDataSource = new MatTableDataSource<any>(updatedAllEvents);

    // scroll to bottom of commentList
    setTimeout(() => {
      const commentListDOM = document.getElementById('commentListDOM');
      if (commentListDOM) {
        commentListDOM.scrollTop = commentListDOM.scrollHeight;
        commentListDOM.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }, 200);

    this.fleetManagerCommentCount = this.commentList.filter((x: any) => {
      if (x && x.userType && x.userType === 'FLEET_MANAGER') {
        return x;
      }
    }).length;
  }

  public getFilteredEventList() {
    const { allEvents = [] } = this.data || {};
    const { tripId = '', driverId = '', startTimeUTC = '', endTimeUTC = '' } = allEvents[this.paginator.pageIndex];
    this.timelineLoader = true;

    const options = new GetEventListParams({
      tripId,
      driverId,
      includeViolations: true,
    });

    const otherParams = {
      startTimeUTC,
      endTimeUTC,
    };

    this.tripDetailsService
      .getEventList(options, otherParams)
      .pipe(
        finalize(() => {
          this.timelineLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res) => {
          this.eventIndicatorList = res.filteredViolations.map(
            (event: { timestampUTC: string | number | Date; eventType: string | number }) => {
              const timeDiffInMilliSeconds = new Date(event.timestampUTC).valueOf() - new Date(startTimeUTC).valueOf();
              const timelapseTimeDiffInMilliSeconds = new Date(endTimeUTC).valueOf() - new Date(startTimeUTC).valueOf();
              const timelinePosition = ((timeDiffInMilliSeconds / timelapseTimeDiffInMilliSeconds) * 100).toFixed(2);
              const combinedEventsList = this.dataService.modifyFleeEvents();
              const modifiedEventsConfig = { ...EVENTS_CONFIG, ...this.dataService.transformObject(combinedEventsList) };

              // const eventTypeLabel = EVENTS_CONFIG[event.eventType].label || undefined;
              // const eventColor = EVENTS_CONFIG[event.eventType].color || undefined;

              const eventTypeLabel = modifiedEventsConfig[event.eventType].label || undefined;
              const eventColor = modifiedEventsConfig[event.eventType].color || undefined;

              return {
                ...event,
                eventTypeLabel,
                eventColor,
                timelinePosition,
              };
            }
          );
        },
        () => {
          this.eventIndicatorList = [];
        }
      );
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

  public onClose() {
    const { isDvrList = false } = this.data || {};
    if (isDvrList) {
      this.dialogRef.close({
        currentIndex: this.paginator.pageIndex,
        isDvrList: true,
      });
    }
  }

  public navigateToTripDetails(incident: any) {
    this.dialogRef.close();
    switch (this.data.source) {
      case 'Fleet':
        this.gtmService.gotoTripDetailsFromFleetIncidentsDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Drivers':
        this.gtmService.gotoTripDetailsFromDriversIncidentsDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'IncidentView':
        this.gtmService.gotoTripDetailsFromIncidentsViewDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Driver_Coaching':
        this.gtmService.gotoTripDetailsFromDriverCoachingPannelDialog(
          incident.eventTypeLabel,
          incident?.asset?.assetId || incident?.assetId
        );
        break;
      case 'Driver_PanicButton':
        this.gtmService.gotoTripDetailsFromDriverPanicDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Coaching':
        this.gtmService.gotoTripDetailsFromCoachingPannelDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'DVR':
        this.gtmService.gotoTripDetailsFromDVRPageDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'Challenge':
        this.gtmService.gotoTripDetailsFromChallengeDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
      case 'RequestVideo':
        this.gtmService.gotoTripDetailsFromRequestVideoDialog(incident.eventTypeLabel, incident?.asset?.assetId || incident?.assetId);
        break;
    }
    this.router.navigate(['/trip-details'], {
      queryParams: {
        tripId: incident.tripId,
        driverId: incident.driverId,
      },
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public updatedTags(incident: any) {
    this.updateTagsLoader = true;
    let body = {
      eventTags: incident.eventTagsIds,
    };
    this.incidentDetailsService
      .updateEventTags(body, incident.tripId, incident.eventIndex)
      .pipe(
        finalize(() => {
          this.updateTagsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.getEventTags(incident.tripId, incident.eventIndex, incident);
          this.snackbarService.success(this.translate.instant('incidentModalUpdatedDeatilSuccess'));
        },
        () => {
          this.snackbarService.failure(this.translate.instant('incidentModalUpdatedDeatilFailed'));
        }
      );
  }

  public selectedTags(tags, incident: any) {
    incident['eventTagsIds'] = tags;
    const eventTagsIds: Number[] = (this.eventTags || []).map((t) => t.tagId);
    const diff = asymmetricArrayDiff<Number>(tags || [], eventTagsIds);
    this.tagSelected = Boolean(diff.length);
  }

  private getEventTags(tripId, eventIndex, incident) {
    this.getEventTagsLoader = true;
    this.incidentDetailsService
      .getTagListForEvent(tripId, eventIndex)
      .pipe(
        finalize(() => {
          this.getEventTagsLoader = false;
          if (!(this.eventTags || []).length) {
            this.selectedTags([], incident);
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.eventTags = res?.data?.eventTags;
          incident['eventTags'] = this.eventTags;
        },
        () => {
          this.eventTags = [];
        }
      ),
      () => {
        this.eventTags = [];
      };
  }

  public videoRequest(body: any) {
    this.isVideoRequestLoader = true;
    const params = {
      driverId: body?.driverId,
      tripId: body?.tripId,
      eventIndex: body?.eventIndex,
      videoQuality: body?.videoDetails?.videoQuality,
    };

    if (body?.videoDetails?.videoResolution) {
      params['videoResolution'] = body?.videoDetails?.videoResolution;
    }

    this.dataService
      .requestedVideos(params)
      .pipe(
        finalize(() => {
          this.isVideoRequestLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          this.showVideoRequested = true;
          this.snackbarService.success(this.translate.instant('incidentModalVideoRequestSuccess'));
        },
        (err) => {
          if (err.status === 406) {
            this.snackbarService.failure(this.translate.instant('incidentModalVideoRequestFailed1'));
          } else {
            this.snackbarService.failure(this.translate.instant('incidentModalVideoRequestFailed2'));
          }
        }
      );
  }
}
