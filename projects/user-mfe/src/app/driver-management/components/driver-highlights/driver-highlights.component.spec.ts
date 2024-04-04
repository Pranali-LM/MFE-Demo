import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverHighlightsComponent } from './driver-highlights.component';

describe('DriverHighlightsComponent', () => {
  let component: DriverHighlightsComponent;
  let fixture: ComponentFixture<DriverHighlightsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverHighlightsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverHighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
