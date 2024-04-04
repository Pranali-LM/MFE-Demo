import { TestBed } from '@angular/core/testing';

import { EulaConsentService } from './eula-consent.service';

describe('EulaConsentService', () => {
  let service: EulaConsentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EulaConsentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
