import { Component, Input } from '@angular/core';
import { DEFAULT_DATE_FORMAT, DEFAULT_TIMEZONE } from '@app-core/constants/constants';
import { GoogleTagManagerService } from '@app-core/services/google-tag-manager/google-tag-manager.service';
import { DeviceState, LiveDevice } from '@app-live-view/models/live-view.model';
import { LiveViewService } from '@app-live-view/services/live-view/live-view.service';

@Component({
  selector: 'app-live-asset-marker-popup',
  templateUrl: './live-asset-marker-popup.component.html',
  styleUrls: ['./live-asset-marker-popup.component.scss'],
})
export class LiveAssetMarkerPopupComponent {
  @Input()
  public device: LiveDevice;
  @Input()
  public timezone: string = DEFAULT_TIMEZONE;
  @Input()
  public dateFormat: string = DEFAULT_DATE_FORMAT;

  public deviceState = DeviceState;

  constructor(private liveViewService: LiveViewService, private gtmServive: GoogleTagManagerService) {}

  public navigateToTripDetailsPage(device: LiveDevice) {
    this.liveViewService.navigateToTripDetailsPage(device, 'marker');
  }

  public requestLiveStreamAction(device: LiveDevice) {
    this.gtmServive.viewLiveViewVideoMarkerAssetDetails(device.assetId);
    this.liveViewService.openLivestreamModal(device);
  }
}
