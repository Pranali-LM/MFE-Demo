import { Component, ComponentFactory, ComponentFactoryResolver, Injector, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import {
  DEFAULT_DVR_DURATION,
  DEFAULT_DVR_RESOLUTION,
  DEFAULT_VIDEO_FORMAT,
  DVR_DURATION_OPTIONS,
  DVR_REQUEST_LEGENDS,
  DVR_RESOLUTION_OPTIONS,
  MAPBOX_DEFAULT_LAYER,
  VIDEO_FORMATS,
} from '@app-core/constants/constants';
import { RequestConfirmationComponent } from '@app-request-video/components/request-confirmation/request-confirmation.component';
import { DataService } from '@app-core/services/data/data.service';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { getSideNavigationConfigState } from '@app-shared/reducers';
import { State } from '@app-home/reducers';
import { Store } from '@ngrx/store';
import { DriverImageComponent } from '@app-shared/components/driver-image/driver-image.component';
import * as moment from 'moment';
import { IncidentModalComponent } from '@app-shared/components/incident-modal/incident-modal.component';
import {
  MAPBOX_ACCESS_TOKEN,
  MDVR_COLLAGE_CONFIG,
  MDVR_COLLAGE_SORTING_ARR,
  VIDEO_REQUEST_EVENTS_CONFIG,
} from '@app-request-video/constants/request-video.constants';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { MatSelectChange } from '@angular/material/select';
import { MDVR_AVAILBLE_VIEWS } from '@app-assets/constants/assets.constants';
import { DvrReqVideoType } from '@app-trips/common/trips.model';
import { MapTooltipComponent } from '@app-trip-details/components/map-tooltip/map-tooltip.component';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface DvrRequestFg {
  dvrDuration: FormControl<number>;
  videoResolution: FormControl<string>;
  videoFormat: FormControl<string>;
  mdvrViews?: FormControl<string | string[]>;
}

@Component({
  selector: 'app-request-video',
  templateUrl: './request-video.component.html',
  styleUrls: ['./request-video.component.scss'],
})
export class RequestVideoComponent implements OnInit, OnDestroy {
  @ViewChild('dvrGraph') public dvrGraph: ElementRef;
  public dvrResolutions = DVR_RESOLUTION_OPTIONS;
  public dvrVideoFormats = VIDEO_FORMATS;
  public dvrDurations = DVR_DURATION_OPTIONS;
  public dvrRequestLegends = DVR_REQUEST_LEGENDS;
  public updatedTranslateVal = 0;
  public loader = false;
  public dvrFormLoader = false;
  public timelineTicks = [];
  public stoppedZones = [];
  public safetyEventList = [];
  public tripPathInfo = [];
  public timelineWidth = 0;
  public numberOfMinutes = 0;
  public tripDurationInMinutes = 0;
  public remainingDurationInTimelineInSeconds = 0;
  public tripDetails: any;
  public tripParams: any;
  public currentSliderValue = 0;
  public isSideNavOpen = true;
  public map: any;
  public selectionMarker: any;
  public selectedTimeUTC: any;
  public selectedTimeLocal: any;
  public driverThumbnail: string;
  public isError = false;
  public tripList = [];
  public mapMarkerList = [];
  public showMapMarkers = true;
  public polylineGeoJson: any;
  public startLocation = {
    startLocationCity: '',
    startLocationFullAddress: '',
  };
  public endLocation = {
    endLocationCity: '',
    endLocationFullAddress: '',
  };
  public customMapOptions = {
    recenterButton: {
      display: 'inline-block',
      top: '106px',
      left: '10px',
    },
    toggleMarker: {
      display: 'inline-block',
      top: '146px',
      left: '10px',
    },
    layersButton: {
      display: 'inline-block',
      top: '186px',
      left: '10px',
    },
  };
  public form = this.fb.group<DvrRequestFg>({
    dvrDuration: this.fb.control(DEFAULT_DVR_DURATION, [Validators.required]),
    videoResolution: this.fb.control(DEFAULT_DVR_RESOLUTION, [Validators.required]),
    videoFormat: this.fb.control(DEFAULT_VIDEO_FORMAT, [Validators.required]),
  });
  public availableMdvrViews = [];
  public isEvoCamera: boolean;
  public currentLayer = MAPBOX_DEFAULT_LAYER;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public fleetId: string;

  private toolTipFactory: ComponentFactory<MapTooltipComponent>;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private location: Location,
    public dataService: DataService,
    public translate: TranslateService,
    private tripDetailsService: TripDetailsService,
    private route: ActivatedRoute,
    private store: Store<State>,
    private gtmService: GoogleTagManagerService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      this.tripParams = params;
      this.getTripDetails();
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
        if (currentWindowWidth <= 1440 && isSideNavOpen === false) {
          this.isSideNavOpen = false;
        } else {
          this.isSideNavOpen = true;
        }
        if (this.map) {
          setTimeout(() => {
            this.map.resize();
          }, 200);
        }
      });

    this.dataService._currentFleet
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((val) => {
          if (val) {
            return this.dataService.fullHDEnabled();
          }
        })
      )
      .subscribe((value) => {
        this.dvrResolutions = value ? DVR_RESOLUTION_OPTIONS : DVR_RESOLUTION_OPTIONS.filter((x) => x.value !== '1920x1080');
      });
  }

  public getTripDetails() {
    this.loader = true;
    this.isError = false;
    const { tripId, driverId, longitude = -73, latitude = 45 } = this.tripParams || {};
    this.map = new mapboxgl.Map({
      container: 'dvrMap', // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [longitude, latitude], // starting position [lng, lat]
      zoom: 15, // starting zoom
    });
    const params = {
      tripId,
      driverId,
      includeViolations: true,
      includePathInfo: true,
      includeCustomEvents: true,
      includeUploadRequests: true,
      includeFRResults: true,
      excludeChallengeAcceptedViolations: true,
    };
    this.tripDetailsService
      .getTripDetails(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        (res: any) => {
          this.tripDetails = res || {};
          const {
            startTimeUTC = '',
            startTime = '',
            firstLocation = {},
            lastLocation = {},
            sampleDriverImage,
            frResults = [],
            asset = {},
            recordedInfo = [],
          } = this.tripDetails || {};

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
          this.isEvoCamera = recordedInfo.some((r) => r.source.startsWith('TVI') || r.source.startsWith('UVC'));

          this.selectedTimeUTC = startTimeUTC;
          this.selectedTimeLocal = startTime;
          this.checkAssetForMdvrSupport(asset);
          this.generateMap();
          this.generateTimeline();
          this.getStartLocation(firstLocation);
          this.getEndLocation(lastLocation);

          if (sampleDriverImage) {
            this.driverThumbnail = 'assets/common/no-avatar.svg';
          }
          if (frResults && frResults.length && frResults[0].thumbnailSmall) {
            this.driverThumbnail = frResults[0].thumbnailSmall || 'assets/common/no-avatar.svg';
          } else {
            this.driverThumbnail = 'assets/common/no-avatar.svg';
          }
        },
        () => {
          this.isError = false;
        }
      );
  }

  private checkAssetForMdvrSupport(assetDetails: any) {
    const { plusPackages } = assetDetails || {};
    if (plusPackages.includes('MDVR')) {
      this.dvrVideoFormats = [
        ...VIDEO_FORMATS,
        {
          value: 'MDVR',
          text: 'Multi-View',
        },
      ];
    }
  }

  private getStartLocation(startlocation: any) {
    const { latitude = 0, longitude = 0 } = startlocation || {};
    const params = {
      location: `${longitude},${latitude}`,
    };
    this.tripDetailsService
      .getLocationData(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        (res) => {
          const { address = {} } = res || {};
          const { City = '', LongLabel = '' } = address || {};

          if (City !== '' && LongLabel !== '') {
            this.startLocation = {
              startLocationCity: City,
              startLocationFullAddress: LongLabel,
            };
          } else {
            this.startLocation = {
              startLocationCity: 'Unknown',
              startLocationFullAddress: null,
            };
          }
        },
        () => {
          this.startLocation = undefined;
        }
      );
  }

  private getEndLocation(endLocation: any) {
    const { latitude = 0, longitude = 0 } = endLocation || {};
    const params = {
      location: `${longitude},${latitude}`,
    };
    this.tripDetailsService
      .getLocationData(params)
      .pipe(
        finalize(() => {
          this.loader = false;
        })
      )
      .subscribe(
        (res) => {
          const { address = {} } = res || {};
          const { City = '', LongLabel = '' } = address || {};

          if (City !== '' && LongLabel !== '') {
            this.endLocation = {
              endLocationCity: City,
              endLocationFullAddress: LongLabel,
            };
          } else {
            this.endLocation = {
              endLocationCity: 'Unknown',
              endLocationFullAddress: null,
            };
          }
        },
        () => {
          this.endLocation = undefined;
        }
      );
  }

  public getSliderValue(event: MatSliderChange) {
    const { startTimeUTC = '', startTime = '' } = this.tripDetails || {};
    this.currentSliderValue = event.value;
    this.updateTimeline();
    this.selectedTimeUTC = moment(startTimeUTC).add(this.currentSliderValue, 'minutes').toISOString();
    this.selectedTimeLocal = moment(startTime).add(this.currentSliderValue, 'minutes').toISOString();
  }

  public updateTimeline() {
    this.timelineWidth = this.dvrGraph.nativeElement.clientWidth;
    this.updatedTranslateVal = (this.timelineWidth / this.numberOfMinutes) * this.currentSliderValue;
    this.remainingDurationInTimelineInSeconds = (this.tripDurationInMinutes - this.currentSliderValue) * 60;
    this.form.get('dvrDuration').patchValue(60);

    // set selection marker position
    const timelinePercentage = Math.floor((this.currentSliderValue / this.numberOfMinutes) * 100);
    const pathIndex = Math.floor((timelinePercentage / 100) * this.tripPathInfo.length);

    // to get distance based on duration selected
    if (pathIndex <= this.tripPathInfo.length && this.tripPathInfo[pathIndex]) {
      this.selectionMarker.setLngLat([this.tripPathInfo[pathIndex][0], this.tripPathInfo[pathIndex][1]]);
      this.selectionMarker.setRotation(this.tripPathInfo[pathIndex][2]);
    }
  }

  public generateTimeline() {
    const { duration = 0, violations = [], startTimeUTC, endTimeUTC, startTime, uploadRequests = [] } = this.tripDetails;
    this.tripDurationInMinutes = Number((duration / 60).toFixed(0));
    this.timelineWidth = this.dvrGraph?.nativeElement?.clientWidth;
    this.numberOfMinutes = this.tripDurationInMinutes - 1;
    this.remainingDurationInTimelineInSeconds = this.numberOfMinutes * 60;

    let tickVal = 0;
    let labelVal = 0;
    if (this.numberOfMinutes < 10) {
      tickVal = labelVal = 1;
    } else if (this.numberOfMinutes < 60) {
      tickVal = labelVal = 5;
    } else if (this.numberOfMinutes < 240) {
      tickVal = labelVal = 15;
    } else {
      tickVal = 15;
      labelVal = 60;
    }

    const tickInterval = 1;
    const numberOfTicks = Math.ceil(this.numberOfMinutes / tickInterval);
    const tickDistance = this.timelineWidth / numberOfTicks;
    this.timelineTicks = new Array(numberOfTicks + 1).fill({}).map((x, index) => {
      return {
        x,
        position: index * tickDistance,
        label: moment(startTimeUTC).add(index, 'minutes').toISOString(),
        labelLocal: moment(startTime).add(index, 'minutes').toISOString(),
        showTick: index % tickVal === 0,
        showLabel: index % labelVal === 0,
      };
    });

    // stopped zones
    this.stoppedZones = this.tripPathInfo.map((x: any, index: number) => {
      const speed = x[3] * 3.6;
      return {
        width: this.timelineWidth / this.tripPathInfo.length,
        position: index,
        showLabel: speed === 0,
      };
    });

    // safety event list
    const allEventsAndVideoRequests = violations.concat(uploadRequests);
    this.safetyEventList = allEventsAndVideoRequests.map((event: any) => {
      const {
        timestampUTC,
        eventType,
        uploadRequestId,
        startTimeUTC: dvrStartTimeUTC,
        timestamp,
        startTime: dvrStartTime,
        latitude,
        longitude,
        firstLocation = {},
      } = event || {};

      const timeDiffInMilliSeconds =
        new Date(uploadRequestId ? dvrStartTimeUTC : timestampUTC).valueOf() - new Date(startTimeUTC).valueOf();
      const tripDurationDiffInMilliSeconds = new Date(endTimeUTC).valueOf() - new Date(startTimeUTC).valueOf() - 30000;
      const position = +((timeDiffInMilliSeconds / tripDurationDiffInMilliSeconds) * 100).toFixed(2);
      const eventColor = uploadRequestId ? '#FF8C00' : VIDEO_REQUEST_EVENTS_CONFIG[eventType]?.color || undefined;
      const eventTypeLabel = uploadRequestId ? 'Video Request' : VIDEO_REQUEST_EVENTS_CONFIG[eventType]?.label || undefined;
      const showEvent = uploadRequestId ? true : VIDEO_REQUEST_EVENTS_CONFIG[eventType]?.showEvent || false;

      // putting markers on map
      const { latitude: dvrLatitude, longitude: dvrLongitude } = firstLocation;
      const markerLon = uploadRequestId ? dvrLongitude : longitude;
      const markerLat = uploadRequestId ? dvrLatitude : latitude;

      if (markerLon && markerLat) {
        const marker = new mapboxgl.Marker({
          color: eventColor,
        })
          .setLngLat([markerLon, markerLat])
          .addTo(this.map);

        this.mapMarkerList.push(marker);

        const updatedEvent = {
          ...event,
          showEvent,
          eventTypeLabel,
          eventColor,
          position: (position / 100) * this.timelineWidth,
          timestampUTC: uploadRequestId ? dvrStartTimeUTC : timestampUTC,
          timestamp: uploadRequestId ? dvrStartTime : timestamp,
          ...(uploadRequestId
            ? {
                isDvrEvent: true,
                latitude: dvrLatitude,
                longitude: dvrLongitude,
                eventVideoFilename: event.response.link,
                videoDetails: {
                  videoResolution: event.videoResolution,
                },
              }
            : {}),
        };

        marker.getElement().addEventListener('mouseenter', () => {
          const popup = this.createMarkertListMapBox(updatedEvent);
          marker.setPopup(popup);
          marker.togglePopup();
        });

        //Hide the popup when no longer hovering over the marker
        marker.getElement().addEventListener('mouseleave', () => {
          marker.togglePopup();
        });

        marker.getElement().addEventListener('click', () => {
          this.showMedia(updatedEvent, true);
        });
        return updatedEvent;
      }
    });
  }

  public createMarkertListMapBox(event = {}): any[] {
    const template = this.getToolTipTemplate(event);
    const popupContet = template.innerHTML;
    const popup = this.createCustomPopup(popupContet);
    return popup;
  }

  private getToolTipTemplate(data) {
    this.toolTipFactory = this.resolver.resolveComponentFactory(MapTooltipComponent);
    const component = this.toolTipFactory.create(this.injector);
    component.instance.data = data;
    component.changeDetectorRef.detectChanges();
    const element = component.location.nativeElement;
    return element;
  }

  private createCustomPopup(content) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      className: 'custom-mapbox-popup',
    });

    popup.setHTML(content);

    return popup;
  }

  public navigateBack() {
    this.location.back();
  }

  public generateMap() {
    const { pathInfo = [] } = this.tripDetails || {};
    this.tripPathInfo = pathInfo
      .map((x: any) => [x.longitude, x.latitude, x.bearing, x.speed])
      .filter((y: any) => y[0] !== 0 && y[1] !== 0);
    this.polylineGeoJson = {
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: this.tripPathInfo,
        type: 'LineString',
      },
    };

    if (this.map.isStyleLoaded()) {
      if (!this.map.getLayer('line-background')) {
        this.map.addSource('route', {
          type: 'geojson',
          data: this.polylineGeoJson,
        });

        // Add the navigation control to the map
        const nav = new mapboxgl.NavigationControl();
        this.map.addControl(nav, 'top-left');

        // add a line layer without line-dasharray defined to fill the gaps in the dashed line
        this.map.addLayer({
          type: 'line',
          source: 'route',
          id: 'line-background',
          paint: {
            'line-color': 'green',
            'line-width': 8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });

        // Define the SVG arrow icon
        var svgArrow = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#008A00"/>
        <path d="M16.9252 9.13133C16.5859 8.30387 15.4141 8.30387 15.0748 9.13133L9.90643 21.7352C9.81168 21.9663 9.86495 22.2316 10.0415 22.4082V22.4082C10.2224 22.5891 10.4959 22.6402 10.7299 22.5368L15.5959 20.3869C15.8533 20.2732 16.1467 20.2732 16.4041 20.3869L21.2701 22.5368C21.5041 22.6402 21.7776 22.5891 21.9585 22.4082V22.4082C22.135 22.2316 22.1883 21.9663 22.0936 21.7352L16.9252 9.13133Z" fill="white"/>
        </svg>
        
        `;

        // Create a new marker element
        var el = document.createElement('div');
        el.innerHTML = svgArrow;
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.fill = 'green';
        el.style.zIndex = '100';

        // Create a new circle marker with the SVG arrow icon inside it
        this.selectionMarker = new mapboxgl.Marker({
          draggable: true,
          element: el,
        })
          .setLngLat([this.tripPathInfo[0][0], this.tripPathInfo[0][1]])
          .addTo(this.map);
        this.selectionMarker.setRotation(this.tripPathInfo[0][2]);

        this.selectionMarker.on('drag', () => {
          var coordinates = this.map.getSource('route')._data.geometry.coordinates;
          var nearestCoordinate = turf.nearestPointOnLine(
            turf.lineString(coordinates),
            turf.point(this.selectionMarker.getLngLat().toArray())
          );
          this.selectionMarker.setLngLat([nearestCoordinate.geometry.coordinates[0], nearestCoordinate.geometry.coordinates[1]]);

          const closestPolylineIndex = nearestCoordinate.properties.index;
          const positionPercentage = Math.ceil((closestPolylineIndex / this.tripPathInfo.length) * 100);
          this.currentSliderValue = Math.ceil((positionPercentage / 100) * this.numberOfMinutes);
          this.updateTimeline();
          this.selectionMarker.setRotation(this.tripPathInfo[closestPolylineIndex][2]);
        });

        this.recenterMap();
      }
    } else {
      setTimeout(() => {
        this.generateMap();
      }, 50);
    }
  }

  public recenterMap() {
    const bounds = turf.bbox(this.polylineGeoJson);
    this.gtmService.recenterMapInRequestVideoPage(this.fleetId);
    this.map.fitBounds(bounds, {
      padding: { top: 50, bottom: 400, left: 50, right: 50 },
    });
  }

  public showDriverImage() {
    const { thumbnail = '', metadata: metaData = {} } = this.tripDetails.frResults[0] || [];
    const { sampleDriverImage = '', tripId = '', frResultsCorrected = false, sampleDriverImageFaceCoordinates = {} } = this.tripDetails;
    const { driverId = '', driverName } = this.tripDetails;
    this.dialog.open(DriverImageComponent, {
      position: { top: '24px' },
      panelClass: ['mobile-modal'],
      width: '688px',
      data: {
        source: 'requestVideo',
        recognizedDriverImage: thumbnail,
        driverId,
        driverName,
        sampleDriverImage,
        tripId,
        frResultsCorrected,
        sampleDriverImageFaceCoordinates,
        metaData,
        showFeedbackTab: true,
        isDriverImage: true,
        showCoachingCompleted: false,
        isTripDetails: true,
      },
    });
  }

  public onSubmit() {
    const { dvrDuration = 60, videoResolution = '', videoFormat = '', mdvrViews } = this.form.value || {};
    const selectedVideoFormat = this.dvrVideoFormats.find((x: any) => x.value === videoFormat).text;
    let dvrVideoTypes: DvrReqVideoType[];
    if (videoFormat === 'MDVR') {
      const mdvrViewsArr: string[] = this.isEvoCamera ? [...mdvrViews] : [mdvrViews as string];
      const selectedMdvrSources = mdvrViewsArr.map((view) => this.availableMdvrViews.find((v2) => v2.view === view).source);
      selectedMdvrSources.sort((a, b) => MDVR_COLLAGE_SORTING_ARR.indexOf(a) - MDVR_COLLAGE_SORTING_ARR.indexOf(b));
      const collageConfig = MDVR_COLLAGE_CONFIG.find((c) => c.validSources === selectedMdvrSources.length);
      dvrVideoTypes = [
        {
          collage: collageConfig.collage,
          sources: selectedMdvrSources,
          resolution: videoResolution,
        },
      ];
    }
    const { assetId = '' } = this.tripDetails || {};

    this.gtmService.changeRequestVideoPageAvailableDurationFilter(dvrDuration);

    this.gtmService.changeRequestVideoPageVideoResolutionFilter(videoResolution);

    this.gtmService.changeRequestVideoPageVideoFormatFilter(videoFormat);

    this.dialog.open(RequestConfirmationComponent, {
      position: { top: '24px' },
      disableClose: true,
      autoFocus: false,
      width: '640px',
      minHeight: '480px',
      data: {
        dvrDuration: dvrDuration, // converting to minutes
        videoResolution,
        videoFormat: selectedVideoFormat,
        dvrVideoType: videoFormat,
        assetId,
        enabledTimelapse: dvrDuration > 180,
        tripDetails: this.tripDetails,
        selectedTimeUTC: this.selectedTimeUTC,
        selectedTimeLocal: this.selectedTimeLocal,
        dvrVideoTypes: dvrVideoTypes,
      },
    });
  }

  public toggleMarkers() {
    this.showMapMarkers = !this.showMapMarkers;
    this.showMapMarkers
      ? this.gtmService.toggleMarkersInRequestVideoPage('Enabled')
      : this.gtmService.toggleMarkersInRequestVideoPage('Disabled');
    this.mapMarkerList.forEach((marker) => {
      marker.getElement().style.visibility = this.showMapMarkers ? 'visible' : 'hidden';
    });
  }

  public showMedia(event: any = {}, marker?: boolean) {
    if (marker) {
      this.gtmService.viewSafteyEventFromRequestVideoMarker(event.eventTypeLabel);
    } else {
      this.gtmService.viewSafteyEventFromRequestVideoSlider(event.eventTypeLabel);
    }
    const updatedEvent = {
      ...event,
      tripId: this.tripParams?.tripId,
      driverId: this.tripParams?.driverId,
    };

    this.dialog.open(IncidentModalComponent, {
      panelClass: ['incident-modal', 'mobile-modal'],
      position: { top: '24px', bottom: '24px' },
      autoFocus: false,
      disableClose: true,
      data: {
        source: 'RequestVideo',
        allEvents: [updatedEvent],
        currentIndex: 0,
      },
    });
  }

  public switchLayer(layerId: string) {
    this.currentLayer = layerId;
    this.map.setStyle('mapbox://styles/mapbox/' + this.currentLayer);
    this.map.on('styledata', () => {
      if (!this.map.getSource('route')) {
        this.map.addSource('route', {
          type: 'geojson',
          data: this.polylineGeoJson,
        });
      }

      if (!this.map.getLayer('line-background')) {
        // add a line layer without line-dasharray defined to fill the gaps in the dashed line
        this.map.addLayer({
          type: 'line',
          source: 'route',
          id: 'line-background',
          paint: {
            'line-color': 'green',
            'line-width': 8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });
      }
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onVideoFormatChange(event: MatSelectChange) {
    const videoFormat = event.value;
    const videoResolutionCtrl = this.form.get('videoResolution');
    const dvrDurationCtrl = this.form.get('dvrDuration');
    if (videoFormat === 'MDVR') {
      this.form.addControl('mdvrViews', this.fb.control('', [Validators.required]));
      if (this.isEvoCamera) {
        videoResolutionCtrl.reset();
        videoResolutionCtrl.disable();
      } else {
        this.dvrDurations = DVR_DURATION_OPTIONS.map((d) => {
          if (d.groupId === 'TIMELAPSE') {
            const timelapseDurationsDisabled = d.options.map((o) => ({ ...o, disabled: true }));
            return {
              ...d,
              options: timelapseDurationsDisabled,
            };
          }
          return d;
        });
        dvrDurationCtrl.patchValue(60);
      }
    } else {
      this.dvrResolutions = DVR_RESOLUTION_OPTIONS;
      this.dvrDurations = DVR_DURATION_OPTIONS;
      videoResolutionCtrl.enable();
      this.form.removeControl('mdvrViews');
    }
  }

  public onMdvrViewsSelection(event: MatSelectChange) {
    const selectedViews = event.value;
    const videoResolutionCtrl = this.form.get('videoResolution');
    if (this.isEvoCamera) {
      videoResolutionCtrl.reset();
      if (selectedViews.length) {
        videoResolutionCtrl.enable();
        const collageConfig = MDVR_COLLAGE_CONFIG.find((c) => c.validSources === selectedViews.length);
        this.dvrResolutions = collageConfig.resolution.map((r) => ({ value: r, text: r }));
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
