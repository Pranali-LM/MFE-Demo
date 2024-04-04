import {
  Component,
  Input,
  SimpleChanges,
  ComponentFactoryResolver,
  ComponentFactory,
  Injector,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
  } from '@angular/core';
import { Map as MapboxMap } from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN } from '@app-request-video/constants/request-video.constants';
import mapboxgl from 'mapbox-gl';
import { MapTooltipComponent } from '../../components/map-tooltip/map-tooltip.component';
import { LIVEVIEW_ASSET_LIST_PAGE_SIZE, MAPBOX_DEFAULT_LAYER } from '@app-core/constants/constants';
import { LiveDevice } from '@app-core/models/core.model';
import { DeviceState } from '@app-live-view/models/live-view.model';
import { skip, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

@Component({
  selector: 'app-mapbox-liveview',
  templateUrl: './mapbox-liveview.component.html',
  styleUrls: ['./mapbox-liveview.component.scss'],
})
export class MapboxLiveviewComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() public allDeviceList = [];
  @Input() public zoom: number;
  @Input() public mapWidth = '100vw';
  @Input() public pageIndex: number;
  @Input()
  public customMapOptions: any = {};

  @Output() markerClick = new EventEmitter<any>();

  public map: MapboxMap;
  public currentLayer = MAPBOX_DEFAULT_LAYER;

  private tablePageSize = LIVEVIEW_ASSET_LIST_PAGE_SIZE;
  private bounds = new mapboxgl.LngLatBounds();
  private toolTipFactory: ComponentFactory<MapTooltipComponent>;
  private deviceList = [];
  private unsubscribeStateChange = new Subject();
  private devicesMarkerMap: Map<string, any> = new Map();
  public shouldFitBounds: boolean = true;
  
  constructor(private resolver: ComponentFactoryResolver, private injector: Injector) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ((changes.allDeviceList && changes.allDeviceList.currentValue && this.allDeviceList) || changes.pageIndex) {
      this.assignDeviceList();
    }

    if (changes.mapWidth && changes.mapWidth.currentValue) {
            // eslint-disable-next-line
      const { nativeElement: { style: { width: mapContainerElementWidth = 0 } = {} } = {} } = this.mapContainer || {};
      if (mapContainerElementWidth) {
        this.mapContainer.nativeElement.style.width = this.mapWidth;
        this.map?.resize();
      }
    }
  }

  private initializeMap() {
          this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
    });

    // Add the navigation control to the map
    const nav = new mapboxgl.NavigationControl();
    this.map.addControl(nav, 'top-left');
    this.map.addControl(new mapboxgl.FullscreenControl(), 'top-left');
  }

  private addMarker(device: LiveDevice) {
    const { longitude = 0, latitude = 0, bearing = 0 } = device.gpsData;
    if (longitude == 0 && latitude == 0) {
      return;
    }
    const template = this.getToolTipTemplate(device);
    const popupContent = template.innerHTML;
    const popup = this.createCustomPopup(popupContent);
    const currentDeviceState = device.state.getValue();
    const markerOptions: any = { element: this.createMarkerElement(currentDeviceState) };
    if (currentDeviceState === DeviceState.Active) {
      markerOptions.rotation = bearing;
    }

    const marker = new mapboxgl.Marker(markerOptions);

    marker.setPopup(popup);
    marker.setLngLat([longitude, latitude]);
    marker._popup = popup;
    marker.getElement().addEventListener('mouseenter', () => {
      marker.togglePopup();
    });

    // Hide the popup when no longer hovering over the marker
    marker.getElement().addEventListener('mouseleave', () => {
      marker.togglePopup();
    });

    const cordinates = {
      lng: longitude,
      lat: latitude,
    };

    marker.getElement().addEventListener('click', () => {
      if (device) {
        this.markerClick.emit(device);
      }
    });
    this.devicesMarkerMap.set(device.deviceId, marker);
    marker.addTo(this.map);

    this.bounds.extend([cordinates.lng, cordinates.lat]);
    if (this.deviceList.length === 1) {
      this.centerMapOnMarker(cordinates);
    }
  }

  private createMarkerElement(state: DeviceState): HTMLElement {
    // Create an HTML element containing your SVG image
    const markerElement = document.createElement('div');
    if (state === 'ACTIVE') {
      markerElement.innerHTML = `<img src="assets/common/green.svg"alt="My Icon">`;
    } else if (state === 'AMBER') {
      markerElement.innerHTML = `<img src="assets/common/amber.svg"alt="My Icon">`;
    } else {
      markerElement.innerHTML = `<img src="assets/common/red.svg"alt="My Icon">`;
    }
    return markerElement;
  }

  private listenForDeviceStateChange() {
    this.deviceList.forEach((device) => {
      // Skipping the first value since state is a behaviour subject and emits current value to new subscribers
      // We are only interested in change of state when timer triggers
      device.state.pipe(takeUntil(this.unsubscribeStateChange), skip(1)).subscribe((currentDeviceState) => {
        if (currentDeviceState !== DeviceState.Amber) {
          return;
        }
        const marker = this.devicesMarkerMap.get(device.deviceId);
        if (marker) {
          marker.remove();
          this.devicesMarkerMap.delete(device.deviceId);
          this.addMarker(device);
        }
      });
    });
  }

  private setMarkerValue() {
    if (this.devicesMarkerMap.size) {
      // check and remove previous markers before adding new markers
      this.devicesMarkerMap.forEach((marker) => {
        marker.remove();
      });
      this.devicesMarkerMap.clear(); // Clear the markers array
      this.bounds = new mapboxgl.LngLatBounds(); // Clear previous bounds
    }
    this.deviceList.map((device) => {
      this.addMarker(device);
    });
    if (this.shouldFitBounds) {
      this.fitBounds();
      this.shouldFitBounds = false;
    }
    this.unsubscribeStateChange.next();
    this.listenForDeviceStateChange();
  }

  private getToolTipTemplate(data: LiveDevice) {
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
      focusAfterOpen: false,
      className: 'custom-mapbox-popup',
    });
    popup.setMaxWidth('360px');
    popup.setHTML(content);
    return popup;
  }

  public fitBounds() {
    if (!this.bounds.isEmpty()) {
      this.map.fitBounds(this.bounds, { padding: 100 });
    }
  }

  private centerMapOnMarker(cordinates: { lng: number; lat: number }) {
    this.map.easeTo({
      center: [cordinates.lng, cordinates.lat],
      zoom: 15,
      essential: true, // This ensures a smooth animation
    });
  }

  public switchLayer(layerId: string) {
    this.currentLayer = layerId;
    this.map.setStyle('mapbox://styles/mapbox/' + this.currentLayer);
  }

  private assignDeviceList() {
    if (this.allDeviceList?.length === 1) {
      this.deviceList = [...this.allDeviceList];
    } else {
      const start = this.pageIndex * this.tablePageSize;
      const end = start + this.tablePageSize;
      this.deviceList = [...this.allDeviceList.slice(start, end)];
    }
    this.setMarkerValue();
      }

  public onRecenterBtnClick() {
    this.fitBounds();
  }

  ngOnDestroy(): void {
    this.unsubscribeStateChange.next();
    this.unsubscribeStateChange.complete();
  }
}
