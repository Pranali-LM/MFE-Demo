import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appFullScreen]',
})
export class FullScreenDirective implements OnInit, OnDestroy {
  @Input('appFullScreen')
  private container;

  @Output()
  private changeFullscreenState: EventEmitter<boolean> = new EventEmitter<boolean>();

  private fullscreenchangeEvents = ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'];
  private isInFullscreen = false;

  constructor() {}

  public ngOnInit() {
    this.addFullScreenChangeListeners();
  }

  public ngOnDestroy() {
    this.removeFullScreenChangeListeners();
  }

  @HostListener('click', ['$event'])
  public toggleFullscreen() {
    if (this.isInFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private fullscreenchangeListener() {
    this.isInFullscreen = document['fullscreenElement'] ? true : false;
    this.changeFullscreenState.emit(this.isInFullscreen);
  }

  private addFullScreenChangeListeners() {
    this.fullscreenchangeEvents.forEach((event) => {
      document.addEventListener(event, this.fullscreenchangeListener.bind(this));
    });
  }

  private removeFullScreenChangeListeners() {
    this.fullscreenchangeEvents.forEach((event) => {
      document.removeEventListener(event, this.fullscreenchangeListener.bind(this));
    });
  }

  private enterFullscreen() {
    if (!this.container) {
      return;
    }
    if (this.container.requestFullscreen) {
      this.container.requestFullscreen();
    } else if (this.container.webkitRequestFullscreen) {
      this.container.webkitRequestFullscreen();
    } else if (this.container.mozRequestFullScreen) {
      this.container.mozRequestFullScreen();
    } else if (this.container.msRequestFullscreen) {
      this.container.msRequestFullscreen();
    } else {
      console.error('Fullscreen mode not supported.');
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
      console.error('Fullscreen mode not supported.');
    }
  }
}
