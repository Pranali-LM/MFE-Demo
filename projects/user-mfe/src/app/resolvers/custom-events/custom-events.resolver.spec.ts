import { TestBed } from '@angular/core/testing';

import { CustomEventsResolver } from './custom-events.resolver';

describe('CustomEventsResolver', () => {
  let resolver: CustomEventsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CustomEventsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
