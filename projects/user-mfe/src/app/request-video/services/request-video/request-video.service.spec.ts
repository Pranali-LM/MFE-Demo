import { TestBed } from '@angular/core/testing';

import { RequestVideoService } from './request-video.service';

describe('RequestVideoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RequestVideoService = TestBed.get(RequestVideoService);
    expect(service).toBeTruthy();
  });
});
