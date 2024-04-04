import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingThresholdComponent } from './coaching-threshold.component';

describe('CoachingThresholdComponent', () => {
  let component: CoachingThresholdComponent;
  let fixture: ComponentFixture<CoachingThresholdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoachingThresholdComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingThresholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
