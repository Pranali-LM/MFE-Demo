import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingPanelComponent } from './coaching-panel.component';

describe('CoachingPanelComponent', () => {
  let component: CoachingPanelComponent;
  let fixture: ComponentFixture<CoachingPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoachingPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
