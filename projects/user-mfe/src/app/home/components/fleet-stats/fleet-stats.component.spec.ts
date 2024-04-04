import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FleetStatsComponent } from './fleet-stats.component';

describe('DistanceComponent', () => {
  let component: FleetStatsComponent;
  let fixture: ComponentFixture<FleetStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FleetStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
