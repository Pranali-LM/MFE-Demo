import { inject, TestBed } from '@angular/core/testing';

import { RiderviewService } from './riderview.service';

describe('RiderviewService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RiderviewService],
    });
  });

  it('should be created', inject([RiderviewService], (service: RiderviewService) => {
    expect(service).toBeTruthy();
  }));
});
