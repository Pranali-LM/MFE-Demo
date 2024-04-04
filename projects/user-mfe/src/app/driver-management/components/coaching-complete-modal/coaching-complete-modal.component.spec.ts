import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingCompleteModalComponent } from './coaching-complete-modal.component';

describe('CoachingCompleteModalComponent', () => {
  let component: CoachingCompleteModalComponent;
  let fixture: ComponentFixture<CoachingCompleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoachingCompleteModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachingCompleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
