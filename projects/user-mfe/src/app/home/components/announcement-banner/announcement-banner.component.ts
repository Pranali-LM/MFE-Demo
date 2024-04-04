import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-announcement-banner',
  templateUrl: './announcement-banner.component.html',
  styleUrls: ['./announcement-banner.component.scss'],
})
export class AnnouncementBannerComponent implements OnInit {
  public loader = true;

  constructor() {}

  public ngOnInit(): void {
    setTimeout(() => {
      this.loader = false;
    }, 500);
  }
}
