import { TestBed } from '@angular/core/testing';

import { LiveViewMapService } from './live-view-map.service';

describe('LiveViewMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LiveViewMapService = TestBed.get(LiveViewMapService);
    expect(service).toBeTruthy();
  });
});
