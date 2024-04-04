import { inject, TestBed } from '@angular/core/testing';

import { DriverManagementService } from './driver-management.service';

describe('DriverManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DriverManagementService],
    });
  });

  it('should be created', inject([DriverManagementService], (service: DriverManagementService) => {
    expect(service).toBeTruthy();
  }));
});
