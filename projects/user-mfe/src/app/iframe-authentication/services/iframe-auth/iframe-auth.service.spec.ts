import { TestBed } from '@angular/core/testing';

import { IframeAuthService } from './iframe-auth.service';

describe('IframeAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IframeAuthService = TestBed.get(IframeAuthService);
    expect(service).toBeTruthy();
  });
});
