import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiveViewMapComponent } from './live-view-map.component';

describe('LiveViewMapComponent', () => {
  let component: LiveViewMapComponent;
  let fixture: ComponentFixture<LiveViewMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LiveViewMapComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveViewMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
