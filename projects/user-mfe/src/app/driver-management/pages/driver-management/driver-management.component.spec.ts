import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverManagementComponent } from './driver-management.component';

describe('DriverManagementComponent', () => {
  let component: DriverManagementComponent;
  let fixture: ComponentFixture<DriverManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverManagementComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
