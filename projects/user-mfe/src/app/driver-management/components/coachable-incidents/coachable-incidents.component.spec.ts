import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachableIncidentsComponent } from './coachable-incidents.component';

describe('CoachableIncidentsComponent', () => {
  let component: CoachableIncidentsComponent;
  let fixture: ComponentFixture<CoachableIncidentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoachableIncidentsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachableIncidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
