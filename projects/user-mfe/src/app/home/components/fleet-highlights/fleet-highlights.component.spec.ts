import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FleetHighlightsComponent } from './fleet-highlights.component';

describe('FleetHighlightsComponent', () => {
  let component: FleetHighlightsComponent;
  let fixture: ComponentFixture<FleetHighlightsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FleetHighlightsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetHighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
