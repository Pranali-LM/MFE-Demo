import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TripSettingsComponent } from './trip-settings.component';

describe('TripSettingsComponent', () => {
  let component: TripSettingsComponent;
  let fixture: ComponentFixture<TripSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TripSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
