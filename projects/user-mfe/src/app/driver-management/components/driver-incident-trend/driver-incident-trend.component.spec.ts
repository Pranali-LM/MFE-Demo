import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverIncidentTrendComponent } from './driver-incident-trend.component';

describe('DriverIncidentTrendComponent', () => {
  let component: DriverIncidentTrendComponent;
  let fixture: ComponentFixture<DriverIncidentTrendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverIncidentTrendComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverIncidentTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
