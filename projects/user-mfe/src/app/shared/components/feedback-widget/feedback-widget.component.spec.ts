import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackwidgetComponent } from './feedback-widget.component';

describe('FeedbackwidgetComponent', () => {
  let component: FeedbackwidgetComponent;
  let fixture: ComponentFixture<FeedbackwidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackwidgetComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
