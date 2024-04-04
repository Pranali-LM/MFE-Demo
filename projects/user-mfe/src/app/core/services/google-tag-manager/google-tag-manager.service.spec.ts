import { inject, TestBed } from '@angular/core/testing';

import { GoogleTagManagerService } from './google-tag-manager.service';

describe('GoogleTagManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleTagManagerService],
    });
  });

  it('should be created', inject([GoogleTagManagerService], (service: GoogleTagManagerService) => {
    expect(service).toBeTruthy();
  }));
});
