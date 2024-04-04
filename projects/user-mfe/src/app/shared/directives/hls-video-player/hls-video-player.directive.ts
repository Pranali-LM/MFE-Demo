import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import Hls, { ErrorData, Events, ManifestParsedData } from 'hls.js';

@Directive({
  selector: '[appHlsVideoPlayer]',
})
export class HlsVideoPlayerDirective implements OnInit, OnDestroy, OnChanges {
  @Input('appHlsVideoPlayer')
  private stream: string;
  @Output()
  private hlsError = new EventEmitter<ErrorData>();

  private video: HTMLVideoElement;
  private hls: Hls;

  constructor(private el: ElementRef) {
    this.video = this.el.nativeElement;
  }

  public ngOnInit() {
    if (this.stream) {
      this.establishHlsStream();
    }
  }

  public ngOnDestroy() {
    this.destroyHlsStream();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.stream && changes.stream.currentValue) {
      this.establishHlsStream();
    }
  }

  private manifestParsedCallback(_: Events.MANIFEST_PARSED, data: ManifestParsedData) {
    console.log('manifest loaded, found ' + data.levels.length + ' quality level');
  }

  private mediaAttachedCallback() {
    this.hls.loadSource(this.stream);
  }

  private errorHandlingCallback(_: Events.ERROR, data: ErrorData) {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          const { networkDetails: { status = 0 } = {} } = data;
          if (status !== 403) {
            console.log('fatal network error encountered, try to recover');
            this.hls.startLoad();
          }
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.log('fatal media error encountered, try to recover');
          this.hls.recoverMediaError();
          break;
        default:
          this.hls.destroy();
          break;
      }
      this.hlsError.emit(data);
    }
  }

  private establishHlsStream() {
    this.destroyHlsStream();
    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.attachMedia(this.video);
      this.hls.on(Hls.Events.MEDIA_ATTACHED, this.mediaAttachedCallback.bind(this));
      this.hls.on(Hls.Events.MANIFEST_PARSED, this.manifestParsedCallback.bind(this));
      this.hls.on(Hls.Events.ERROR, this.errorHandlingCallback.bind(this));
    }
  }

  private destroyHlsStream() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}
