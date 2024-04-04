import { TestBed } from '@angular/core/testing';
import { IncidentDetailsService } from './incident-stats.service';

describe('IncidentDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IncidentDetailsService = TestBed.get(IncidentDetailsService);
    expect(service).toBeTruthy();
  });
});
