import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverQueryComponent } from './driver-query.component';

describe('DriverQueryComponent', () => {
  let component: DriverQueryComponent;
  let fixture: ComponentFixture<DriverQueryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverQueryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
