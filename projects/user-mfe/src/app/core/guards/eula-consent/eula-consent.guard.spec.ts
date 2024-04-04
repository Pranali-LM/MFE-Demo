import { TestBed } from '@angular/core/testing';

import { EulaConsentGuard } from './eula-consent.guard';

describe('EulaConsentGuard', () => {
  let guard: EulaConsentGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EulaConsentGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
