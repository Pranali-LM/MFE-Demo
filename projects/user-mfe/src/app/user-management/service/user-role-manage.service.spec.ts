import { TestBed } from '@angular/core/testing';

import { UserRoleManageService } from './user-role-manage.service';

describe('UserRoleManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserRoleManageService = TestBed.get(UserRoleManageService);
    expect(service).toBeTruthy();
  });
});
