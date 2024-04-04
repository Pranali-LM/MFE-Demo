import { inject, TestBed } from '@angular/core/testing';

import { AssetConfigurationService } from './asset-configuration.service';

describe('AssetConfigurationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetConfigurationService],
    });
  });

  it('should be created', inject([AssetConfigurationService], (service: AssetConfigurationService) => {
    expect(service).toBeTruthy();
  }));
});
