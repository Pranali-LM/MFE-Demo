import { TestBed, async, inject } from '@angular/core/testing';

import { LandingPageGuard } from './landing-page.guard';

describe('LandingPageGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LandingPageGuard],
    });
  });

  it('should ...', inject([LandingPageGuard], (guard: LandingPageGuard) => {
    expect(guard).toBeTruthy();
  }));
});
