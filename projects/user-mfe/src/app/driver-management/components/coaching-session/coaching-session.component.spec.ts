import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingSessionComponent } from './coaching-session.component';

describe('CoachingSessionComponent', () => {
  let component: CoachingSessionComponent;
  let fixture: ComponentFixture<CoachingSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoachingSessionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
