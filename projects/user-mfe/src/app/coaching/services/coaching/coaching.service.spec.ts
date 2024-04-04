import { TestBed } from '@angular/core/testing';

import { CoachingService } from './coaching.service';

describe('CoachingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoachingService = TestBed.get(CoachingService);
    expect(service).toBeTruthy();
  });
});
