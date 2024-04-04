import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LivestreamTimerComponent } from './livestream-timer.component';

describe('LivestreamTimerComponent', () => {
  let component: LivestreamTimerComponent;
  let fixture: ComponentFixture<LivestreamTimerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LivestreamTimerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LivestreamTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
