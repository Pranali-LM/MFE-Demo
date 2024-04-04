import { TestBed } from '@angular/core/testing';

import { AllEventsResolver } from './all-events.resolver';

describe('AllEventsResolver', () => {
  let resolver: AllEventsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AllEventsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
