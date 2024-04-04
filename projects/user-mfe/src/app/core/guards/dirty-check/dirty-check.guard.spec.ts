import { inject, TestBed } from '@angular/core/testing';

import { DirtyCheckGuard } from './dirty-check.guard';

describe('DirtyCheckGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirtyCheckGuard],
    });
  });

  it('should ...', inject([DirtyCheckGuard], (guard: DirtyCheckGuard) => {
    expect(guard).toBeTruthy();
  }));
});
