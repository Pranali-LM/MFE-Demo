import { inject, TestBed } from '@angular/core/testing';

import { LiveViewGuard } from './live-view.guard';

describe('HomePageGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LiveViewGuard],
    });
  });

  it('should ...', inject([LiveViewGuard], (guard: LiveViewGuard) => {
    expect(guard).toBeTruthy();
  }));
});
