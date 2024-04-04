import { TestBed } from '@angular/core/testing';

import { LiveTelematicsResolverService } from './live-telematics-resolver.service';

describe('LiveTelematicsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LiveTelematicsResolverService = TestBed.get(LiveTelematicsResolverService);
    expect(service).toBeTruthy();
  });
});
