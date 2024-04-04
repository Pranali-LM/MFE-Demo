import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListV2Component } from './user-list-v2.component';

describe('UserListV2Component', () => {
  let component: UserListV2Component;
  let fixture: ComponentFixture<UserListV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserListV2Component],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
