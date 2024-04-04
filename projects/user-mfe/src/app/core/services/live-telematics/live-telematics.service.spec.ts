import { TestBed } from '@angular/core/testing';

import { LiveTelematicsService } from './live-telematics.service';

describe('LiveTelematicsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LiveTelematicsService = TestBed.get(LiveTelematicsService);
    expect(service).toBeTruthy();
  });
});
