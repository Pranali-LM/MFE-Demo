import { TestBed } from '@angular/core/testing';

import { CoachingConfigResolver } from './coaching-config.resolver';

describe('CoachingConfigResolver', () => {
  let resolver: CoachingConfigResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CoachingConfigResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
