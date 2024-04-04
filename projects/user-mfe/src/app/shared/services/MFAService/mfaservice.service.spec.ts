import { TestBed } from '@angular/core/testing';

import { MFAServiceService } from './mfaservice.service';

describe('MFAServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MFAServiceService = TestBed.get(MFAServiceService);
    expect(service).toBeTruthy();
  });
});
