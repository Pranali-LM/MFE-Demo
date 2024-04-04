import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDetailsModalComponent } from './session-details-modal.component';

describe('SessionDetailsModalComponent', () => {
  let component: SessionDetailsModalComponent;
  let fixture: ComponentFixture<SessionDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
