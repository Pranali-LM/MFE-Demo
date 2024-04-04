import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverEnrollmentComponent } from './driver-enrollment.component';

describe('DriverEnrollmentComponent', () => {
  let component: DriverEnrollmentComponent;
  let fixture: ComponentFixture<DriverEnrollmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverEnrollmentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
