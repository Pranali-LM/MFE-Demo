import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
})
export class MediaPlayerComponent implements OnInit, OnChanges {
  @Input()
  private mediaUrl = '';
  @Input()
  public isDriverImage = false;

  public isPlayable = true;
  public image = '';
  public video = '';

  constructor(private elRef: ElementRef) {}

  public ngOnInit() {
    this.assignRightMedia();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.mediaUrl = changes.mediaUrl.currentValue;
    this.assignRightMedia();
    const player = this.elRef.nativeElement.querySelector('video');
    if (player) {
      player.load();
    }
  }

  private assignRightMedia() {
    if (!this.mediaUrl) {
      return;
    }
    if (this.mediaUrl.indexOf('.jpg') > -1 || this.mediaUrl.indexOf('.jpeg') > -1 || this.mediaUrl.indexOf('.png') > -1) {
      this.image = this.mediaUrl;
      return;
    }
    if (this.mediaUrl.indexOf('.mp4') > -1) {
      this.video = this.mediaUrl;
      return;
    }
  }

  /**
   * Function called on error playing video
   * Make isPlayable flag as false.
   */
  public onVideoPlaybackError() {
    this.isPlayable = false;
  }
}
