import { TestBed } from '@angular/core/testing';

import { TaggingService } from './tagging.service';

describe('TaggingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaggingService = TestBed.get(TaggingService);
    expect(service).toBeTruthy();
  });
});
